import { z } from 'zod'

export const paymentsConfig = z.object({
  /** Identifiant d'entitlement RevenueCat qui débloque la version Pro. */
  entitlement: z.string().default('pro'),
  /** soft : paywall à la demande ; hard : paywall obligatoire après connexion. */
  mode: z.enum(['soft', 'hard']).default('soft'),
  /** Offering RevenueCat (défaut : l'offering courante). */
  offering: z.string().optional(),
  /** Clés i18n (namespace app) des avantages listés sur le paywall. */
  features: z.array(z.string()).default(['paywall.feature1', 'paywall.feature2', 'paywall.feature3']),
})

export type PaymentsConfig = z.infer<typeof paymentsConfig>
