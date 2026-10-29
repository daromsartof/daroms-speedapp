# Daroms Speed App

Framework mobile **Expo SDK 58 + Tamagui v3 + Supabase**, piloté par Claude, pour sortir une app par jour.

- Cœur partagé (sous-module `core/` de chaque app) : `packages/` (theme, ui, data, lib, i18n, app, config), `modules/` (auth, onboarding, settings, payments, push, analytics, ai-chat, camera, maps), `template/` (+ variantes), `generators/`, `cli/`, `_ai/` (noyau, règles, skills, agents, hooks, contexte), `docs/`.
- Démarrer : `bun install` puis `bun cli/daroms.ts new mon-app --name "Mon app"`.
- Documentation : [docs/](docs/README.md) · tutoriel [ton app en un jour](docs/tutoriel-app-en-un-jour.md) · [catalogue UI](packages/ui/CATALOG.md).
- Vérifier le cœur : `bun run check`.
