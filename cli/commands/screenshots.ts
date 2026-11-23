// daroms screenshots : captures marketing des stores depuis les vrais écrans, aux tailles exactes
// d'App Store Connect et de Google Play, en PNG RGB sans alpha, une série par langue.
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { join, relative } from 'node:path'

import { bool, flag, type Args } from '../lib/args'
import { has } from '../lib/exec'
import { color, fail, log } from '../lib/log'
import { loadBrand, loadManifest } from '../lib/manifest'
import { appRoot } from '../lib/paths'
import { FEATURE_GRAPHIC, OVERSHOOT, parseSpec, pngInfo, promoColors, slideLayout, STORE_SIZES, timeline, TIMING, type StoreSize } from '../lib/promo'
import { promoPage, type PageData } from '../lib/promo-page'
import { semanticRadius } from '../../packages/theme/src/tone'
import { captureScreen, dataUrl, interFile, launch } from './promo'
import { ensureWebServer } from './quality'

/** Réencode en PNG RGB 8 bits (sans canal alpha), puis vérifie taille et couleur. */
async function writeStorePng(png: Buffer, out: string, w: number, h: number): Promise<string | undefined> {
  const ffmpeg = Bun.spawn(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-i', '-', '-pix_fmt', 'rgb24', '-frames:v', '1', out], { stdin: 'pipe', stderr: 'pipe' })
  ffmpeg.stdin.write(png)
  await ffmpeg.stdin.end()
  if ((await ffmpeg.exited) !== 0) return `ffmpeg : ${(await new Response(ffmpeg.stderr).text()).trim()}`
  const info = pngInfo(new Uint8Array(await Bun.file(out).arrayBuffer()))
  if (!info || info.width !== w || info.height !== h) return `taille ${info?.width}x${info?.height} au lieu de ${w}x${h}`
  if (info.colorType !== 2) return `PNG avec canal alpha (type ${info.colorType}) : refusé par App Store Connect`
  return undefined
}

/** daroms screenshots [--locale en|--all] [--tablet] [--spec store/promo.json] */
export async function screenshots(args: Args) {
  const root = appRoot()
  const manifest = await loadManifest(root)
  const locales = bool(args, 'all') ? manifest.locales : [flag(args, 'locale') ?? manifest.defaultLocale]
  const specFile = join(root, flag(args, 'spec') ?? 'store/promo.json')
  if (!existsSync(specFile)) fail(`${relative(root, specFile)} absent : /daroms-store (ou /daroms-promo) écrit les légendes, 2 à 5 écrans`)
  const { spec, problems } = parseSpec(await Bun.file(specFile).json(), locales)
  if (!spec) fail(`${relative(root, specFile)} :\n  ${problems.join('\n  ')}`)
  const brand = await loadBrand(root)
  if (!brand) fail('brand.ts invalide')
  const icon = join(root, 'assets', 'icon.png')
  if (!existsSync(icon)) fail('assets/icon.png absent : bun daroms assets')
  if (!has('ffmpeg')) fail('ffmpeg introuvable (brew install ffmpeg ou apt install ffmpeg) : il réencode les PNG sans canal alpha')

  const sizes = (Object.keys(STORE_SIZES) as StoreSize[]).filter((k) => bool(args, 'tablet') || !('tablet' in STORE_SIZES[k]))
  const port = Number(flag(args, 'port') ?? 8099)
  await ensureWebServer(root, port)
  const { duration, segments } = timeline(spec.scenes.length)
  const settled = segments.filter((s) => s.kind === 'scene').map((s) => s.start + TIMING.transition + 0.9)
  const radius = semanticRadius(brand).button
  const [medium, bold] = [interFile(root, 'Medium'), interFile(root, 'Bold')]
  const base = {
    colors: promoColors(brand),
    overshoot: OVERSHOOT[brand.tone],
    radius: radius >= 999 ? 999 : radius,
    segments,
    duration,
    name: manifest.name,
    icon: await dataUrl(icon, 'image/png'),
    fonts: { medium: medium && (await dataUrl(medium, 'font/otf')), bold: bold && (await dataUrl(bold, 'font/otf')) },
    labels: false,
  }
  const browser = await launch(root)
  const problemsFound: string[] = []
  try {
    for (const locale of locales) {
      log.step(`captures ${locale} : ${spec.scenes.length} écrans x ${sizes.length} tailles + visuel principal Google Play`)
      const scenes = []
      for (const scene of spec.scenes) {
        const shot = await captureScreen(browser, `http://localhost:${port}`, scene, locale)
        for (const e of shot.errors.slice(0, 3)) console.log(`  ${color.yellow('erreur')} ${scene.route} : ${e}`)
        scenes.push({ img: shot.img, caption: scene.caption[locale]! })
      }
      const dir = join(root, 'store', 'screenshots', locale)
      rmSync(dir, { recursive: true, force: true })
      const render = async (w: number, h: number, data: Omit<PageData, 'layout'>, times: number[], files: string[]) => {
        const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
        await page.setContent(promoPage({ ...data, layout: slideLayout(w, h) }), { waitUntil: 'load' })
        await page.waitForFunction('window.__ready === true', undefined, { timeout: 30_000 })
        for (const [i, t] of times.entries()) {
          await page.evaluate((time) => (window as unknown as { renderAt: (t: number) => void }).renderAt(time), t)
          const error = await writeStorePng(await page.screenshot({ type: 'png' }), files[i]!, w, h)
          if (error) problemsFound.push(`${relative(root, files[i]!)} : ${error}`)
        }
        await page.close()
      }
      for (const size of sizes) {
        const { w, h } = STORE_SIZES[size]
        mkdirSync(join(dir, size), { recursive: true })
        const files = spec.scenes.map((scene, i) => join(dir, size, `${String(i + 1).padStart(2, '0')}-${scene.route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'accueil'}.png`))
        await render(w, h, { ...base, hook: spec.hook[locale]!, end: spec.end?.[locale] ?? '', scenes }, settled, files)
      }
      // visuel principal : la carte de fin (icône, nom, accroche) sur l'aplat de marque
      await render(FEATURE_GRAPHIC.w, FEATURE_GRAPHIC.h, { ...base, hook: spec.hook[locale]!, end: spec.hook[locale]!, scenes }, [duration - 0.05], [join(dir, 'feature-graphic.png')])
      log.ok(`${relative(root, dir)}/ : ${sizes.join(', ')}, feature-graphic.png`)
    }
  } finally {
    await browser.close()
  }
  if (problemsFound.length) fail(`captures refusées :\n  ${problemsFound.join('\n  ')}`)
}
