---
title: "Tutorial: your app in a day"
description: A full day, from the idea to the app installed on a phone and submitted to the stores, with Claude skills and daroms commands.
sidebar:
  order: 3
  label: Your app in a day
---

Goal: start from an idea in the morning and install the app on a phone by evening, letting Claude do the repetitive work. Durations come from the pilot app (Lecture, a reading tracker).

:::note[One command]
`/daroms-day <idea>` chains every step below and stops for your approval between each one. This tutorial details what it does, so you can also run a single step.
:::

## Requirements (once)

- Node >= 22.18, Bun >= 1.3, Python 3, Git; Android Studio (emulator) or Xcode (simulator) optional.
- Accounts: Expo (EAS), Supabase; Apple Developer and Google Play to publish.
- The CLI: nothing to install, `npx @daromsart/daroms-speed-app` downloads it from npm; or `npm install -g @daromsart/daroms-speed-app` to have `daroms` everywhere.

Details: [Installation](/en/demarrer/installation/).

## Morning: scope and create (1 h)

1. Open Claude Code in your projects folder and run `/daroms-day An app to track my reading habits`.
2. **Scoping** (`/daroms-idea`): Claude writes `app.spec.md` (audience, core loop, 3 to 6 screens, tables, modules, monetization, name, tone, variant). Read and approve it: it is the single source for every following step.
3. **Creation** (`/daroms-new`): one command creates the whole app:
   ```bash
   npx @daromsart/daroms-speed-app new lecture --name "Lecture" --variant tracker --primary "#0F766E" --accent "#F59E0B" --tone minimal
   ```
   Template, `core/` submodule, `brand.ts`, `app.manifest.ts`, the variant's modules, generated icons, dependencies, AI layer (`.claude/`), first commit.
4. `cd lecture && cp .env.example .env` (Supabase URL and public key), then `bun daroms dev`: scan the QR code with Expo Go.

## Noon: inspiration, brand, design, data (2 h)

5. **Inspiration** (`/daroms-inspire`): Claude looks for mockups and published apps on Dribbble, Pinterest, Behance, Mobbin and Screens Design, looks at the previews (`bun daroms inspire <url>`), proposes 2 or 3 directions and writes the one you pick into `app.spec.md > Inspiration`. It takes inspiration without copying anything.
6. **Brand** (`/daroms-brand`): 5 values in `brand.ts`, an SVG icon in `assets/source/icon.svg`, then `bun daroms assets`. Check `/_dev/kitchen-sink` in light and dark. See [Changing the brand](/en/guides/changer-la-marque/) (French).
7. **Design** (`/daroms-design`): text wireframes per screen in `app.spec.md`, using only components from the [catalog](/en/reference/composants/) (French).
8. **Data** (`/daroms-data`): `bun daroms g table books --fields "title:text, author:text?, pages:int=0"` creates the migration with RLS, the zod schema, the `useBooks`, `useCreateBook`... hooks, then `bun daroms db push`. See [Adding a table](/en/guides/ajouter-une-table/) (French).

## Afternoon: screens and modules (3 h)

9. **Screens** (`/daroms-screen books --tab --icon BookOpen`): thin route, feature, 4 states, FR/EN strings, test; Claude fills it with `@daroms/ui` and checks it with `bun daroms shot /books`. See [Adding a screen](/en/guides/ajouter-un-ecran/) (French).
10. **Modules** (`/daroms-module payments`): RevenueCat paywall, Pro status, restore purchases; same for `push`, `ai-chat`, `analytics`, `camera` (photos to Supabase Storage), `maps` (map, location). See [Adding a module](/en/guides/ajouter-un-module/) (French).
11. **Checks** (`/daroms-check`) then **polish** (`/daroms-polish`): visual review by the `daroms-designer` agent. See [Checking](/en/guides/verifier/) (French).

Data, screens, modules, checks, polish and the store listing run in fresh-context Sonnet subagents: only their summary comes back to the conversation, which keeps the cost of the day down.

## Evening: publish (1 h)

12. **Store listing** (`/daroms-store`): FR/EN titles, keywords, descriptions, screenshots, privacy policy.
13. **Build** (`/daroms-build preview`): internal install through a QR code; then `production` and `/daroms-submit` (TestFlight, internal track). See [Publishing](/en/guides/publier/) (French).
14. **Wrap-up**: `/daroms-learn` (context zones), then `bun daroms cost` writes `app.cost.md`: the app's tokens and price by step, model and session, at Anthropic API rates. It is the number to beat with the next app. Finally `/daroms-commit`.

## Next

- A JavaScript fix with no native change: `bun daroms update production --message "..."`.
- A new core version: [Updating the core](/en/guides/mettre-a-jour-le-coeur/) (French).
