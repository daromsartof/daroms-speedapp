import { existsSync, readdirSync, readFileSync, realpathSync, renameSync, symlinkSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

import { bool, flag, type Args } from '../lib/args'
import { capture, run } from '../lib/exec'
import { copyDir, readJson, substitute, writeJson } from '../lib/fsx'
import { color, fail, log } from '../lib/log'
import { loadManifest, saveManifest } from '../lib/manifest'
import { addModule, installModules, writeRegistry } from '../lib/modules'
import { appRoot, CORE_DIR } from '../lib/paths'
import { regenerateRouteTypes } from '../lib/routes'
import { generateAssets } from './assets'
import { syncAi } from './ai'

const DEFAULT_CORE_URL = 'https://github.com/daromsartof/daroms-speedapp.git'
const CORE_SKIP = /^(node_modules|\.git|\.daroms|coverage|docs\/dist|docs\/\.astro)(\/|$)|\/node_modules(\/|$)/

type VariantScreen = { name: string; tab?: boolean; icon?: string; title?: string; titleEn?: string }
type Variant = {
  modules?: Record<string, Record<string, unknown>>
  tables?: { name: string; fields: string; feature?: string; local?: boolean }[]
  screens?: VariantScreen[]
  notes?: string
}

/** Exécute la recette de la variante avec les générateurs (tables puis écrans) ; local : tables sur l'appareil. */
async function runVariant(dest: string, variant: Variant, local: boolean) {
  const { screen, table } = await import('./generate')
  for (const t of variant.tables ?? []) {
    await table(dest, t.name, { _: [], flags: { fields: t.fields, ...(t.feature ? { feature: t.feature } : {}), local: local || Boolean(t.local) } })
  }
  for (const s of variant.screens ?? []) {
    const flags: Record<string, string | boolean> = { tab: Boolean(s.tab), icon: s.icon ?? 'Inbox', title: s.title ?? s.name, 'title-en': s.titleEn ?? s.title ?? s.name }
    await screen(dest, s.name, { _: [], flags }, true)
  }
  if (variant.notes) log.warn(variant.notes)
}

/** Cœur cloné (développement) ou installé depuis npm (dossier node_modules, éventuellement dans un autre dépôt git). */
async function coreIsCheckout(): Promise<boolean> {
  const { code, out } = await capture(['git', '-C', CORE_DIR, 'rev-parse', '--show-toplevel'])
  return code === 0 && realpathSync(out.trim()) === realpathSync(CORE_DIR)
}

async function coreRemote(checkout: boolean): Promise<string> {
  if (!checkout) return DEFAULT_CORE_URL
  const { code, out } = await capture(['git', '-C', CORE_DIR, 'remote', 'get-url', 'origin'])
  return code === 0 ? out.trim() : DEFAULT_CORE_URL
}

/** Bun ne suit pas un lien symbolique dans un motif de workspace (core/packages/*) : chemins explicites. */
function expandCoreWorkspaces(dest: string) {
  const file = join(dest, 'package.json')
  const pkg = readJson<{ workspaces: string[] }>(file)
  const packages = readdirSync(join(CORE_DIR, 'packages'))
    .filter((name) => existsSync(join(CORE_DIR, 'packages', name, 'package.json')))
    .map((name) => `core/packages/${name}`)
  pkg.workspaces = [...new Set(pkg.workspaces.flatMap((w) => (w === 'core/packages/*' ? packages : [w])))]
  writeJson(file, pkg)
}

async function attachCore(dest: string, args: Args) {
  if (bool(args, 'link')) {
    symlinkSync(CORE_DIR, join(dest, 'core'), 'dir')
    expandCoreWorkspaces(dest)
    return log.ok('cœur lié (lien symbolique, développement du cœur)')
  }
  if (bool(args, 'copy')) {
    copyDir(CORE_DIR, join(dest, 'core'), (rel) => CORE_SKIP.test(rel))
    return log.ok('cœur copié (instantané local, sans sous-module)')
  }
  const checkout = await coreIsCheckout()
  const url = flag(args, 'core') ?? (await coreRemote(checkout))
  // installé depuis npm : sans accès au dépôt, on copie le cœur installé plutôt que d'échouer
  const added = await run(['git', 'submodule', 'add', url, 'core'], { cwd: dest, allowFailure: !checkout, env: checkout ? {} : { GIT_TERMINAL_PROMPT: '0' } })
  if (added !== 0) {
    log.warn(`dépôt ${url} inaccessible : copie du cœur installé à la place (relancer avec --core <url> pour un sous-module)`)
    copyDir(CORE_DIR, join(dest, 'core'), (rel) => CORE_SKIP.test(rel))
    return log.ok('cœur copié (instantané du paquet npm, sans sous-module)')
  }
  log.ok(`cœur ajouté en sous-module (${url})`)
  if (checkout) return
  // paquet npm : le sous-module suit la version de la CLI qui crée l'app
  const tag = `v${readFileSync(join(CORE_DIR, 'VERSION'), 'utf8').trim()}`
  const pinned = await run(['git', '-C', 'core', 'checkout', '-q', tag], { cwd: dest, allowFailure: true })
  if (pinned === 0) log.ok(`sous-module core/ fixé sur ${tag}`)
  else log.warn(`tag ${tag} introuvable sur ${url} : core/ reste sur la branche par défaut`)
}

function applyVariant(dest: string, name: string): Variant {
  const dir = join(CORE_DIR, 'template', 'variants', name)
  if (name === 'blank') return {}
  if (!existsSync(dir)) fail(`variante inconnue : ${name}`)
  if (existsSync(join(dir, 'files'))) copyDir(join(dir, 'files'), dest)
  return existsSync(join(dir, 'variant.json')) ? readJson<Variant>(join(dir, 'variant.json')) : {}
}

/** daroms new <slug> : crée une app complète prête à lancer. */
export async function newApp(args: Args) {
  const slug = args._[0] ?? fail('usage : daroms new <slug> [--name "Nom"] [--variant blank] [--primary #hex] ...')
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) fail('slug : minuscules, chiffres et tirets')
  const dest = resolve(flag(args, 'dir') ?? process.cwd(), slug)
  if (existsSync(dest)) fail(`le dossier existe déjà : ${dest}`)
  const name = flag(args, 'name') ?? slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
  const variant = flag(args, 'variant') ?? 'blank'
  const vars = {
    APP_NAME: name,
    APP_SLUG: slug,
    BUNDLE_ID: flag(args, 'bundle') ?? `com.daroms.${slug.replace(/-/g, '')}`,
    VARIANT: variant,
    PRIMARY: flag(args, 'primary') ?? '#4F46E5',
    ACCENT: flag(args, 'accent') ?? '#F97316',
    FONT: flag(args, 'font') ?? 'inter',
    RADIUS: flag(args, 'radius') ?? 'lg',
    TONE: flag(args, 'tone') ?? 'pro',
    INITIAL: name.trim()[0]?.toUpperCase() ?? 'A',
    SUPABASE_REF: flag(args, 'supabase') ?? 'xxxx',
  }

  log.step(`création de ${color.bold(name)} dans ${dest}`)
  copyDir(join(CORE_DIR, 'template'), dest, (rel) => rel.startsWith('variants'))
  renameSync(join(dest, 'gitignore'), join(dest, '.gitignore'))
  renameSync(join(dest, 'mcp.json'), join(dest, '.mcp.json'))
  const extra = applyVariant(dest, variant)
  substitute(dest, vars)

  const git = !bool(args, 'no-git')
  if (git) await run(['git', 'init', '-q', '-b', 'main'], { cwd: dest })
  await attachCore(dest, args)

  const manifest = await loadManifestAfterInstall(dest)
  if (vars.SUPABASE_REF !== 'xxxx') manifest.supabase.projectRef = vars.SUPABASE_REF
  saveManifest(dest, manifest)
  const modules = { ...extra.modules, ...Object.fromEntries((flag(args, 'modules') ?? '').split(',').filter(Boolean).map((m) => [m, {}])) }
  for (const [slugModule, config] of Object.entries(modules)) await addModule(dest, slugModule, { config })
  writeRegistry(dest, Object.keys((await loadManifest(dest)).modules))
  if (Object.keys(modules).length) await installModules(dest)
  await runVariant(dest, extra, bool(args, 'local'))

  await generateAssets(dest)
  await regenerateRouteTypes(dest)
  await syncAi(dest, true)
  if (git) {
    await run(['git', 'add', '-A'], { cwd: dest, quiet: true })
    await run(['git', 'commit', '-q', '-m', `chore: création de ${name} (daroms new)`], { cwd: dest, allowFailure: true, quiet: true })
  }
  log.ok(`${name} est prêt`)
  console.log(`\n  cd ${basename(dest)}\n  cp .env.example .env   ${color.dim('# clés Supabase publiques')}\n  bun daroms dev\n`)
}

