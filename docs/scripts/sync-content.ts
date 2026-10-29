// Génère les pages de référence depuis les sources du cœur : une seule source de vérité,
// la doc ne dérive jamais du code. Lancé par `bun run dev|build` ; sorties ignorées par git.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

import { REPO_URL } from '../src/site.ts'

const DOCS = resolve(import.meta.dir, '..')
const CORE = resolve(DOCS, '..')
const REFERENCE = join(DOCS, 'src/content/docs/reference')
const MODULES_OUT = join(REFERENCE, 'modules')
const GENERATED = join(DOCS, 'src/generated')

const read = (path: string) => readFileSync(join(CORE, path), 'utf8')
const readJson = <T>(path: string) => JSON.parse(read(path)) as T
const dirs = (path: string) =>
  readdirSync(join(CORE, path), { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => d.name)
    .sort()
const editUrl = (path: string) => `${REPO_URL}/edit/main/${path}`
const code = (value: string) => `\`${value}\``
const cell = (value: string) => value.replace(/\|/g, '\\|').replace(/\n+/g, ' ')

function yamlString(value: string) {
  return JSON.stringify(value)
}

function page(front: Record<string, string | number | Record<string, string | number>>, body: string) {
  const lines = Object.entries(front).map(([key, value]) =>
    typeof value === 'object'
      ? `${key}:\n${Object.entries(value).map(([k, v]) => `  ${k}: ${typeof v === 'number' ? v : yamlString(v)}`).join('\n')}`
      : `${key}: ${typeof value === 'number' ? value : yamlString(value)}`,
  )
  return `---\n${lines.join('\n')}\n---\n\n${body.trim()}\n`
}

const generatedNote = (sources: string[]) =>
  `:::note[Page générée]\nGénérée depuis ${sources.map(code).join(', ')} à chaque build du site : modifier la source, pas cette page.\n:::`

/** Frontmatter YAML minimal (clés simples et listes) des règles et skills du cœur. */
function parseFrontmatter(text: string): { data: Record<string, string | string[]>; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text)
  if (!match) return { data: {}, body: text }
  const data: Record<string, string | string[]> = {}
  let listKey: string | undefined
  for (const line of match[1]!.split('\n')) {
    const item = /^\s+-\s+(.*)$/.exec(line)
    if (item && listKey) {
      ;(data[listKey] as string[]).push(item[1]!.replace(/^["']|["']$/g, ''))
      continue
    }
    const pair = /^([\w-]+):\s*(.*)$/.exec(line)
    if (!pair) continue
    listKey = pair[2] ? undefined : pair[1]
    data[pair[1]!] = pair[2] ? pair[2].replace(/^["']|["']$/g, '') : []
  }
  return { data, body: text.slice(match[0].length) }
}

/** Retire le titre H1 et renvoie [titre, reste]. */
function splitTitle(markdown: string): [string, string] {
  const match = /^#\s+(.+)\n+/.exec(markdown.trimStart())
  return match ? [match[1]!.trim(), markdown.trimStart().slice(match[0].length)] : ['', markdown]
}

/** Coupe une liste au premier niveau (hors parenthèses, crochets, accolades et chaînes). */
function splitTopLevel(source: string): string[] {
  const parts: string[] = []
  let depth = 0
  let quote: string | undefined
  let current = ''
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]!
    // commentaires recopiés tels quels : une apostrophe dedans n'ouvre pas de chaîne
    if (!quote && ch === '/' && (source[i + 1] === '*' || source[i + 1] === '/')) {
      const close = source[i + 1] === '*' ? source.indexOf('*/', i + 2) + 2 : source.indexOf('\n', i)
      const stop = close > i ? close : source.length
      current += source.slice(i, stop)
      i = stop - 1
      continue
    }
    current += ch
    if (quote) {
      if (ch === '\\') current += source[++i] ?? ''
      else if (ch === quote) quote = undefined
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch
    else if ('([{'.includes(ch)) depth++
    else if (')]}'.includes(ch)) depth--
    else if (ch === ',' && depth === 0) {
      parts.push(current.slice(0, -1))
      current = ''
    }
  }
  if (current.trim()) parts.push(current)
  return parts
}

type ConfigField = { key: string; schema: string; doc: string }

/** Champs de `export const xConfig = z.object({...})` avec leur commentaire JSDoc. */
function parseModuleConfig(source: string): ConfigField[] {
  const start = /export const \w+ = z\.object\(\{/.exec(source)
  if (!start) return []
  let depth = 1
  let end = start.index + start[0].length
  while (depth > 0 && end < source.length) {
    const ch = source[end++]
    if (ch === '{') depth++
    else if (ch === '}') depth--
  }
  const inner = source.slice(start.index + start[0].length, end - 1)
  return splitTopLevel(inner)
    .map((raw) => {
      const doc = [...raw.matchAll(/\/\*\*([\s\S]*?)\*\//g)].map((m) => m[1]!.replace(/^\s*\*\s?/gm, '').trim()).join(' ')
      const withoutComments = raw.replace(/\/\*\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').trim()
      const field = /^(\w+)\s*:\s*([\s\S]+)$/.exec(withoutComments)
      return field ? { key: field[1]!, schema: field[2]!.replace(/\s+/g, ' ').replace(/ \./g, '.').trim(), doc } : undefined
    })
    .filter((f): f is ConfigField => Boolean(f))
}

/** Noms exportés par `export { a, b, type C } from './x'` (hors export par défaut). */
function parseExports(source: string): { name: string; type: boolean }[] {
  return [...source.matchAll(/export\s+(type\s+)?\{([^}]+)\}\s+from/g)].flatMap((m) =>
    m[2]!
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => ({ name: s.replace(/^type\s+/, '').split(/\s+as\s+/).pop()!, type: Boolean(m[1]) || s.startsWith('type ') })),
  )
}

type ModuleJson = {
  title: string
  description: string
  requires?: string[]
  dependencies?: string[]
  routes?: { file: string; export: string }[]
  tabs?: { name: string; icon: string; titleKey: string }[]
  env?: string[]
  migrations?: string[]
  functions?: string[]
  defaultConfig?: Record<string, unknown>
}

function modulePage(slug: string, order: number) {
  const meta = readJson<ModuleJson>(`modules/${slug}/module.json`)
  const pkg = readJson<{ name: string }>(`modules/${slug}/package.json`).name
  const index = read(`modules/${slug}/index.ts`)
  const [, readme] = splitTitle(read(`modules/${slug}/README.md`))
  const fields = existsSync(join(CORE, `modules/${slug}/config.ts`)) ? parseModuleConfig(read(`modules/${slug}/config.ts`)) : []
  const exports = parseExports(index)
  const list = (values: string[] | undefined, none = 'aucune') => (values?.length ? values.map(code).join(', ') : none)

  const facts: [string, string][] = [
    ['Paquet', code(pkg)],
    ['Activer', code(`bun daroms module add ${slug}`)],
    ['Requiert', list(meta.requires, 'aucun module')],
    ['Dépendances natives', list(meta.dependencies)],
    ['Routes ajoutées', meta.routes?.length ? meta.routes.map((r) => `${code(r.file)} (${code(r.export)})`).join(', ') : 'aucune'],
    ['Onglets', meta.tabs?.length ? meta.tabs.map((t) => `${code(t.name)} (icône ${code(t.icon)})`).join(', ') : 'aucun'],
    ['Migrations', list(meta.migrations)],
    ['Edge functions', list(meta.functions)],
    ["Variables d'environnement", list(meta.env)],
    ['Gate de navigation', /gate:\s*true/.test(index) ? 'oui (décide de la redirection au démarrage)' : 'non'],
    ['Section de réglages', /useSettings:/.test(index) ? 'oui (ajoutée au module settings)' : 'non'],
  ]
  const modals = /modals:\s*\[([^\]]*)\]/.exec(index)?.[1]
  if (modals) facts.push(['Modales', modals.replace(/['"\s]/g, '').split(',').map(code).join(', ')])

  const config = fields.length
    ? [
        `## Configuration`,
        `Dans ${code(`app.manifest.ts > modules['${slug}']`)}, validée par ${code(`modules/${slug}/config.ts`)} au démarrage.`,
        `| Clé | Schéma zod | Rôle |\n|---|---|---|\n${fields.map((f) => `| ${code(f.key)} | ${code(cell(f.schema))} | ${cell(f.doc) || '-'} |`).join('\n')}`,
        meta.defaultConfig && Object.keys(meta.defaultConfig).length
          ? `Valeurs écrites par ${code('module add')} :\n\n\`\`\`json\n${JSON.stringify(meta.defaultConfig, null, 2)}\n\`\`\``
          : '',
      ].join('\n\n')
    : ''

  const values = exports.filter((e) => !e.type).map((e) => e.name)
  const types = exports.filter((e) => e.type).map((e) => e.name)
  const exportsSection = exports.length
    ? [
        `## Exports`,
        `\`\`\`ts\nimport { ${values.slice(0, 3).join(', ')} } from '${pkg}'\n\`\`\``,
        `- Valeurs : ${values.map(code).join(', ') || 'aucune'}`,
        types.length ? `- Types : ${types.map(code).join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n\n')
    : ''

  const body = [
    meta.description + '.',
    generatedNote([`modules/${slug}/README.md`, 'module.json', 'config.ts', 'index.ts']),
    `## Fiche technique\n\n| | |\n|---|---|\n${facts.map(([k, v]) => `| ${k} | ${v} |`).join('\n')}`,
    `## Mise en place et usage\n\n${readme.trim()}`,
    config,
    exportsSection,
  ]
    .filter(Boolean)
    .join('\n\n')

  return page(
    {
      title: `${meta.title} (${slug})`,
      description: `Module ${slug} : ${meta.description}.`,
      editUrl: editUrl(`modules/${slug}/README.md`),
      sidebar: { label: slug, order },
    },
    body,
  )
}

function componentsPage() {
  const [, catalog] = splitTitle(read('packages/ui/CATALOG.md'))
  const body = catalog
    .replace(/<!--[\s\S]*?-->\n?/g, '')
    .replace(/^Lire ce fichier, jamais les sources\.\s*/m, '')
    .replace(/^(\| Composant \|)/m, '## Composants\n\n$1')
  return page(
    {
      title: 'Composants @daroms/ui',
      description: "Catalogue des composants @daroms/ui : props clés et exemple d'usage, tokens Tamagui v3 et icônes Lucide disponibles.",
      editUrl: editUrl('packages/ui/src/components'),
    },
    [
      'Une ligne par composant, avec ses props clés et un exemple. Les états (chargement, désactivé, pressé), l’accessibilité et l’haptique sont intégrés.',
      generatedNote(['packages/ui/CATALOG.md']),
      ':::tip[Pour un agent]\nDans une app, lire `core/packages/ui/CATALOG.md` (même contenu) plutôt que les sources des composants : c’est le contrat, et il coûte une soixantaine de lignes.\n:::',
      body,
    ].join('\n\n'),
  )
}

type Rule = { name: string; summary: string; paths: string[]; body: string; onDemand: boolean }

function readRules(dir: string, onDemand: boolean): Rule[] {
  return readdirSync(join(CORE, dir))
    .filter((f) => f.startsWith('daroms-') && f.endsWith('.md'))
    .sort()
    .map((file) => {
      const { data, body } = parseFrontmatter(read(`${dir}/${file}`))
      const [, rest] = splitTitle(body)
      const summary = /^>\s*(.+)$/m.exec(rest)?.[1]?.trim() ?? ''
      return { name: basename(file, '.md'), summary, paths: (data.paths as string[] | undefined) ?? [], body: rest.replace(/^>.*\n+/m, '').trim(), onDemand }
    })
}

function rulesPage(rules: Rule[]) {
  const table = rules
    .map((r) => `| [${r.name}](#${r.name}) | ${cell(r.summary)} | ${r.onDemand ? 'à la demande' : r.paths.map(code).join(', ')} |`)
    .join('\n')
  const sections = rules
    .map((r) =>
      [
        `## ${r.name}`,
        `> ${r.summary}`,
        r.onDemand ? 'Chargement : lue quand le sujet arrive (le digest la liste).' : `Chargement : quand Claude lit ou écrit ${r.paths.map(code).join(', ')}.`,
        r.body,
      ].join('\n\n'),
    )
    .join('\n\n')
  return page(
    {
      title: 'Règles du framework',
      description: 'Toutes les règles de code daroms : résumé, fichiers concernés, détail, et ce qui les vérifie (ESLint, hooks, générateurs, agents).',
      editUrl: editUrl('_ai/rules'),
    },
    [
      'Les règles vivent dans `_ai/rules/` (chargées selon les fichiers touchés, frontmatter `paths:`) et `_ai/rules-ondemand/` (lues quand le sujet arrive). Le noyau `_ai/CLAUDE.core.md` les résume et reste toujours chargé.',
      generatedNote(['_ai/rules/*.md', '_ai/rules-ondemand/*.md']),
      `## Qui vérifie quoi\n\n${read('docs/src/partials/verification-regles.md').trim()}`,
      `## Index\n\n| Règle | Résumé | Chargée pour |\n|---|---|---|\n${table}`,
      sections,
    ].join('\n\n'),
  )
}

type Skill = { name: string; description: string; argument: string; manual: boolean }

function readSkills(): Skill[] {
  return dirs('_ai/skills')
    .filter((d) => d.startsWith('daroms-'))
    .map((d) => {
      const { data } = parseFrontmatter(read(`_ai/skills/${d}/SKILL.md`))
      return {
        name: String(data.name ?? d),
        description: String(data.description ?? ''),
        argument: String(data['argument-hint'] ?? ''),
        manual: data['disable-model-invocation'] === 'true',
      }
    })
}

function skillsPage(skills: Skill[]) {
  const agents = readdirSync(join(CORE, '_ai/agents'))
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => parseFrontmatter(read(`_ai/agents/${f}`)).data)
  const vendor = read('_ai/skills/vendor/README.md')
  const vendorTable = vendor.split('\n').filter((l) => l.startsWith('|')).join('\n')
  return page(
    {
      title: 'Skills et agents',
      description: 'Les commandes Claude daroms-* (skills), les sous-agents designer, reviewer et store, et les skills tiers figés.',
      editUrl: editUrl('_ai/skills'),
    },
    [
      'Un skill est une commande Claude (`/daroms-screen`) : étapes numérotées, décisions déjà prises, appels à la CLI, point d’arrêt clair. Seule la description est chargée en permanence ; le contenu arrive à l’invocation.',
      generatedNote(['_ai/skills/*/SKILL.md', '_ai/agents/*.md', '_ai/skills/vendor/README.md']),
      `## Skills du cœur\n\n| Commande | Argument | Rôle | Invocation |\n|---|---|---|---|\n${skills
        .map((s) => `| ${code('/' + s.name)} | ${s.argument ? code(s.argument) : '-'} | ${cell(s.description)} | ${s.manual ? 'par l’humain uniquement' : 'humain ou Claude'} |`)
        .join('\n')}`,
      '« Par l’humain uniquement » : `disable-model-invocation: true`, Claude ne lance pas ce skill de lui-même (création d’app, soumission aux stores, journée complète).',
      `## Sous-agents\n\nIls travaillent dans un contexte séparé et renvoient un résumé court.\n\n| Agent | Rôle | Outils |\n|---|---|---|\n${agents
        .map((a) => `| ${code(String(a.name))} | ${cell(String(a.description))} | ${code(String(a.tools ?? ''))} |`)
        .join('\n')}`,
      `## Skills tiers figés\n\nCopiés tels quels dans \`_ai/skills/vendor/\` et chargés en \`name-only\` (nom seul) pour ne pas payer leur description à chaque tour. \`daroms-design-system\` traduit leurs conseils vers \`@daroms/ui\`.\n\n${vendorTable}`,
    ].join('\n\n'),
  )
}

function main() {
  rmSync(MODULES_OUT, { recursive: true, force: true })
  mkdirSync(MODULES_OUT, { recursive: true })
  mkdirSync(GENERATED, { recursive: true })

  const modules = dirs('modules')
  modules.forEach((slug, i) => writeFileSync(join(MODULES_OUT, `${slug}.md`), modulePage(slug, i + 1)))
  writeFileSync(join(REFERENCE, 'composants.md'), componentsPage())
  const rules = [...readRules('_ai/rules', false), ...readRules('_ai/rules-ondemand', true)]
  writeFileSync(join(REFERENCE, 'regles.md'), rulesPage(rules))
  const skills = readSkills()
  writeFileSync(join(REFERENCE, 'skills.md'), skillsPage(skills))

  const catalog = read('packages/ui/CATALOG.md')
  const components = catalog.split('## Tokens')[0]!.split('\n').filter((l) => /^\| [A-Z]/.test(l) && !l.startsWith('| Composant')).length
  const facts = {
    version: read('VERSION').trim(),
    components,
    icons: Number(/Icônes Lucide \((\d+)\)/.exec(catalog)?.[1] ?? 0),
    modules: modules.map((slug) => ({ slug, ...readJson<ModuleJson>(`modules/${slug}/module.json`) })).map(({ slug, title, description }) => ({ slug, title, description })),
    variants: ['blank', ...dirs('template/variants')],
    skills: skills.length,
    agents: readdirSync(join(CORE, '_ai/agents')).filter((f) => f.endsWith('.md')).length,
    hooks: readdirSync(join(CORE, '_ai/hooks')).filter((f) => /^daroms-.*\.py$/.test(f)).length,
    rules: rules.filter((r) => !r.onDemand).length,
    rulesOnDemand: rules.filter((r) => r.onDemand).length,
    commands: [...read('cli/daroms.ts').matchAll(/^\s+'?([a-z0-9-]+)'?: \{ describe:/gm)].map((m) => m[1]),
  }
  writeFileSync(join(GENERATED, 'core.json'), JSON.stringify(facts, null, 2) + '\n')
  console.log(`docs : ${modules.length} modules, ${components} composants, ${rules.length} règles, ${skills.length} skills générés`)
}

main()
