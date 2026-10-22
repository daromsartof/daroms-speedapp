import { z } from 'zod'

export const analyticsConfig = z.object({
  /** supabase : table analytics_events ; console : journal de dev. */
  sink: z.enum(['supabase', 'console']).default('supabase'),
  flushIntervalMs: z.number().int().min(2000).default(15000),
  /** Enregistre automatiquement chaque écran vu. */
  screens: z.boolean().default(true),
})

export type AnalyticsConfig = z.infer<typeof analyticsConfig>
