import { z } from 'zod'

import { isHex } from './color.ts'

const hex = z.string().refine(isHex, { message: 'Couleur hex attendue (#RRGGBB)' })

/** Les 5 valeurs de marque : changer d'identité visuelle = changer ces valeurs. */
export const BrandSchema = z.object({
  /** Couleur principale (boutons, liens, éléments actifs). */
  primary: hex,
  /** Couleur d'accent (mises en avant, badges, illustrations). */
  accent: hex,
  /** Police : 'inter' (embarquée) ou 'system' (San Francisco / Roboto). */
  font: z.enum(['inter', 'system']).default('inter'),
  /** Rayon de base des composants. */
  radius: z.enum(['none', 'sm', 'md', 'lg', 'xl', 'full']).default('lg'),
  /** Ton général : influence rayons, espacements, graisses, rebond des animations, neutres. */
  tone: z.enum(['playful', 'pro', 'minimal']).default('pro'),
})

export type BrandInput = z.input<typeof BrandSchema>
export type Brand = z.output<typeof BrandSchema>
export type Tone = Brand['tone']
export type RadiusPreset = Brand['radius']

/** Valide et complète la marque (à utiliser dans `brand.ts`). */
export function defineBrand(input: BrandInput): Brand {
  return BrandSchema.parse(input)
}
