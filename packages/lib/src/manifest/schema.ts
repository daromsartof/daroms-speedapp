// Schéma du manifest d'app. Chargé par Node (app.config.ts) : n'importer que zod
// et n'utiliser que de la syntaxe TypeScript effaçable (ni enum, ni namespace).
import { z } from 'zod'

const semver = /^\d+\.\d+\.\d+$/
const bundleId = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9-]*)+$/

export const LOCALES = ['fr', 'en', 'es', 'de', 'it', 'pt'] as const
export const VARIANTS = ['blank', 'list-detail', 'social', 'tracker', 'ai-chat', 'shop'] as const

export const TabSchema = z.object({
  /** Nom de la route dans app/(tabs)/ (index pour l'accueil). */
  name: z.string().regex(/^[a-z0-9-]+$/),
  /** Nom d'icône Lucide présent dans @daroms/ui/icons. */
  icon: z.string(),
  /** Clé i18n du titre. */
  titleKey: z.string(),
})

export const ManifestSchema = z.object({
  name: z.string().min(1).max(30),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  bundleId: z.string().regex(bundleId),
  version: z.string().regex(semver).default('1.0.0'),
  scheme: z.string().regex(/^[a-z][a-z0-9+.-]*$/).optional(),
  variant: z.enum(VARIANTS).default('blank'),
  locales: z.array(z.enum(LOCALES)).min(1).default(['fr', 'en']),
  defaultLocale: z.enum(LOCALES).default('fr'),
  orientation: z.enum(['portrait', 'landscape', 'default']).default('portrait'),
  /** Écrans de l'app (features). Vérifiés par `daroms doctor`. */
  screens: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
  tabs: z.array(TabSchema).default([]),
  /** Modules activés et leur configuration (validée par core/modules/<slug>/config.ts). */
  modules: z.record(z.string(), z.record(z.string(), z.unknown())).default({}),
  monetization: z
    .object({
      model: z.enum(['free', 'freemium', 'subscription', 'paid']).default('free'),
      entitlement: z.string().default('pro'),
      trialDays: z.number().int().nonnegative().default(0),
    })
    .default({ model: 'free', entitlement: 'pro', trialDays: 0 }),
  supabase: z.object({ projectRef: z.string().optional() }).default({}),
  eas: z.object({ projectId: z.string().optional(), owner: z.string().optional() }).default({}),
  store: z
    .object({
      category: z.string().optional(),
      supportEmail: z.string().email().optional(),
      privacyUrl: z.string().url().optional(),
      termsUrl: z.string().url().optional(),
    })
    .default({}),
})

export type ManifestInput = z.input<typeof ManifestSchema>
export type Manifest = z.output<typeof ManifestSchema>
export type ManifestTab = z.output<typeof TabSchema>

/** Valide le manifest (utilisé dans app.manifest.ts). */
export function defineManifest(input: ManifestInput): Manifest {
  return ManifestSchema.parse(input)
}
