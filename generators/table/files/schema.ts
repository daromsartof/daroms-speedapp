import { z } from 'zod'

/** Ligne de la table {{table}} (miroir de la migration). */
export const {{Singular}}Schema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
{{zodFields}}
  created_at: z.string(),
  updated_at: z.string(),
})

/** Données saisies (création / modification) ; messages = clés i18n. */
export const {{Singular}}InputSchema = z.object({
{{inputFields}}
})

export type {{Singular}} = z.infer<typeof {{Singular}}Schema>
export type {{Singular}}Input = z.infer<typeof {{Singular}}InputSchema>
