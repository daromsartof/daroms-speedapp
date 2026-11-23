// daroms logo : construit les directions de assets/source/logo.json, les vérifie, rend la planche ;
// --use <nom> installe la direction choisie (icon, foreground, background, monochrome) puis daroms assets.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, relative } from 'node:path'

import { bool, flag, type Args } from '../lib/args'
import { writeFile } from '../lib/fsx'
import { color, fail, log } from '../lib/log'
import { loadBrand, loadManifest } from '../lib/manifest'
import { appRoot } from '../lib/paths'
import { directionProblems, iconFiles, logoColors, logoGradient, markOnly, minContrast, SAFE_RADIUS, starterDirection, type Box, type Direction } from '../lib/logo'
import { bbox, coverage, holes, iou, LOGO_LIMITS, maxRadius, normalize, strokeWidth, toMask, type Mask } from '../lib/logo-check'
import { SHEET_SIZES, sheetSvg, themedSvg, type SheetRow } from '../lib/logo-sheet'
import { generateAssets, loadResvg, render } from './assets'

type Row = { label: string; value: string; ok: boolean; hard: boolean }
type Built = { d: Direction; dir: string; bbox: Box; rows: Row[]; silhouette: Mask; images: Record<number, string>; themed: string }

const FILES = ['icon.svg', 'foreground.svg', 'background.svg', 'monochrome.svg'] as const

