import { z } from 'zod'

export const authConfig = z.object({
  /** Méthodes proposées. Apple est obligatoire sur iOS dès qu'une connexion sociale existe. */
  providers: z.array(z.enum(['email', 'apple', 'google'])).min(1).default(['email', 'apple', 'google']),
  /** true : toute l'app exige une session ; false : connexion à la demande. */
  requireAuth: z.boolean().default(true),
})

export type AuthConfig = z.infer<typeof authConfig>
