---
name: daroms-module
description: Ajoute un module du cœur à l'app (auth, onboarding, settings, payments, push, analytics, ai-chat, camera, maps) - manifest, config plugin, écrans, migrations, variables d'environnement, étapes manuelles.
argument-hint: "<slug>"
---

# /daroms-module : ajouter un module

Module : $ARGUMENTS

1. `bun daroms module list` ; lire `core/modules/<slug>/README.md` (seul fichier du module à lire).
2. `bun daroms module add <slug>` (dépendances requises ajoutées d'abord ; routes, migrations, fonctions, variables `.env.example`, textes d'app).
3. Configurer `app.manifest.ts > modules.<slug>` selon `app.spec.md` (valeurs littérales).
4. Textes ajoutés au namespace app (ex. `onboarding.page1Title`, `paywall.title`) : les réécrire au ton de l'app en FR et EN.
5. Étapes hors code à signaler à l'utilisateur (liste courte) : fournisseurs Supabase Auth, secrets serveur (`bunx supabase secrets set`), produits RevenueCat, déploiement des fonctions (`bunx supabase functions deploy <nom>`), clé `GOOGLE_MAPS_ANDROID_API_KEY` (maps, build Android).
6. Module natif hors Expo Go (payments, push, MMKV) : prévoir `bun daroms build development`.
7. `bun daroms doctor --quick` puis `bun daroms shot /`.
8. **Stop** : ce qui marche, ce qui attend une action de l'utilisateur.
