import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { bool, flag, type Args } from '../lib/args'
import { writeDbTypes, readSchema, saveSchema } from '../lib/dbtypes'
import { run } from '../lib/exec'
import { parseFields, sqlColumn, zodInput, zodRow } from '../lib/fields'
import { camel, pascal, render, walk, writeFile } from '../lib/fsx'
import { addLocaleKeys } from '../lib/locales'
import { fail, log } from '../lib/log'
import { loadManifest, saveManifest } from '../lib/manifest'
import { appRoot, CORE_DIR, findAppRoot } from '../lib/paths'
import { regenerateRouteTypes } from '../lib/routes'

const GEN = join(CORE_DIR, 'generators')
const tpl = (kind: string, file: string, vars: Record<string, string>) => render(readFileSync(join(GEN, kind, 'files', file), 'utf8'), vars)
const humanize = (slug: string) => slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

function guard(path: string, force: boolean) {
  if (existsSync(path) && !force) fail(`existe déjà : ${path} (--force pour écraser)`)
}

/** g screen <nom> [--tab --icon Star] [--route chemin] [--title "Titre"] [--feature-only] */
export async function screen(root: string, slug: string, args: Args, withRoute: boolean) {
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) fail('nom en kebab-case (ex. todo-detail)')
  const vars: Record<string, string> = { slug, key: camel(slug), Name: pascal(slug), camel: camel(slug), Icon: flag(args, 'icon') ?? 'Inbox' }
  // champ affiché dans la liste : premier champ texte de la table liée (sinon title)
  const linked = Object.entries(readSchema(root).tables).find(([table]) => table.replace(/_/g, '-') === slug)?.[1]
  vars.displayField = linked?.fields.find((f) => f.type === 'text')?.name ?? 'title'
  const tab = bool(args, 'tab')
  vars.headerProps = tab ? 'large ' : 'back '
  const dir = join(root, 'src', 'features', slug)
  const force = bool(args, 'force')
  guard(join(dir, `${vars.Name}Screen.tsx`), force)
  writeFile(join(dir, `${vars.Name}Screen.tsx`), tpl('screen', 'Screen.tsx', vars))
  // si une table a déjà généré api.ts (useTodos...), l'écran s'y branche directement
  const apiFile = join(dir, 'api.ts')
  vars.queryHook = existsSync(apiFile) && readFileSync(apiFile, 'utf8').includes(`export function use${vars.Name}(`) ? `use${vars.Name}` : `use${vars.Name}Query`
  writeFile(join(dir, 'hooks.ts'), tpl('screen', 'hooks.ts', vars))
  // api.ts et schema.ts ne sont jamais écrasés (ils peuvent venir de `g table` ou avoir été complétés)
  if (!existsSync(join(dir, 'api.ts'))) writeFile(join(dir, 'api.ts'), tpl('screen', 'api.ts', vars))
  if (!existsSync(join(dir, 'schema.ts'))) writeFile(join(dir, 'schema.ts'), tpl('screen', 'schema.ts', vars))
  writeFile(join(dir, `${vars.Name}Screen.test.tsx`), tpl('screen', 'Screen.test.tsx', vars))
  const title = flag(args, 'title') ?? humanize(slug)
  const titleEn = flag(args, 'title-en') ?? title
  addLocaleKeys(root, {
    [`${vars.key}.title`]: { fr: title, en: titleEn },
    [`${vars.key}.emptyTitle`]: { fr: 'Rien pour le moment', en: 'Nothing here yet' },
    [`${vars.key}.emptyDescription`]: { fr: 'Les éléments apparaîtront ici.', en: 'Items will show up here.' },
    ...(tab ? { [`tabs.${vars.key}`]: { fr: title, en: titleEn } } : {}),
  })
  if (!withRoute) return log.ok(`feature ${slug} créée (src/features/${slug}/)`)
  const route = flag(args, 'route') ?? (tab ? `(tabs)/${slug}` : slug)
  const routeFile = join(root, 'app', `${route}.tsx`)
  guard(routeFile, force)
  writeFile(routeFile, tpl('screen', 'route.tsx', vars))
  const manifest = await loadManifest(root)
  manifest.screens = [...new Set([...manifest.screens, slug])]
  if (tab && !manifest.tabs.some((t) => t.name === slug)) manifest.tabs.push({ name: slug, icon: vars.Icon!, titleKey: `tabs.${vars.key}` })
  saveManifest(root, manifest)
  await regenerateRouteTypes(root)
  log.ok(`écran ${slug} : app/${route}.tsx -> src/features/${slug}/ (4 états, clés i18n, test)`)
}

