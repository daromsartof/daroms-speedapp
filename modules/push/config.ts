import { z } from 'zod'

export const pushConfig = z.object({
  /** Demander la permission dès la connexion (sinon depuis les réglages ou un écran dédié). */
  askOnLaunch: z.boolean().default(false),
})

export type PushConfig = z.infer<typeof pushConfig>
