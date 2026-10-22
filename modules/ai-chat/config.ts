import { z } from 'zod'

// Le modèle et le prompt système vivent côté serveur (secrets Supabase), jamais dans l'app.
export const aiChatConfig = z.object({
  /** Clés i18n (namespace app) des suggestions affichées quand la conversation est vide. */
  suggestions: z.array(z.string()).default([]),
})

export type AiChatConfig = z.infer<typeof aiChatConfig>