/** g table <nom> --fields "title:text, done:bool=false" [--feature nom] [--singular nom] */
export async function table(root: string, name: string, args: Args) {
  if (!/^[a-z][a-z0-9_]*$/.test(name)) fail('nom de table en snake_case pluriel (ex. todos)')
  const fields = parseFields(flag(args, 'fields') ?? fail('--fields "titre:text, fait:bool=false" requis'))
  const singular = flag(args, 'singular') ?? name.replace(/ies$/, 'y').replace(/s$/, '')
  const feature = flag(args, 'feature') ?? name.replace(/_/g, '-')
  const vars = {
    table: name,
    Singular: pascal(singular.replace(/_/g, '-')),
    Plural: pascal(name.replace(/_/g, '-')),
    camelPlural: camel(name.replace(/_/g, '-')),
    columns: fields.map(sqlColumn).join('\n'),
    zodFields: fields.map(zodRow).join('\n'),
    inputFields: fields.map(zodInput).join('\n'),
  }
  const migrations = join(root, 'supabase', 'migrations')
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
  if (!walk(migrations).some((f) => f.endsWith('_daroms_init.sql'))) {
    writeFile(join(migrations, `${stamp.slice(0, 12)}00_daroms_init.sql`), tpl('table', 'init.sql', vars))
  }
  writeFile(join(migrations, `${stamp}_create_${name}.sql`), tpl('table', 'migration.sql', vars))
  const dir = join(root, 'src', 'features', feature)
  writeFile(join(dir, 'schema.ts'), tpl('table', 'schema.ts', vars))
  writeFile(join(dir, 'api.ts'), tpl('table', 'api.ts', vars))
  const schema = readSchema(root)
  schema.tables[name] = { fields: fields.map(({ name: n, type, nullable, defaultValue }) => ({ name: n, type, nullable, defaultValue })) }
  saveSchema(root, schema)
  writeDbTypes(root)
  log.ok(`table ${name} : migration RLS, src/features/${feature}/{schema,api}.ts, types db.ts (hors ligne)`)
}

/** g module <slug> --description "..." : squelette dans core/modules (dépôt cœur). */
function moduleSkeleton(slug: string, args: Args) {
  const dir = join(CORE_DIR, 'modules', slug)
  guard(dir, false)
  const vars = { slug, Name: pascal(slug), camel: camel(slug), description: flag(args, 'description') ?? `Module ${slug}` }
  for (const file of walk(join(GEN, 'module', 'files'))) {
    const rel = file.slice(join(GEN, 'module', 'files').length + 1)
    writeFile(join(dir, rel), render(readFileSync(file, 'utf8'), vars))
  }
  if (findAppRoot()) log.warn('module créé dans core/ : le committer dans le dépôt cœur (fichiers daroms)')
  log.ok(`module ${slug} créé : core/modules/${slug}/ (index, config, plugin, module.json, locales)`)
}

export async function generate(args: Args) {
  const [kind, name] = args._
  if (!kind || !name) fail('usage : daroms g screen|feature|table|module <nom> [options]')
  if (kind === 'module') return moduleSkeleton(name, args)
  const root = appRoot()
  if (kind === 'screen') return screen(root, name, args, true)
  if (kind === 'feature') return screen(root, name, args, false)
  if (kind === 'table') return table(root, name, args)
  fail(`générateur inconnu : ${kind}`)
}

/** icons add <Nom...> : icônes Lucide supplémentaires pour l'app (src/icons). */
export async function icons(args: Args) {
  const [action, ...names] = args._
  if (action !== 'add' || names.length === 0) fail('usage : daroms icons add NomLucide [Autre...]')
  const root = appRoot()
  await run(['bunx', 'tamagui', 'icons', 'add', ...names, '--out', 'src/icons/lucide'], { cwd: root })
  writeFile(join(root, 'src', 'icons', 'index.ts'), "// Icônes du cœur + icônes propres à l'app (même jeu Lucide)\nexport * from '@daroms/ui/icons'\nexport * from './lucide'\n")
  log.ok("icônes ajoutées : import { ... } from '@/icons'")
}
