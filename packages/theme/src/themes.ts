// Thèmes Tamagui v3 générés depuis la marque : light/dark + sous-thèmes
// brand (plein), accent, success, warning, danger (teintés) et variantes pleines.
import {
  colorTokens as baseColorTokens,
  createThemes,
  levels,
  type PaletteTheme,
  type ThemeDefinitionContext,
} from '@tamagui/themes/builder'

import type { Brand } from './brand'
import {
  anchorShade,
  createNeutral,
  createPalette,
  paletteToTokens,
  type Palette,
  type Shade,
} from './palette'
import { resolveTheme } from './resolve'
import { TONES } from './tone'

const flip = ({ parent }: ThemeDefinitionContext) => ({
  scheme: parent.scheme === 'light' ? ('dark' as const) : ('light' as const),
  children: levels(),
})

type Anchors = { brand: Shade; accent: Shade }

/** Arbre des thèmes : les noms sont fixes (typés), seules les ancres varient par marque. */
export const brandTree = (anchors: Anchors) =>
  ({
    light: { scheme: 'light', palette: 'surface' },
    dark: { scheme: 'dark', palette: 'surface' },
    children: {
      ...levels(),
      brand: { palette: 'brand', treatment: 'bold', anchor: anchors.brand, children: levels() },
      soft: { palette: 'brand', treatment: 'tint', children: levels(3) },
      accent: { palette: 'accent', treatment: 'tint', children: levels(3) },
      highlight: { palette: 'accent', treatment: 'bold', anchor: anchors.accent, children: levels() },
      success: { palette: 'emerald', treatment: 'tint', children: levels(3) },
      warning: { palette: 'amber', treatment: 'tint', children: levels(3) },
      danger: { palette: 'red', treatment: 'tint', children: levels(3) },
      destructive: { palette: 'red', treatment: 'bold', anchor: 600, children: levels() },
      inverse: flip,
      active: { active: true, children: levels() },
      black: { scheme: 'dark', children: levels() },
      white: { scheme: 'light', children: levels() },
      // noms attendus par certains composants Tamagui
      red: { palette: 'red', treatment: 'tint', children: levels(3) },
      yellow: { palette: 'yellow', treatment: 'tint', children: levels(3) },
      green: { palette: 'green', treatment: 'tint', children: levels(3) },
    },
  }) as const

export type BrandPalettes = { surface: Palette; brand: Palette; accent: Palette }

export function createBrandPalettes(brand: Brand): BrandPalettes {
  return {
    surface: createNeutral(brand.primary, TONES[brand.tone].surfaceChroma),
    brand: createPalette(brand.primary),
    accent: createPalette(brand.accent),
  }
}

/** Tokens couleur + thèmes générés pour une marque (données pures, testables). */
export function createBrandTheme(brand: Brand) {
  const palettes = createBrandPalettes(brand)
  const colorTokens = {
    ...baseColorTokens,
    ...paletteToTokens('surface', palettes.surface),
    ...paletteToTokens('brand', palettes.brand),
    ...paletteToTokens('accent', palettes.accent),
  }
  const tree = brandTree({ brand: anchorShade(brand.primary), accent: anchorShade(brand.accent) })
  const themes = createThemes<{ color: Record<string, string> }, typeof tree, PaletteTheme>(
    { color: colorTokens },
    tree,
    { getTheme: resolveTheme },
  )
  return { palettes, colorTokens, themes }
}

export type BrandTheme = ReturnType<typeof createBrandTheme>
export type BrandThemeName = keyof BrandTheme['themes']
