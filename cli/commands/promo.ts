// daroms promo : vidéo promo depuis les vrais écrans de l'app (web), composée aux couleurs de brand.ts,
// rendue image par image (Chromium headless) puis encodée par ffmpeg.
import { existsSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, relative } from 'node:path'

import { bool, flag, type Args } from '../lib/args'
import { has } from '../lib/exec'
import { color, fail, log } from '../lib/log'
import { loadBrand, loadManifest } from '../lib/manifest'
import { appRoot } from '../lib/paths'
import { autoStills, layout, OVERSHOOT, parseSpec, promoColors, SIZES, timeline, type PromoSpec } from '../lib/promo'
import { promoPage } from '../lib/promo-page'
import { semanticRadius } from '../../packages/theme/src/tone'
import { ensureWebServer } from './quality'

type Browser = import('playwright-core').Browser

export async function launch(root: string): Promise<Browser> {
  let pw: typeof import('playwright-core')
  try {
    pw = (await import(join(root, 'node_modules', 'playwright-core'))) as typeof import('playwright-core')
  } catch {
    return fail('playwright-core manquant : bun add -d playwright-core')
  }
  return pw.chromium.launch().catch(() => pw.chromium.launch({ channel: 'chrome' }))
}

export const dataUrl = async (file: string, type: string) => `data:${type};base64,${Buffer.from(await Bun.file(file).arrayBuffer()).toString('base64')}`

export function interFile(root: string, weight: 'Medium' | 'Bold'): string | undefined {
  try {
    return createRequire(join(root, 'package.json')).resolve(`@tamagui/font-inter/otf/Inter-${weight}.otf`)
  } catch {
    return undefined
  }
}

/** Capture un écran à 3x (390 x 844 pt) ; renvoie l'image et les erreurs de console vues. */
export async function captureScreen(browser: Browser, url: string, scene: PromoSpec['scenes'][number], locale: string) {
  const scheme = scene.dark ? 'dark' : 'light'
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, colorScheme: scheme, locale, reducedMotion: 'reduce' })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message.split('\n')[0]!))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text().split('\n')[0]!.slice(0, 160))
  })
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(`daroms:${key}`, value)
  }, scene.storage ?? {})
  await page.goto(`${url}${scene.route}${scene.route.includes('?') ? '&' : '?'}theme=${scheme}`, { waitUntil: 'networkidle', timeout: 90_000 })
  await page.waitForTimeout(1200)
  const png = await page.screenshot({ type: 'png' })
  await page.close()
  return { img: `data:image/png;base64,${png.toString('base64')}`, errors }
}

async function encode(frames: AsyncIterable<Buffer>, out: string, fps: number, duration: number, audio?: string) {
  const args = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-']
  if (audio) args.push('-i', audio)
  args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps))
  if (audio) args.push('-c:a', 'aac', '-b:a', '192k', '-af', `afade=t=out:st=${Math.max(0, duration - 1)}:d=1`, '-shortest')
  else args.push('-an')
  args.push('-t', String(duration), '-movflags', '+faststart', out)
  const ffmpeg = Bun.spawn(args, { stdin: 'pipe', stdout: 'ignore', stderr: 'pipe' })
  for await (const frame of frames) {
    ffmpeg.stdin.write(frame)
    await ffmpeg.stdin.flush()
  }
  await ffmpeg.stdin.end()
  if ((await ffmpeg.exited) !== 0) fail(`ffmpeg : ${(await new Response(ffmpeg.stderr).text()).trim().split('\n').slice(-3).join(' | ')}`)
}

