# Module ai-chat

Assistant conversationnel Claude en streaming. Requiert `auth`.

- Activer : `bun daroms module add ai-chat` (onglet Chat, migration `ai_conversations` / `ai_messages`, edge function `ai-chat`).
- Secrets serveur (jamais dans l'app) : `bunx supabase secrets set ANTHROPIC_API_KEY=...`
  - `AI_CHAT_MODEL` (défaut `claude-opus-5-5`), `AI_CHAT_SYSTEM` (prompt système), `AI_CHAT_DAILY_LIMIT` (défaut 50 messages / 24 h).
- Déployer : `bunx supabase functions deploy ai-chat`.
- Effort `low` (réponses rapides) ; repli automatique côté serveur si le modèle décline (`fallbacks: "default"`), sinon message « ne peut pas répondre ».
- Config app : `suggestions` (clés i18n affichées quand la conversation est vide).
