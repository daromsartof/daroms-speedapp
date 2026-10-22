import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Args } from '../lib/args'
import { writeFile } from '../lib/fsx'
import { fail, log } from '../lib/log'
import { appRoot } from '../lib/paths'

type Resvg = typeof import('@resvg/resvg-js')

const INTER = 'node_modules/@tamagui/font-inter/otf'

async function loadResvg(root: string): Promise<Resvg> {
  try {
    return (await import(join(root, 'node_modules', '@resvg', 'resvg-js'))) as Resvg
  } catch {
    return fail('@resvg/resvg-js manquant : bun add -d @resvg/resvg-js')
  }
}

function png(resvg: Resvg, root: string, svg: string, size: number): Buffer {
  const fonts = ['Inter-ExtraBold.otf', 'Inter-Bold.otf', 'Inter-Regular.otf'].map((f) => join(root, INTER, f)).filter(existsSync)
  const renderer = new resvg.Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    font: { fontFiles: fonts, loadSystemFonts: true, defaultFontFamily: 'Inter' },
  })
  return renderer.render().asPng()
}

/** Place une image PNG centrée, mise à l'échelle, avec coins arrondis éventuels. */
function frame(image: Buffer, size: number, scale: number, radius = 0): string {
  const inner = Math.round(size * scale)
  const offset = Math.round((size - inner) / 2)
  const href = `data:image/png;base64,${image.toString('base64')}`
  const clip = radius ? `<clipPath id="c"><rect x="${offset}" y="${offset}" width="${inner}" height="${inner}" rx="${Math.round(inner * radius)}"/></clipPath>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${clip}<image href="${href}" x="${offset}" y="${offset}" width="${inner}" height="${inner}"${radius ? ' clip-path="url(#c)"' : ''}/></svg>`
}

/** Génère icon, adaptive-icon, splash-icon et favicon depuis assets/source/icon.svg. */
export async function generateAssets(root: string) {
  const source = join(root, 'assets', 'source', 'icon.svg')
  if (!existsSync(source)) fail('assets/source/icon.svg introuvable (icône carrée 1024, fond inclus)')
  const resvg = await loadResvg(root)
  const svg = readFileSync(source, 'utf8')
  const icon = png(resvg, root, svg, 1024)
  writeFile(join(root, 'assets', 'icon.png'), icon)
  const foregroundSource = join(root, 'assets', 'source', 'foreground.svg')
  const foreground = existsSync(foregroundSource)
    ? png(resvg, root, readFileSync(foregroundSource, 'utf8'), 1024)
    : png(resvg, root, frame(icon, 1024, 0.62, 0.22), 1024)
  writeFile(join(root, 'assets', 'adaptive-icon.png'), foreground)
  writeFile(join(root, 'assets', 'splash-icon.png'), png(resvg, root, frame(icon, 512, 1, 0.22), 512))
  writeFile(join(root, 'assets', 'favicon.png'), png(resvg, root, frame(icon, 48, 1, 0.22), 48))
  log.ok('icônes générées : icon, adaptive-icon, splash-icon, favicon')
}

export async function assets(_args: Args) {
  await generateAssets(appRoot())
}