/** daroms promo [--locale en|--all] [--stills auto|1,3.5] [--audio son.wav] [--spec store/promo.json] */
export async function promo(args: Args) {
  const root = appRoot()
  const manifest = await loadManifest(root)
  const locales = bool(args, 'all') ? manifest.locales : [flag(args, 'locale') ?? manifest.defaultLocale]
  const specFile = join(root, flag(args, 'spec') ?? 'store/promo.json')
  if (!existsSync(specFile)) fail(`${relative(root, specFile)} absent : le skill /daroms-promo l'écrit (accroche, 2 à 5 écrans, légendes par langue)`)
  const { spec, problems } = parseSpec(await Bun.file(specFile).json(), locales)
  if (!spec) fail(`${relative(root, specFile)} :\n  ${problems.join('\n  ')}`)
  const brand = await loadBrand(root)
  if (!brand) fail('brand.ts invalide')
  const icon = join(root, 'assets', 'icon.png')
  if (!existsSync(icon)) fail('assets/icon.png absent : bun daroms assets')
  const audio = flag(args, 'audio')
  if (audio && !existsSync(join(root, audio))) fail(`son introuvable : ${audio}`)
  const stillsFlag = flag(args, 'stills') ?? (bool(args, 'stills') ? 'auto' : undefined)
  if (!stillsFlag && !has('ffmpeg')) fail('ffmpeg introuvable (brew install ffmpeg ou apt install ffmpeg) ; --stills fonctionne sans')

  const port = Number(flag(args, 'port') ?? 8099)
  await ensureWebServer(root, port)
  const { duration, segments } = timeline(spec.scenes.length)
  const L = layout(spec.format)
  const radius = semanticRadius(brand).button
  const [medium, bold] = [interFile(root, 'Medium'), interFile(root, 'Bold')]
  const fonts = { medium: medium && (await dataUrl(medium, 'font/otf')), bold: bold && (await dataUrl(bold, 'font/otf')) }
  const iconUrl = await dataUrl(icon, 'image/png')
  const outDir = join(root, stillsFlag ? '.daroms/promo' : 'store/promo')
  mkdirSync(outDir, { recursive: true })

  const browser = await launch(root)
  try {
    for (const locale of locales) {
      log.step(`promo ${locale} : capture de ${spec.scenes.length} écrans`)
      const scenes = []
      for (const scene of spec.scenes) {
        const shot = await captureScreen(browser, `http://localhost:${port}`, scene, locale)
        for (const e of shot.errors.slice(0, 3)) console.log(`  ${color.yellow('erreur')} ${scene.route} : ${e}`)
        scenes.push({ img: shot.img, caption: spec.scenes[scenes.length]!.caption[locale]! })
      }
      const html = promoPage({
        layout: L,
        colors: promoColors(brand),
        overshoot: OVERSHOOT[brand.tone],
        radius: radius >= 999 ? 999 : radius,
        segments,
        duration,
        name: manifest.name,
        icon: iconUrl,
        hook: spec.hook[locale]!,
        end: spec.end?.[locale] ?? '',
        scenes,
        fonts,
      })
      const page = await browser.newPage({ viewport: { width: L.w, height: L.h }, deviceScaleFactor: 1 })
      await page.setContent(html, { waitUntil: 'load' })
      await page.waitForFunction('window.__ready === true', undefined, { timeout: 30_000 })
      const at = async (t: number) => page.evaluate((time) => (window as unknown as { renderAt: (t: number) => void }).renderAt(time), t)
      if (stillsFlag) {
        const times = stillsFlag === 'auto' ? autoStills(spec.scenes.length) : stillsFlag.split(',').map(Number).filter((t) => t >= 0 && t <= duration)
        for (const t of times) {
          await at(t)
          const file = join(outDir, `${locale}-${t.toFixed(2)}s.png`)
          await page.screenshot({ path: file, type: 'png' })
          console.log(`  ${relative(root, file)}`)
        }
      } else {
        const out = join(outDir, `promo-${locale}.mp4`)
        const total = Math.round(duration * spec.fps)
        async function* frames() {
          for (let i = 0; i < total; i++) {
            await at(i / spec!.fps)
            yield await page.screenshot({ type: 'jpeg', quality: 92 })
          }
        }
        await encode(frames(), out, spec.fps, duration, audio && join(root, audio))
        await at(duration - 0.3)
        await page.screenshot({ path: join(outDir, `poster-${locale}.png`), type: 'png' })
        const { w, h } = SIZES[spec.format]
        log.ok(`${relative(root, out)} (${duration} s, ${w}x${h}, ${spec.scenes.length} écrans${audio ? ', son' : ', muette'}) + poster-${locale}.png`)
      }
      await page.close()
    }
  } finally {
    await browser.close()
  }
}
