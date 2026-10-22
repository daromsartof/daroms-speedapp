import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

import { bool, flag, type Args } from '../lib/args'
import { capture, has, run, tail } from '../lib/exec'
import { color, fail, log } from '../lib/log'
import { loadManifest } from '../lib/manifest'
import { appRoot } from '../lib/paths'
import { inspectPage, type PageReport } from './shot-web'

async function serverUp(port: number) {
  try {
    const res = await fetch(`http://localhost:${port}`, { signal: AbortSignal.timeout(1500) })
    return res.ok || res.status === 404
  } catch {
    return false
  }
}

/** Empreinte du manifest et de la marque : sur le web, Expo les inline dans le bundle (cache Metro). */
async function configHash(root: string): Promise<string> {
  const parts = await Promise.all(['app.manifest.ts', 'brand.ts'].map((f) => Bun.file(join(root, f)).text().catch(() => '')))
  return String(Bun.hash(parts.join('\n')))
}

/** Démarre `expo start --web` en arrière-plan si nécessaire (réutilisé tant que la config ne change pas). */
async function ensureWebServer(root: string, port: number) {
  const hashFile = Bun.file(join(root, '.daroms', 'web.config-hash'))
  const hash = await configHash(root)
  const stale = (await hashFile.exists()) && (await hashFile.text()) !== hash
  // un serveur sur ce port mais lancé depuis une autre app (pas de web.pid ici) est remplacé
  const foreign = !(await Bun.file(join(root, '.daroms', 'web.pid')).exists())
  const up = await serverUp(port)
  if (up && !stale && !foreign) return
  if (up) await stopWebServer(root, port)
  // toujours --clear : le cache Metro est partagé entre projets et Expo y inline le manifest
  log.step(`démarrage du serveur web Expo (port ${port}, cache vidé)`)
  mkdirSync(join(root, '.daroms'), { recursive: true })
  await Bun.write(hashFile, hash)
  const logFile = Bun.file(join(root, '.daroms', 'web-server.log'))
  const server = Bun.spawn(['bunx', 'expo', 'start', '--web', '--port', String(port), '--clear'], {
    cwd: root,
    env: { ...process.env, BROWSER: 'none', CI: '1' },
    stdout: logFile,
    stderr: logFile,
    stdin: 'ignore',
  })
  server.unref()
  await Bun.write(join(root, '.daroms', 'web.pid'), String(server.pid))
  for (let i = 0; i < 90; i++) {
    if (await serverUp(port)) return
    await Bun.sleep(1000)
  }
  fail(`serveur web injoignable (voir .daroms/web-server.log)`)
}

/** Arrête le serveur web : processus lancé par daroms et tout processus écoutant sur le port. */
async function stopWebServer(root: string, port = 8099) {
  const pids = new Set<number>()
  const pidFile = Bun.file(join(root, '.daroms', 'web.pid'))
  if (await pidFile.exists()) pids.add(Number(await pidFile.text()))
  if (has('lsof')) {
    // seulement le processus en écoute (pas les connexions clientes, dont la nôtre)
    const { out } = await capture(['lsof', '-ti', `tcp:${port}`, '-sTCP:LISTEN'])
    for (const line of out.split('\n')) if (/^\d+$/.test(line.trim())) pids.add(Number(line.trim()))
  }
  pids.delete(process.pid)
  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM')
    } catch {
      // déjà arrêté
    }
  }
  if (await pidFile.exists()) await pidFile.delete()
  log.ok(pids.size ? `serveur web arrêté (${pids.size} processus)` : 'aucun serveur web actif')
}

function printReport(report: PageReport, shot?: string) {
  const status = report.errors.length || report.overflows.length ? color.red('à corriger') : color.green('ok')
  console.log(`${color.bold(report.route)} [${report.scheme}] : ${status}`)
  for (const error of report.errors.slice(0, 10)) console.log(`  ${color.red('erreur')} ${error}`)
  if (report.warnings.length) console.log(`  ${color.yellow(`${report.warnings.length} avertissement(s)`)} ${color.dim(report.warnings.slice(0, 3).join(' | '))}`)
  for (const o of report.overflows.slice(0, 10)) console.log(`  ${color.yellow('débordement')} ${o}`)
  if (report.texts.length) console.log(color.dim(`  textes : ${report.texts.slice(0, 12).join(' · ')}`))
  if (shot) console.log(`  capture : ${shot}`)
}