/** daroms logo [--spec assets/source/logo.json] [--use <nom> [--force]] */
export async function logo(args: Args) {
  const root = appRoot()
  const specFile = join(root, flag(args, 'spec') ?? 'assets/source/logo.json')
  if (!existsSync(specFile)) fail(`${relative(root, specFile)} absent : /daroms-brand l'écrit (6 directions sur une grille)`)
  const brand = await loadBrand(root)
  if (!brand) fail('brand.ts invalide')
  const colors = logoColors(brand)
  const stops = logoGradient(brand)
  const spec = (await Bun.file(specFile).json()) as { directions?: Direction[] }
  const directions = spec.directions ?? []
  const problems = directions.length < 1 || directions.length > 6 ? ['directions : 1 à 6'] : []
  for (const d of directions) problems.push(...directionProblems(d, colors, stops))
  const names = directions.map((d) => d.name)
  if (new Set(names).size !== names.length) problems.push('directions : noms en double')
  if (problems.length) fail(`${relative(root, specFile)} :\n  ${problems.join('\n  ')}`)

  const use = flag(args, 'use')
  const selected = use ? directions.filter((d) => d.name === use) : directions
  if (use && !selected.length) fail(`direction inconnue : ${use} (${names.join(', ')})`)
  const resvg = await loadResvg(root)
  const raster = (svg: string, size: number) => render(resvg, root, svg, size)
  const dataUrl = (svg: string, size: number) => `data:image/png;base64,${raster(svg, size).asPng().toString('base64')}`
  const outDir = join(root, '.daroms', 'logo')

  const built: Built[] = []
  for (const d of selected) {
    const grid = d.grid ?? 48
    const markImg = raster(markOnly(d, 512), 512)
    const markMask = toMask(markImg.pixels, markImg.width, markImg.height)
    const px = bbox(markMask)
    if (!px) fail(`« ${d.name} » : symbole vide (tout est découpé ?)`)
    const unit = (grid * 2) / 512
    const box: Box = { x: px.x * unit - grid / 2, y: px.y * unit - grid / 2, w: px.w * unit, h: px.h * unit }
    const files = iconFiles(d, box, colors, { stops })
    // mesures sur la version à plat : couleurs franches, sans reflet ni ombre
    const flat = iconFiles(d, box, colors, { stops, flat: true })
    const dir = join(outDir, d.name)
    mkdirSync(dir, { recursive: true })
    for (const name of FILES) writeFile(join(dir, name), files[name])
    const ink = { bg: colors[d.background], ink: colors[d.ink] }
    const at = (size: number) => {
      const img = raster(flat['icon.svg'], size)
      return toMask(img.pixels, img.width, img.height, ink)
    }
    const [m512, m48, m16] = [at(512), at(48), at(16)]
    const fg = raster(flat['foreground.svg'], 512)
    const stroke48 = (strokeWidth(m512) * 48) / 512
    const counters = holes(m512, Math.round(512 * 512 * 0.0015))
    const radius = maxRadius(toMask(fg.pixels, fg.width, fg.height))
    const rows: Row[] = [
      { label: 'trait à 48 px', value: `${stroke48.toFixed(1)} px`, ok: stroke48 >= LOGO_LIMITS.stroke48, hard: true },
      { label: 'contreformes à 48 px', value: `${holes(m48)} sur ${counters}`, ok: holes(m48) === counters, hard: true },
      { label: 'contreformes à 16 px (favicon)', value: `${holes(m16)} sur ${counters}`, ok: holes(m16) === counters, hard: false },
      { label: 'présence', value: `${Math.round(coverage(m512) * 100)} %`, ok: coverage(m512) >= LOGO_LIMITS.presence, hard: true },
      { label: 'zone sûre Android', value: `${Math.round((radius / 256) * 100)} % du rayon (max ${Math.round((SAFE_RADIUS / 512) * 100)} %)`, ok: radius <= (SAFE_RADIUS / 2) + 2, hard: true },
      { label: 'contraste', value: `${minContrast(d.background, d.ink, colors, stops).toFixed(1)}:1`, ok: true, hard: true },
    ]
    const images = Object.fromEntries(SHEET_SIZES.map((s) => [s, dataUrl(files['icon.svg'], s)]))
    built.push({ d, dir, bbox: box, rows, silhouette: normalize(markMask), images, themed: dataUrl(themedSvg(d, box), 60) })
  }
  // six réponses différentes, pas six variantes d'une forme
  for (const a of built)
    for (const b of built)
      if (a !== b && iou(a.silhouette, b.silhouette) >= LOGO_LIMITS.similar) a.rows.push({ label: `trop proche de ${b.d.name}`, value: `${Math.round(iou(a.silhouette, b.silhouette) * 100)} % de recouvrement`, ok: false, hard: true })

  for (const b of built) {
    const bad = b.rows.filter((r) => !r.ok)
    const status = bad.some((r) => r.hard) ? color.red('à corriger') : color.green('ok')
    console.log(`${color.bold(b.d.name)} (${b.d.kind}) : ${status}`)
    for (const r of bad) console.log(`  ${r.hard ? color.red('échec') : color.yellow('indicatif')} ${r.label} : ${r.value}`)
    if (!bad.length) console.log(color.dim(`  ${b.rows.map((r) => `${r.label} ${r.value}`).join(' · ')}`))
  }

  if (use) {
    const b = built[0]!
    if (b.rows.some((r) => r.hard && !r.ok) && !bool(args, 'force')) fail(`« ${use} » ne passe pas les vérifications (--force pour l'installer quand même)`)
    for (const name of FILES) copyFileSync(join(b.dir, name), join(root, 'assets', 'source', name))
    log.ok(`« ${use} » installée dans assets/source/ (icon, foreground, background, monochrome)`)
    await generateAssets(root)
    return
  }
  const rows: SheetRow[] = built.map((b) => ({ d: b.d, ok: !b.rows.some((r) => r.hard && !r.ok), failing: b.rows.filter((r) => !r.ok).map((r) => `${r.label} : ${r.value}`), images: b.images, themed: b.themed }))
  const sheet = join(outDir, 'sheet.png')
  writeFile(sheet, raster(sheetSvg(rows, (await loadManifest(root)).name), 1840).asPng())
  console.log(`planche : ${relative(root, sheet)}`)
}

/** Icône de départ d'une app neuve : l'initiale sur le dégradé de la marque, avec relief (remplacée par /daroms-brand). */
export async function writeStarterIcon(root: string, initial: string) {
  const brand = await loadBrand(root)
  if (!brand) return
  const { direction, bbox } = starterDirection(initial)
  const files = iconFiles(direction, bbox, logoColors(brand), { stops: logoGradient(brand) })
  for (const name of FILES) writeFile(join(root, 'assets', 'source', name), files[name])
}
