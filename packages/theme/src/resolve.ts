// Résolution des recettes de thème. Les traitements `normal` et `tint` viennent
// de Tamagui ; le traitement `bold` est remplacé par `solid` : le fond est
// exactement la couleur fournie (nuance d'ancrage) et le texte prend la couleur
// la plus lisible (blanc ou nuance 950), en clair comme en sombre.
import {
  fromShades,
  getTheme as defaultGetTheme,
  ramp,
  shadows,
  type GetThemeContext,
  type PaletteRecipe,
  type PaletteTheme,
  type ThemeScale,
} from '@tamagui/themes/builder'

import { contrastRatio } from './color'
import { SHADES, type Shade } from './palette'

export type BrandRecipe = PaletteRecipe & { anchor?: Shade }
type Ctx = GetThemeContext<{ color: Record<string, string> }, BrandRecipe>

const at = (index: number): Shade => SHADES[Math.max(0, Math.min(SHADES.length - 1, index))]!

function solidScale(anchor: Shade, text: 'white' | Shade, palette: string): ThemeScale<string> {
  const i = SHADES.indexOf(anchor)
  const lightText = text === 'white'
  return {
    background: anchor,
    'background-hover': at(i - 1),
    'background-press': at(i + 1),
    'background-focus': at(i - 1),
    'background-active': at(i - 1),
    'border-color': at(i + 1),
    'border-color-hover': anchor,
    'border-color-press': at(i + 1),
    'border-color-focus': anchor,
    color: text,
    'color-hover': text,
    'color-press': text,
    'color-focus': text,
    'placeholder-color': lightText ? at(i - 3) : at(i + 3),
    'outline-color': at(i - 2),
    'shadow-color': 'shadow-3',
    'accent-background': lightText ? 'white' : `${palette}-950`,
    'accent-color': `${palette}-${anchor}`,
  }
}

export function resolveTheme(ctx: Ctx): PaletteTheme {
  const { recipe, tokens } = ctx
  if (recipe.treatment !== 'bold' || !recipe.anchor) {
    return defaultGetTheme(ctx) as PaletteTheme
  }
  const color = (shade: Shade) => tokens.color[`${recipe.palette}-${shade}`] ?? '#000000'
  let anchor = recipe.anchor
  // marque très sombre en mode sombre : le plein serait invisible sur le fond, on prend le miroir
  const ground = tokens.color['surface-950'] ?? '#000000'
  if (recipe.scheme === 'dark' && contrastRatio(color(anchor), ground) < 1.6) {
    anchor = at(SHADES.length - 1 - SHADES.indexOf(anchor))
  }
  const fill = color(anchor)
  const text = contrastRatio(fill, '#ffffff') >= contrastRatio(fill, color(950)) ? 'white' : 950
  const scale = solidScale(anchor, text, recipe.palette)
  const schemeShadows = shadows[recipe.scheme]
  return {
    ...ramp(recipe.palette, recipe.scheme, scale),
    ...fromShades(recipe.palette, scale),
    ...schemeShadows,
    'shadow-color': schemeShadows['shadow-3'],
  } as PaletteTheme
}