async function shotAndroid(root: string, route: string, out: string) {
  if (!has('adb')) fail('adb introuvable')
  const manifest = await loadManifest(root)
  const scheme = manifest.scheme ?? manifest.slug
  await capture(['adb', 'logcat', '-c'])
  await run(['adb', 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', `${scheme}://${route.replace(/^\//, '')}`], { quiet: true })
  await Bun.sleep(4000)
  const logs = await capture(['adb', 'logcat', '-d', '-t', '300', 'ReactNativeJS:V', 'AndroidRuntime:E', '*:S'])
  const errors = logs.out.split('\n').filter((l) => /error|exception|fatal/i.test(l))
  console.log(`${color.bold(route)} [android] : ${errors.length ? color.red(`${errors.length} erreur(s)`) : color.green('ok')}`)
  if (errors.length) console.log(color.dim(tail(errors.join('\n'), 15)))
  await run(['bash', '-c', `adb exec-out screencap -p > ${JSON.stringify(out)}`])
  console.log(`  capture : ${out}`)
}

/** daroms shot <route> : rapport texte d'abord (erreurs, débordements), capture si utile ou --capture. */
export async function shot(args: Args) {
  const root = appRoot()
  if (bool(args, 'stop')) return stopWebServer(root, Number(flag(args, 'port') ?? 8099))
  const route = args._[0] ?? '/'
  const dark = bool(args, 'dark')
  const dir = join(root, '.daroms', 'shots')
  mkdirSync(dir, { recursive: true })
  const file = join(dir, `${route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home'}-${dark ? 'dark' : 'light'}.png`)
  if (bool(args, 'android')) return shotAndroid(root, route, file)
  const port = Number(flag(args, 'port') ?? 8099)
  await ensureWebServer(root, port)
  const locale = flag(args, 'locale') ?? (await loadManifest(root)).defaultLocale
  const storage: Record<string, string> = Object.fromEntries((flag(args, 'storage') ?? '').split(',').filter(Boolean).map((pair) => pair.split('=') as [string, string]))
  // --storage-file données.json : { "cle": valeur } (valeurs non textuelles sérialisées en JSON)
  const storageFile = flag(args, 'storage-file')
  if (storageFile) {
    for (const [key, value] of Object.entries((await Bun.file(join(root, storageFile)).json()) as Record<string, unknown>)) {
      storage[key] = typeof value === 'string' ? value : JSON.stringify(value)
    }
  }
  const report = await inspectPage({ url: `http://localhost:${port}`, route, dark, width: Number(flag(args, 'width') ?? 390), shotPath: file, forceShot: bool(args, 'capture'), locale, storage })
  printReport(report, report.shot)
  if (report.errors.length) process.exitCode = 1
}

export async function test(args: Args) {
  await run(['bunx', 'jest', '--passWithNoTests', ...args._], { cwd: appRoot() })
}

/** daroms e2e [flow] [--go] : Maestro sur l'appareil ou l'émulateur connecté (--go : app chargée dans Expo Go). */
export async function e2e(args: Args) {
  const root = appRoot()
  if (!has('maestro')) fail('maestro introuvable : curl -fsSL "https://get.maestro.mobile.dev" | bash')
  const target = args._[0] ?? 'e2e'
  if (!existsSync(join(root, target))) fail(`flow introuvable : ${target}`)
  const env: string[] = []
  if (bool(args, 'go')) {
    // Expo Go : Metro doit tourner (bun daroms dev --go) ; le port est redirigé vers l'appareil
    if (has('adb')) await capture(['adb', 'reverse', 'tcp:8081', 'tcp:8081'])
    env.push('-e', 'APP_ID=host.exp.exponent', '-e', 'APP_URL=exp://127.0.0.1:8081?__expo_disable_fab=1&__expo_disable_onboarding=1')
  } else {
    env.push('-e', `APP_ID=${(await loadManifest(root)).bundleId}`, '-e', 'APP_URL=')
  }
  if (bool(args, 'driver') && has('adb')) {
    // Android très récent : le pilote Maestro démarre mal tout seul ; on lance son instrumentation avant
    Bun.spawn(['adb', 'shell', 'am', 'instrument', '-w', '-m', '-e', 'debug', 'false', '-e', 'class', 'dev.mobile.maestro.MaestroDriverService#grpcServer', 'dev.mobile.maestro.test/androidx.test.runner.AndroidJUnitRunner'], { stdout: 'ignore', stderr: 'ignore' }).unref()
    await Bun.sleep(8000)
  }
  await run(['maestro', 'test', ...env, target], { cwd: root, env: { MAESTRO_CLI_NO_ANALYTICS: '1', MAESTRO_DRIVER_STARTUP_TIMEOUT: '180000' } })
}
