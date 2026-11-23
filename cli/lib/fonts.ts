// Police des titres de la direction artistique : src/generated/fonts.ts n'importe que le fichier choisi,
// pour que l'app n'embarque pas les polices des autres directions.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Brand } from '../../packages/theme/src/brand'
import { DISPLAY_FAMILY, displayFontFile } from '../../packages/theme/src/direction'
import { TONES } from '../../packages/theme/src/tone'
import { writeFile } from './fsx'
import { loadBrand } from './manifest'

/** Contenu de src/generated/fonts.ts pour une marque. */
export function fontsModule(brand: Brand): string {
  const file = displayFontFile(brand, TONES[brand.tone].headingWeight)
  const value = file ? `{ ${DISPLAY_FAMILY}: require('${file}') }` : '{}'
  return [
    '// généré par daroms depuis brand.ts (direction, ton) : ne pas modifier à la main',
    '/* eslint-disable @typescript-eslint/no-require-imports */',
    `export const displayFont: Record<string, number> = ${value}`,
    '',
  ].join('\n')
}

/** Réécrit src/generated/fonts.ts s'il ne correspond plus à brand.ts ; true si modifié. */
export async function syncFonts(root: string): Promise<boolean> {
  const brand = await loadBrand(root)
  if (!brand) return false
  const path = join(root, 'src', 'generated', 'fonts.ts')
  const content = fontsModule(brand)
  if (existsSync(path) && readFileSync(path, 'utf8') === content) return false
  writeFile(path, content)
  return true
}
