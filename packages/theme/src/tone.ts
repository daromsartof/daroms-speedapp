// Presets par ton : tout ce que `tone` change en dehors des couleurs.
import type { Brand, RadiusPreset, Tone } from './brand'

export type ToneSpec = {
  /** Chroma des neutres (0 = gris pur). */
  surfaceChroma: number
  /** Multiplicateur appliqué au rayon de base. */
  radiusScale: number
  /** Rebond des ressorts (0 = amorti, 0.5 = très élastique). */
  bounce: number
  /** Graisse des titres. */
  headingWeight: '600' | '700' | '800'
  /** Interlettrage des titres. */
  headingTracking: number
  /** Espacements sémantiques (px). */
  space: { gutter: number; section: number; stack: number; inline: number; tight: number }
}

export const TONES: Record<Tone, ToneSpec> = {
  playful: {
    surfaceChroma: 0.018,
    radiusScale: 1.25,
    bounce: 0.35,
    headingWeight: '800',
    headingTracking: -0.4,
    space: { gutter: 20, section: 28, stack: 14, inline: 10, tight: 6 },
  },
  pro: {
    surfaceChroma: 0.01,
    radiusScale: 1,
    bounce: 0.12,
    headingWeight: '700',
    headingTracking: -0.3,
    space: { gutter: 16, section: 24, stack: 12, inline: 8, tight: 4 },
  },
  minimal: {
    surfaceChroma: 0,
    radiusScale: 0.75,
    bounce: 0,
    headingWeight: '600',
    headingTracking: -0.2,
    space: { gutter: 24, section: 32, stack: 16, inline: 8, tight: 4 },
  },
}

const BASE_RADIUS: Record<RadiusPreset, number> = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 12,
}
const PILL = 999

/** Rayons sémantiques : les composants utilisent `rounded="button"`, `rounded="card"`... */
export function semanticRadius(brand: Brand) {
  const scale = TONES[brand.tone].radiusScale
  const base = Math.round(BASE_RADIUS[brand.radius] * scale)
  const pill = brand.radius === 'full'
  return {
    button: pill ? PILL : base,
    input: pill ? PILL : base,
    card: pill ? 24 : Math.round(base * 1.5),
    sheet: pill ? 28 : Math.round(base * 1.5) + 8,
    chip: brand.radius === 'none' ? 0 : PILL,
    badge: brand.radius === 'none' ? 0 : PILL,
    avatar: PILL,
    pill: PILL,
  } as const
}

export function semanticSpace(brand: Brand) {
  return TONES[brand.tone].space
}

/** Durées (ms) partagées par les animations Tamagui et les animations Reanimated maison. */
export const DURATIONS = { fast: 160, medium: 280, slow: 420 } as const

export function springs(brand: Brand) {
  const bounce = TONES[brand.tone].bounce
  return {
    fast: { duration: DURATIONS.fast, bounce: Math.max(0, bounce - 0.1) },
    medium: { duration: DURATIONS.medium, bounce },
    slow: { duration: DURATIONS.slow, bounce: bounce * 0.6 },
    bouncy: { duration: 420, bounce: Math.min(0.6, bounce + 0.25) },
    lazy: { duration: 520, bounce: -0.2 },
  } as const
}

/** Z-index nommés (pas de nombre magique). La clé 0 satisfait la validation dev de Tamagui. */
export const Z_INDEX = {
  0: 0,
  base: 0,
  raised: 10,
  sticky: 50,
  dropdown: 100,
  sheet: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const
