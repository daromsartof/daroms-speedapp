# Daroms Speed App

Framework mobile **Expo SDK 58 + Tamagui v3 + Supabase**, piloté par Claude, pour sortir une app par jour.

- Cœur partagé (sous-module `core/` de chaque app) : `packages/` (theme, ui, data, lib, i18n, app, config), `modules/` (auth, onboarding, settings, payments, push, analytics, ai-chat, camera, maps), `template/` (+ variantes), `generators/`, `cli/`, `_ai/` (noyau, règles, skills, agents, hooks, contexte), `docs/`.
- Créer une app : `bunx @daromsart/daroms-speed-app new mon-app --name "Mon app"` (paquet npm [`@daromsart/daroms-speed-app`](https://www.npmjs.com/package/@daromsart/daroms-speed-app), Bun requis).
- Développer le cœur : `bun install` puis `bun run check` ; publier : `bun daroms release-core minor` puis `git push --follow-tags` (publication npm par le CI).
- Documentation : https://daromsartof.github.io/daroms-speedapp/ (sources dans [docs/](docs/README.md), `bun run docs:dev`) · tutoriel [ton app en un jour](docs/src/content/docs/demarrer/tutoriel.md) · [catalogue UI](packages/ui/CATALOG.md).
- Pour les agents : [llms.txt](https://daromsartof.github.io/daroms-speedapp/llms.txt), et chaque page en Markdown (suffixe `.md`).

Licence MIT.
