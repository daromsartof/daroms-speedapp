import { z } from 'zod'

export const crashConfig = z.object({
  /** Organisation et projet Sentry : nécessaires pour envoyer les source maps au build (traces lisibles). */
  organization: z.string().default(''),
  project: z.string().default(''),
  url: z.string().url().default('https://sentry.io/'),
  /** Part des sessions mesurées en performance (0 à 1) ; les erreurs, elles, sont toutes envoyées. */
  tracesSampleRate: z.number().min(0).max(1).default(0.1),
  /** Envoie e-mail et adresse IP de l'utilisateur : à déclarer dans la politique de confidentialité. */
  sendDefaultPii: z.boolean().default(false),
  /** Envoie aussi en développement (sinon seules les versions de production remontent). */
  enableInDev: z.boolean().default(false),
})

export type CrashConfig = z.infer<typeof crashConfig>
