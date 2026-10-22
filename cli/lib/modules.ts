import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

import { copyDir, readJson, writeFile, writeJson } from './fsx'
import { addLocaleKeys, type LocalizedText } from './locales'
import { fail, log } from './log'
import { loadManifest, saveManifest, type Manifest } from './manifest'
import { CORE_DIR } from './paths'
import { regenerateRouteTypes } from './routes'
import { run } from './exec'

export type ModuleSpec = {
  slug: string
  title: string
  description: string
  /** Paquets natifs installés via `expo install` dans l'app. */
  dependencies: string[]
  requires: string[]
  routes: { file: string; export: string }[]
  tabs: Manifest['tabs']
  env: string[]
  migrations: string[]
  /** Dossiers d'edge functions Supabase copiés dans supabase/functions/. */
  functions: string[]
  /** Clés i18n ajoutées au namespace app (textes que l'app personnalise). */
  appLocales: Record<string, LocalizedText>
  defaultConfig: Record<string, unknown>
}

export function listModules(): ModuleSpec[] {
  const dir = join(CORE_DIR, 'modules')
  return readdirSync(dir)
    .filter((slug) => existsSync(join(dir, slug, 'module.json')))
    .map((slug) => readModule(slug))
}

export function readModule(slug: string): ModuleSpec {
  const file = join(CORE_DIR, 'modules', slug, 'module.json')
  if (!existsSync(file)) fail(`module inconnu : ${slug} (voir \`daroms module list\`)`)
  return { dependencies: [], requires: [], routes: [], tabs: [], env: [], migrations: [], functions: [], appLocales: {}, defaultConfig: {}, ...readJson<Partial<ModuleSpec>>(file), slug } as ModuleSpec
}

/** Réécrit src/generated/modules.ts : seuls les modules activés sont importés. */
export function writeRegistry(root: string, slugs: string[]) {
  const sorted = [...slugs].sort()
  const name = (slug: string) => slug.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())
  const lines = [
    '// généré par daroms (daroms module add/remove) : ne pas modifier à la main',
    "import type { ModuleRegistry } from '@daroms/app'",
    ...sorted.map((slug) => `import ${name(slug)} from '@daroms/module-${slug}'`),
    '',
    `export const modules: ModuleRegistry = [${sorted.map(name).join(', ')}]`,
    '',
  ]
  writeFile(join(root, 'src', 'generated', 'modules.ts'), lines.join('\n'))
}

type Pkg = { workspaces: string[]; dependencies: Record<string, string> }

function linkWorkspace(root: string, slug: string, enable: boolean) {
  const file = join(root, 'package.json')
  const pkg = readJson<Pkg>(file)
  const ws = `core/modules/${slug}`
  pkg.workspaces = enable ? [...new Set([...pkg.workspaces, ws])] : pkg.workspaces.filter((w) => w !== ws)
  if (enable) pkg.dependencies[`@daroms/module-${slug}`] = 'workspace:*'
  else delete pkg.dependencies[`@daroms/module-${slug}`]
  pkg.dependencies = Object.fromEntries(Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b)))
  writeJson(file, pkg)
}

function appendEnv(root: string, keys: string[]) {
  const file = join(root, '.env.example')
  const current = existsSync(file) ? readFileSync(file, 'utf8') : ''
  const missing = keys.filter((k) => !current.includes(`${k}=`))
  if (missing.length) writeFile(file, `${current.trimEnd()}\n${missing.map((k) => `${k}=`).join('\n')}\n`)
}

export type AddOptions = { config?: Record<string, unknown> }

export async function addModule(root: string, slug: string, options: AddOptions = {}) {
  const spec = readModule(slug)
  const manifest = await loadManifest(root)
  for (const dep of spec.requires) if (!manifest.modules[dep]) await addModule(root, dep, options)
  const current = await loadManifest(root)
  if (current.modules[slug]) return log.info(`module ${slug} déjà actif`)
  linkWorkspace(root, slug, true)
  for (const route of spec.routes) {
    writeFile(join(root, route.file), `export { ${route.export} as default } from '@daroms/module-${slug}'\n`)
  }
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
  spec.migrations.forEach((migration, i) => {
    const source = readFileSync(join(CORE_DIR, 'modules', slug, migration), 'utf8')
    writeFile(join(root, 'supabase', 'migrations', `${stamp}${i}_${slug}_${migration.split('/').pop()}`), source)
  })
  for (const fn of spec.functions) {
    copyDir(join(CORE_DIR, 'modules', slug, fn), join(root, 'supabase', 'functions', fn.split('/').pop()!))
  }
  appendEnv(root, spec.env)
  addLocaleKeys(root, spec.appLocales)
  current.modules[slug] = { ...spec.defaultConfig, ...options.config }
  current.tabs = [...current.tabs, ...spec.tabs.filter((t) => !current.tabs.some((c) => c.name === t.name))]
  saveManifest(root, current)
  writeRegistry(root, Object.keys(current.modules))
  await regenerateRouteTypes(root)
  log.ok(`module ${slug} ajouté`)
}

export async function removeModule(root: string, slug: string) {
  const spec = readModule(slug)
  const manifest = await loadManifest(root)
  if (!manifest.modules[slug]) return log.info(`module ${slug} inactif`)
  delete manifest.modules[slug]
  manifest.tabs = manifest.tabs.filter((t) => !spec.tabs.some((s) => s.name === t.name))
  saveManifest(root, manifest)
  for (const route of spec.routes) rmSync(join(root, route.file), { force: true })
  linkWorkspace(root, slug, false)
  writeRegistry(root, Object.keys(manifest.modules))
  await regenerateRouteTypes(root)
  log.ok(`module ${slug} retiré (migrations et dépendances natives conservées)`)
}

/** Lie les workspaces puis installe (versions compatibles SDK) les dépendances natives des modules actifs. */
export async function installModules(root: string) {
  await run(['bun', 'install'], { cwd: root, quiet: true })
  const manifest = await loadManifest(root)
  const deps = [...new Set(Object.keys(manifest.modules).flatMap((slug) => readModule(slug).dependencies))]
  if (deps.length === 0) return
  const code = await run(['bunx', 'expo', 'install', ...deps], { cwd: root, allowFailure: true })
  if (code !== 0) log.warn(`dépendances natives non installées : bunx expo install ${deps.join(' ')}`)
}
