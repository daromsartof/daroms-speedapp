import { flag, type Args } from '../lib/args'
import { capture, run } from '../lib/exec'
import { fail, log } from '../lib/log'
import { loadManifest, saveManifest } from '../lib/manifest'
import { appRoot } from '../lib/paths'

const eas = (...cmd: string[]) => ['bunx', 'eas-cli@latest', ...cmd]

/** Crée le projet EAS si besoin et range son identifiant dans le manifest. */
async function ensureEasProject(root: string) {
  const manifest = await loadManifest(root)
  if (manifest.eas.projectId) return
  log.step('création du projet EAS (eas init)')
  const { out } = await capture(eas('init', '--non-interactive', '--force'), { cwd: root })
  const id = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.exec(out)?.[0]
  if (!id) fail(`identifiant de projet EAS introuvable. Lancer \`bunx eas-cli login\` puis réessayer.\n${out.slice(-600)}`)
  manifest.eas.projectId = id
  saveManifest(root, manifest)
  log.ok(`projet EAS ${id} enregistré dans app.manifest.ts`)
}

/** build [preview|production|development] [--platform ios|android|all] */
export async function build(args: Args) {
  const root = appRoot()
  const profile = args._[0] ?? 'preview'
  if (!['preview', 'production', 'development'].includes(profile)) fail(`profil inconnu : ${profile}`)
  await ensureEasProject(root)
  await run(eas('build', '--profile', profile, '--platform', flag(args, 'platform') ?? 'all'), { cwd: root })
}

/** submit [--platform ios|android|all] : dernier build production vers TestFlight / piste interne. */
export async function submit(args: Args) {
  const root = appRoot()
  const manifest = await loadManifest(root)
  const missing = [
    !manifest.store.privacyUrl && 'manifest.store.privacyUrl (politique de confidentialité)',
    !manifest.store.supportEmail && 'manifest.store.supportEmail',
  ].filter(Boolean)
  if (missing.length) fail(`checklist store incomplète :\n  - ${missing.join('\n  - ')}`)
  await run(eas('submit', '--profile', 'production', '--latest', '--platform', flag(args, 'platform') ?? 'all'), { cwd: root })
}

/** update [canal] --message "..." : mise à jour OTA (JS et assets uniquement). */
export async function update(args: Args) {
  const root = appRoot()
  const channel = args._[0] ?? 'production'
  const message = flag(args, 'message') ?? fail('--message "description de la mise à jour" requis')
  await ensureEasProject(root)
  await run(eas('update', '--channel', channel, '--message', message, '--non-interactive'), { cwd: root })
}
