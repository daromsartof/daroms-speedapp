---
paths:
  - "supabase/**"
---
# Base Supabase

> Structure uniquement par migration SQL ; RLS sur chaque table ; jamais de clé service_role côté app.

- Nouvelle table : `bun daroms g table` (préféré) ou `bun daroms db new <nom>` puis SQL à la main.
- Chaque table : `enable row level security` + politiques `select/insert/update/delete` `to authenticated` avec `(select auth.uid()) = user_id`.
- Index sur toute colonne de filtre (`user_id`, clés étrangères). `updated_at` via `public.daroms_set_updated_at()`.
- Ne jamais modifier une migration déjà poussée : en créer une nouvelle.
- Appliquer : `bun daroms db push` (puis types régénérés). Edge functions : `supabase/functions/<nom>/index.ts` (Deno).
- Secrets serveur : `bunx supabase secrets set NOM=...` ; jamais dans `.env` de l'app (seules les clés publiques `EXPO_PUBLIC_*`).
- Détails avancés (tables partagées, storage, realtime) : `.claude/rules-ondemand/daroms-supabase-advanced.md`.
