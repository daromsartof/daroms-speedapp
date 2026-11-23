// Directions artistiques : ce qui fait passer une app de « propre » à « reconnaissable ».
// Le ton règle les proportions (rayons, espacements, rebond) ; la direction règle la matière :
// police des titres, dégradés, relief des cartes, halo derrière les écrans d'accueil et les illustrations.
import type { Brand, Direction } from './brand'
import { contrastRatio, hexToRgb, oklchToHex, rgbToOklch } from './color'
import type { Palette } from './palette'

export type DirectionSpec = {
  /** Police des titres (Google Fonts, licence OFL) ; null = police du corps. */
  display: { family: string; pkg: string; prefix: string } | null
  /** Force du dégradé de marque. */
  gradient: 'subtle' | 'brand' | 'vivid'
  /** Relief des cartes : 0 aplat bordé, 1 ombre douce, 2 ombre marquée. */
  elevation: 0 | 1 | 2
  /** Halo dégradé derrière les écrans d'accueil (onboarding, connexion, paywall, états vides). */
  halo: boolean
}

export const DIRECTIONS: Record<Direction, DirectionSpec> = {
  clean: { display: null, gradient: 'subtle', elevation: 0, halo: false },
  editorial: { display: { family: 'Fraunces', pkg: '@expo-google-fonts/fraunces', prefix: 'Fraunces' }, gradient: 'subtle', elevation: 0, halo: false },
  soft: { display: { family: 'Plus Jakarta Sans', pkg: '@expo-google-fonts/plus-jakarta-sans', prefix: 'PlusJakartaSans' }, gradient: 'brand', elevation: 1, halo: true },
  vivid: { display: { family: 'Sora', pkg: '@expo-google-fonts/sora', prefix: 'Sora' }, gradient: 'vivid', elevation: 2, halo: true },
}

/** Nom natif de la police des titres chargée par expo-font. */
export const DISPLAY_FAMILY = 'DaromsDisplay'

const WEIGHT_DIR = { '600': '600SemiBold', '700': '700Bold', '800': '800ExtraBold' } as const

/** Fichier de la police des titres à la graisse du ton (une seule graisse : pas de gras simulé). */
export function displayFontFile(brand: Brand, headingWeight: keyof typeof WEIGHT_DIR): string | null {
  const display = DIRECTIONS[brand.direction].display
  if (!display) return null
  const dir = WEIGHT_DIR[headingWeight]
  return `${display.pkg}/${dir}/${display.prefix}_${dir}.ttf`
}

/** Direction de l'app, fixée par createBrandConfig : lue par les composants (relief, halo). */
let current: DirectionSpec = DIRECTIONS.clean
export const setDirection = (direction: Direction) => {
  current = DIRECTIONS[direction]
}
export const getDirection = (): DirectionSpec => current

/** Mélange perceptif (OKLCH, teinte par le plus court chemin) : un dégradé entre deux teintes éloignées ne passe pas par le gris. */
export function mixOklch(a: string, b: string, t: number): string {
  const x = rgbToOklch(hexToRgb(a))
  const y = rgbToOklch(hexToRgb(b))
  let dh = y.h - x.h
  if (dh > 180) dh -= 360
  if (dh < -180) dh += 360
  const h = (x.h + dh * t + 360) % 360
  // milieu plus clair et un peu plus saturé : le mélange reste lumineux (sinon kaki entre sarcelle et ambre)
  const lift = Math.abs(dh) > 60 ? 0.03 : 0
  return oklchToHex({ l: Math.min(0.92, x.l + (y.l - x.l) * t + lift), c: Math.max(x.c, y.c) * 1.02, h })
}

type Palettes = { surface: Palette; brand: Palette; accent: Palette }
export type GradientColors = { light: string[]; dark: string[] }

/**
 * Dégradés tirés des palettes (aucune couleur inventée) :
 * - `brand` : boutons, héros, cartes mises en avant ;
 * - `halo` : fond très clair derrière les illustrations et les écrans d'accueil.
 */
export function brandGradients(direction: Direction, p: Palettes): { brand: GradientColors; halo: GradientColors; on: { light: string; dark: string } } {
  const kind = DIRECTIONS[direction].gradient
  const brand: GradientColors =
    kind === 'subtle'
      ? { light: [p.brand[5]!, p.brand[6]!], dark: [p.brand[5]!, p.brand[7]!] }
      : kind === 'brand'
        ? { light: [p.brand[6]!, mixOklch(p.brand[6]!, p.accent[5]!, 0.5), p.accent[5]!], dark: [p.brand[6]!, mixOklch(p.brand[6]!, p.accent[6]!, 0.5), p.accent[6]!] }
        : { light: [p.brand[6]!, mixOklch(p.brand[5]!, p.accent[5]!, 0.45), p.accent[5]!], dark: [p.brand[7]!, mixOklch(p.brand[6]!, p.accent[6]!, 0.45), p.accent[6]!] }
  // le texte posé sur le dégradé : blanc si chaque arrêt le permet (3:1, grands textes et boutons), sinon foncé
  const halo: GradientColors = { light: [p.brand[1]!, p.accent[1]!, p.surface[0]!], dark: [p.brand[9]!, p.accent[9]!, p.surface[10]!] }
  return { brand, halo, on: { light: onColor(brand.light, p), dark: onColor(brand.dark, p) } }
}

/**
 * Texte posé sur un dégradé : le clair dès qu'il atteint 3:1 sur chaque arrêt (le blanc fait vivre le dégradé),
 * sinon celui des deux dont le pire contraste est le meilleur.
 */
export function onColor(stops: string[], p: Palettes): string {
  const worst = (c: string) => Math.min(...stops.map((s) => contrastRatio(s, c)))
  const light = p.surface[0]!
  const dark = p.surface[10]!
  if (worst(light) >= 3) return light
  return worst(light) >= worst(dark) ? light : dark
}
