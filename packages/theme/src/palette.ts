// Génération de palettes 11 nuances (50 à 950) à partir d'une couleur de marque.
// La couleur fournie est placée telle quelle sur la nuance la plus proche,
// les autres nuances suivent une échelle de luminosité proche de Tailwind.
import { hexToRgb, oklchToHex, rgbToHex, rgbToOklch } from './color'

export const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export type Shade = (typeof SHADES)[number]
export type Palette = readonly string[]

// Luminosité OKLCH de référence pour une couleur vive (moyenne des palettes Tailwind v4)
const VIVID_L = [0.975, 0.94, 0.89, 0.815, 0.72, 0.64, 0.56, 0.49, 0.43, 0.38, 0.28]
// Part de la chroma maximale par nuance : faible aux extrémités, pleine au milieu
const CHROMA_CURVE = [0.08, 0.16, 0.28, 0.48, 0.72, 0.9, 1, 0.96, 0.8, 0.62, 0.42]
// Neutres : écart plus large dans les sombres pour le mode sombre
const NEUTRAL_L = [0.985, 0.968, 0.922, 0.87, 0.708, 0.556, 0.439, 0.371, 0.269, 0.205, 0.145]

function anchorIndex(lightness: number): number {
  let best = 1
  for (let i = 1; i < VIVID_L.length; i++) {
    if (Math.abs(VIVID_L[i]! - lightness) < Math.abs(VIVID_L[best]! - lightness)) best = i
  }
  return best
}

/** Nuance sur laquelle la couleur fournie est placée telle quelle. */
export function anchorShade(hex: string): Shade {
  return SHADES[anchorIndex(rgbToOklch(hexToRgb(hex)).l)]!
}

/** Palette vive : la couleur de marque apparaît exactement sur une nuance (souvent 500 ou 600). */
export function createPalette(hex: string): Palette {
  const base = rgbToOklch(hexToRgb(hex))
  const anchor = anchorIndex(base.l)
  const delta = base.l - VIVID_L[anchor]!
  const peak = base.c / CHROMA_CURVE[anchor]!
  const out = VIVID_L.map((l, i) => {
    if (i === anchor) return rgbToHex(hexToRgb(hex))
    const weight = Math.max(0, 1 - Math.abs(i - anchor) / 4)
    const lightness = Math.min(0.985, Math.max(0.16, l + delta * weight))
    return oklchToHex({ l: lightness, c: peak * CHROMA_CURVE[i]!, h: base.h })
  })
  return out
}

/**
 * Palette neutre teintée par la marque. `chroma` 0 donne un gris pur ;
 * 0.01 à 0.02 donne un gris légèrement coloré (ardoise, chaud...).
 */
export function createNeutral(hex: string, chroma: number): Palette {
  const { h } = rgbToOklch(hexToRgb(hex))
  return NEUTRAL_L.map((l, i) => {
    // chroma plus discrète aux extrémités pour garder des fonds propres
    const c = chroma * (i === 0 || i === 10 ? 0.5 : 1)
    return oklchToHex({ l, c, h })
  })
}

export function paletteToTokens<Name extends string>(name: Name, palette: Palette) {
  if (palette.length !== SHADES.length) {
    throw new Error(`La palette ${name} doit avoir ${SHADES.length} nuances`)
  }
  const tokens: Record<string, string> = {}
  SHADES.forEach((shade, i) => {
    tokens[`${name}-${shade}`] = palette[i]!
  })
  return tokens as Record<`${Name}-${Shade}`, string>
}
