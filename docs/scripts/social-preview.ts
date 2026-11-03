// Aperçu social 1280x640 (GitHub > Settings > Social preview, et og:image du site) depuis src/assets/social-preview.svg.
// Usage : bun docs/scripts/social-preview.ts
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { Resvg } from '@resvg/resvg-js'

const svg = readFileSync(resolve(import.meta.dir, '../src/assets/social-preview.svg'), 'utf8')
const png = new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'DejaVu Sans' } }).render().asPng()
const out = resolve(import.meta.dir, '../public/social-preview.png')
writeFileSync(out, png)
console.log(`${out} (${Math.round(png.length / 1024)} Ko)`)
