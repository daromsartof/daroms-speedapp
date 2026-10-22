import { z } from 'zod'

export const onboardingConfig = z.object({
  /** Incrémenter pour réafficher l'onboarding après une refonte. */
  version: z.number().int().positive().default(1),
  /** Pages : icône Lucide + clés i18n du namespace app (locales/*.json). */
  pages: z
    .array(z.object({ icon: z.string(), titleKey: z.string(), descriptionKey: z.string() }))
    .min(1)
    .default([{ icon: 'Sparkles', titleKey: 'onboarding.page1Title', descriptionKey: 'onboarding.page1Description' }]),
})

export type OnboardingConfig = z.infer<typeof onboardingConfig>
