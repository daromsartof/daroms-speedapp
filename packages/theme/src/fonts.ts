// Polices : échelle numérique 1 à 10 (+ noms Tailwind xs..9xl fournis par la config v6).
import { withTailwindTypeScale } from '@tamagui/config/v6-base'
import { createFont, isWeb } from 'tamagui'

import type { Brand } from './brand'
import { TONES } from './tone'

/** Taille de police par niveau typographique. */
export const FONT_SIZES = {
  1: 11,
  2: 12,
  3: 13,
  4: 15,
  5: 17,
  6: 20,
  7: 24,
  8: 28,
  9: 34,
  10: 40,
} as const

/** Fichiers Inter à charger avec expo-font (clé = nom de famille natif). */
export const INTER_FILES = {
  Inter: 'Inter-Regular',
  InterMedium: 'Inter-Medium',
  InterSemiBold: 'Inter-SemiBold',
  InterBold: 'Inter-Bold',
  InterExtraBold: 'Inter-ExtraBold',
} as const

const lineHeights = (ratio: number) =>
  Object.fromEntries(Object.entries(FONT_SIZES).map(([k, v]) => [k, Math.round(v * ratio)])) as {
    [K in keyof typeof FONT_SIZES]: number
  }

const interFace = {
  400: { normal: 'Inter' },
  500: { normal: 'InterMedium' },
  600: { normal: 'InterSemiBold' },
  700: { normal: 'InterBold' },
  800: { normal: 'InterExtraBold' },
}

const SYSTEM_FAMILY = isWeb
  ? '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  : 'System'

export function createBrandFonts(brand: Brand) {
  const tone = TONES[brand.tone]
  const inter = brand.font === 'inter'
  const family = inter ? (isWeb ? 'Inter, system-ui, sans-serif' : 'Inter') : SYSTEM_FAMILY
  const face = inter && !isWeb ? interFace : undefined
  const body = createFont({
    family,
    size: FONT_SIZES,
    lineHeight: lineHeights(1.4),
    weight: { 1: '400', 4: '400', 5: '500' },
    letterSpacing: { 1: 0, 4: 0 },
    ...(face ? { face } : {}),
  })
  const heading = createFont({
    family,
    size: FONT_SIZES,
    lineHeight: lineHeights(1.2),
    weight: { 1: tone.headingWeight, 4: tone.headingWeight },
    letterSpacing: { 1: 0, 6: tone.headingTracking, 9: tone.headingTracking * 2 },
    ...(face ? { face } : {}),
  })
  return {
    body: withTailwindTypeScale(body),
    heading: withTailwindTypeScale(heading),
  }
}
