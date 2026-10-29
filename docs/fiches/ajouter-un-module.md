# Ajouter un module

1. `bun daroms module list` puis `bun daroms module add <slug>` (`auth`, `onboarding`, `settings`, `payments`, `push`, `analytics`, `ai-chat`, `camera`, `maps`).
   Ajoute les dépendances requises, routes, migrations, edge functions, variables `.env.example`, textes d'app, config du manifest, dépendances natives (`expo install`).
2. Régler `app.manifest.ts > modules.<slug>` (voir `core/modules/<slug>/README.md`).
3. Étapes hors code selon le module : fournisseurs Supabase Auth (Apple, Google), `bunx supabase secrets set ANTHROPIC_API_KEY=...` (ai-chat), produits RevenueCat (payments), `bunx supabase functions deploy <fonction>`, clé Google Maps Android `GOOGLE_MAPS_ANDROID_API_KEY` (maps, builds Android uniquement).
4. Module natif hors Expo Go (payments, push) : `bun daroms build development`.

Retirer : `bun daroms module remove <slug>` (les migrations déjà appliquées restent).
