{{localImports}}import { z } from 'zod'

/** Ligne de la table locale {{table}} (appareil) ; les défauts sont appliqués à l'insertion. */
export const {{Singular}}Schema = z.object({
  id: z.string(),
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