/** Le manifest importe @daroms/lib : il faut les paquets du workspace liés avant de le lire. */
async function loadManifestAfterInstall(dest: string) {
  log.step('installation des dépendances (bun install)')
  await run(['bun', 'install'], { cwd: dest, quiet: true })
  return loadManifest(dest)
}

// modules dont le code natif n'existe pas dans Expo Go
const NATIVE_ONLY = ['payments', 'push']

/**
 * daroms dev : serveur Expo et QR. Par défaut Expo Go (aperçu immédiat, rien à installer
 * hormis l'app Expo Go) ; --dev-client pour un build de développement déjà installé.
 */
export async function dev(args: Args) {
  const root = appRoot()
  const devClient = bool(args, 'dev-client')
  const cmd = ['bunx', 'expo', 'start', devClient ? '--dev-client' : '--go']
  if (bool(args, 'web')) cmd.push('--web')
  if (bool(args, 'android')) cmd.push('--android')
  if (bool(args, 'ios')) cmd.push('--ios')
  if (bool(args, 'tunnel')) cmd.push('--tunnel')
  if (bool(args, 'clear')) cmd.push('--clear')
  if (!existsSync(join(root, '.env'))) log.warn('.env absent : copier .env.example (Supabase désactivé en attendant)')
  const native = Object.keys((await loadManifest(root)).modules).filter((m) => NATIVE_ONLY.includes(m))
  if (!devClient && native.length) {
    log.warn(`modules ${native.join(', ')} : limités dans Expo Go. Build de dev : bun daroms build development puis bun daroms dev --dev-client`)
  }
  if (!devClient) log.info("Téléphone : installer Expo Go, même Wi-Fi que l'ordinateur (sinon --tunnel), scanner le QR avec l'appareil photo.")
  await run(cmd, { cwd: root })
}

export { doctor } from './doctor'
export { saveManifest }
