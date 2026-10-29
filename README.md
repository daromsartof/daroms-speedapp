# Daroms Speed App

Framework mobile **Expo SDK 58 + Tamagui v3 + Supabase**, piloté par Claude, pour sortir une app par jour.

- Cœur partagé (sous-module `core/` de chaque app) : `packages/` (theme, ui, data, lib, i18n, app, config), `modules/` (auth, onboarding, settings, payments, push, analytics, ai-chat, camera, maps), `template/` (+ variantes), `generators/`, `cli/`, `_ai/` (noyau, règles, skills, agents, hooks, contexte), `docs/`.
- Démarrer : `bun install` puis `bun cli/daroms.ts new mon-app --name "Mon app"`.
- Documentation : https://daromsartof.github.io/daroms-speedapp/ (sources dans [docs/](docs/README.md), `bun run docs:dev`) · tutoriel [ton app en un jour](docs/src/content/docs/demarrer/tutoriel.md) · [catalogue UI](packages/ui/CATALOG.md).
- Pour les agents : [llms.txt](https://daromsartof.github.io/daroms-speedapp/llms.txt), et chaque page en Markdown (suffixe `.md`).
- Vérifier le cœur : `bun run check`.
