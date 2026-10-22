import { z } from 'zod'

export const settingsConfig = z.object({
  appearance: z.boolean().default(true),
  language: z.boolean().default(true),
  haptics: z.boolean().default(true),
})

export type SettingsConfig = z.infer<typeof settingsConfig>
