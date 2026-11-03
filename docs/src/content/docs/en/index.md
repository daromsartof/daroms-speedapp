---
title: Daroms Speed App
description: An Expo + Tamagui + Supabase mobile framework built for Claude Code. The core ships the repetitive parts; your app only writes what is specific to it, so you can ship an app a day.
template: splash
hero:
  title: An idea in the morning, the app on your phone by evening.
  tagline: Daroms Speed App is an Expo, Tamagui and Supabase mobile framework built for Claude Code. The core ships the theme, components, data layer, modules and store publishing. Claude only writes what makes your app unique, under rules checked on every file.
  actions:
    - text: Follow the tutorial
      link: demarrer/tutoriel/
      icon: right-arrow
      variant: primary
    - text: Read the docs
      link: demarrer/introduction/
      variant: minimal
---

## Create an app

```bash
npx @daromsart/daroms-speed-app new my-app --variant tracker
```

Requirements: Bun >= 1.3, Node >= 22.18, Git, Python 3, and Expo Go on your phone. Details: [Installation](/en/demarrer/installation/).

## A day in four steps

`/daroms-day <idea>` chains the steps and waits for your approval between each one. Durations come from the pilot app.

| When | Steps | What happens |
|---|---|---|
| Morning, 1 h | `/daroms-idea`, `/daroms-new` | Claude writes the `app.spec.md` brief with you, then one command creates the whole app and shows the preview QR code. |
| Noon, 2 h | `/daroms-inspire`, `/daroms-brand`, `/daroms-design`, `/daroms-data` | References from Dribbble, Pinterest or Mobbin and a chosen direction, five values in `brand.ts` and the icon, text wireframes per screen, then Supabase tables with RLS. |
| Afternoon, 3 h | `/daroms-screen`, `/daroms-module`, `/daroms-check` | Each screen is generated, then filled with `@daroms/ui`; payments, notifications or AI chat come in as modules. |
| Evening, 1 h | `/daroms-store`, `/daroms-build`, `/daroms-submit` | FR and EN store listing, EAS build, upload to TestFlight and the Google Play internal track, then the bill: what the app cost in tokens and dollars. |

The full walkthrough, command by command: [Your app in a day](/en/demarrer/tutoriel/).

## What you no longer write

| You need | The core gives you |
|---|---|
| Light and dark themes | `brand.ts` and its 5 values: 11-shade OKLCH palettes, 8 sub-themes, radii, spacing and springs derived from the tone. |
| Components | 32 `@daroms/ui` components with loading, empty, error, accessibility and haptics built in, and 102 Lucide icons. |
| A data layer | `g table` writes the migration with RLS, the zod schema and TanStack Query hooks. With `--local`, the same hooks keep data on the device. |
| Common features | 9 modules, one command each: auth, onboarding, settings, payments, push, analytics, ai-chat, camera, maps. |
| A starting point | Variants `list-detail`, `tracker`, `ai-chat`, `social`, `shop` and `blank`, each with its modules, tables and screens. |
| Tooling | The `daroms` CLI, from `new` to `submit`, and 22 Claude skills that chain it. |

## Rules are checked, not suggested

Every write Claude makes goes through a hook. A hard-coded color, a Supabase call inside a component or text outside i18n is rejected with a short message; Claude fixes it and writes again. Then `tsc` and ESLint run on the touched file only.

```text
Write  src/features/books/BooksScreen.tsx
-  <YStack bg="#0F766E" p={14}>
daroms-check-rules refuse src/features/books/BooksScreen.tsx :
- couleur hex : utiliser un token (bg="card", color="color-11", brand-500)
- nombre magique de style : token (p="4", gap="stack", rounded="card")
Write  src/features/books/BooksScreen.tsx
+  <YStack theme="brand" bg="background" p="gutter">
daroms-typecheck : tsc et eslint sans erreur
```

- Thin routes: `app/**` only re-exports a screen.
- Styles: `@daroms/ui` components and Tamagui v3 tokens, nothing else.
- Data: Supabase only in `features/x/api.ts`, validated with zod.
- Database: RLS on every table, never a `service_role` key in the app.
- Screens: loading, empty, error with retry, data.

## Low token cost

A short always-loaded core, rules loaded only for the files being touched, a component catalog instead of sources, and mechanical steps (data, screens, modules, checks, polish, store listing) run in fresh-context Sonnet or Haiku subagents. `bun daroms cost` writes what each step cost to `app.cost.md`. Details (French): [The AI layer](/en/explications/couche-ia/).

## Docs your agent reads too

Every page also exists as Markdown at the same address with a `.md` suffix, and an index in the llms.txt format points to all of them: [`/llms.txt`](/llms.txt), [`/llms-full.txt`](/llms-full.txt).

:::note[Language]
The home, introduction, installation and tutorial pages are in English. Guides and reference are in French for now; they show up under `/en/` with a notice. The AI layer (skills, rules) and CLI messages are in French; Claude understands prompts in any language.
:::
