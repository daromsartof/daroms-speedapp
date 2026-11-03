# Daroms Speed App

**English** · [Français](https://github.com/daromsartof/daroms-speedapp/blob/main/README.fr.md)

[![npm](https://img.shields.io/npm/v/@daromsart/daroms-speed-app?color=3347ff&label=npm)](https://www.npmjs.com/package/@daromsart/daroms-speed-app)
[![MIT license](https://img.shields.io/npm/l/@daromsart/daroms-speed-app?color=3347ff)](https://www.npmjs.com/package/@daromsart/daroms-speed-app?activeTab=code)
![Expo SDK 58](https://img.shields.io/badge/Expo-SDK%2058-121a3a)
![Tamagui v3](https://img.shields.io/badge/Tamagui-v3-121a3a)
![Bun >= 1.3](https://img.shields.io/badge/Bun-%3E%3D%201.3-121a3a)

**An idea in the morning, the app on your phone by evening.**

An **Expo + Tamagui + Supabase** mobile framework built for Claude Code. The core ships the theme, components, data layer, modules and store publishing; your app only writes what is specific to it, under rules checked on every file.

- **Generate before writing**: screens, tables and modules come from deterministic templates, no AI involved. Claude only fills in what is specific.
- **One brand, one theme**: 5 values in `brand.ts` produce OKLCH palettes, light and dark themes, radii, spacing and springs.
- **Enforced rules**: hard-coded color, Supabase inside a component, text outside i18n: a hook rejects the write and says what to do instead.
- **Opt-in modules**: auth, payments, push, AI chat, photos, maps... one command each.
- **Low token cost**: a short always-loaded core, rules loaded only for the files being touched, a component catalog instead of sources, and mechanical steps run in fresh-context Sonnet or Haiku subagents.

Full documentation: **https://daromsartof.github.io/daroms-speedapp/en/**

> The documentation site starts in English with the home, installation and tutorial pages; guides and reference are in French for now. The AI layer (skills, rules) and CLI messages are in French; Claude understands prompts in any language.

## Create an app

Requirements: [Bun](https://bun.sh) >= 1.3, Node >= 22.18, Git, Python 3, and [Expo Go](https://expo.dev/go) on your phone.

```bash
npx @daromsart/daroms-speed-app new my-app --name "My app" --variant list-detail
cd my-app
cp .env.example .env    # Supabase URL and public key
bun daroms dev          # scan the QR code with Expo Go
```

Global command: `npm install -g @daromsart/daroms-speed-app`, then `daroms new my-app`. The CLI runs on Bun.

`daroms new` copies the template, adds the core in `core/`, writes `brand.ts` and `app.manifest.ts`, enables the variant's modules, generates tables and screens, icons and splash, installs dependencies, syncs the AI layer into `.claude/` and makes the first commit. `core/` is a git submodule pinned to the installed version; if the core repository is unreachable, it is a copy of the core shipped in this package.

No Supabase to start with: `--local` keeps data on the device, behind the same hooks.

## With Claude Code

Open Claude Code in the app, then:

```text
/daroms-day An app to track my reading habits
```

| Time | Skills | Result |
|---|---|---|
| Morning | `/daroms-idea`, `/daroms-new` | `app.spec.md` brief, app created, QR preview |
| Noon | `/daroms-inspire`, `/daroms-brand`, `/daroms-design`, `/daroms-data` | Dribbble, Pinterest and Mobbin references and a chosen direction, brand and icon, wireframes, Supabase tables with RLS |
| Afternoon | `/daroms-screen`, `/daroms-module`, `/daroms-check`, `/daroms-polish` | screens, modules, checks, UX polish |
| Evening | `/daroms-store`, `/daroms-build`, `/daroms-submit` | FR/EN store listing, EAS build, TestFlight and internal track, then `app.cost.md`: what the app cost in tokens and dollars |

22 skills, 3 subagents (designer, reviewer, store) and 6 hooks (sync, context router, rule checks, typecheck, `.env` protection, token stats). The [ECC](https://ecc.tools) method is built in: `ecc-tdd-workflow`, `ecc-security-review`, `ecc-accessibility` and `ecc-typescript-patterns`, vendored in the core and mapped to daroms commands by `daroms-ecc`. Details: [skills](https://daromsartof.github.io/daroms-speedapp/en/reference/skills/), [hooks](https://daromsartof.github.io/daroms-speedapp/en/reference/hooks/).

## Example: a table and its screen

```bash
bun daroms g table books --fields "title:text, author:text?, pages:int=0"
bun daroms g screen books --tab --icon BookOpen --title "Livres" --title-en "Books"
bun daroms db push
```

The first command writes the migration (owner RLS on all 4 operations), the zod schema and the `useBooks`, `useBook`, `useCreateBook`, `useUpdateBook`, `useDeleteBook` hooks. The second writes the route, the screen with its 4 states, FR/EN strings, the test and the tab. The screen is filled with `@daroms/ui`:

```tsx
// src/features/books/BooksScreen.tsx
import { useT } from '@daroms/i18n'
import { Header, ListItem, QueryView, Screen } from '@daroms/ui'
import { BookOpen } from '@daroms/ui/icons'

import { useBooksScreen } from './hooks'

export default function BooksScreen() {
  const t = useT()
  const { query } = useBooksScreen()
  return (
    <Screen header={<Header title={t('books.title')} large />}>
      <QueryView query={query} empty={{ icon: BookOpen, title: t('books.emptyTitle') }}>
        {(books) => books.map((book) => <ListItem key={book.id} title={book.title} subtitle={book.author ?? undefined} chevron />)}
      </QueryView>
    </Screen>
  )
}
```

## What's in the package

| Folder | Content |
|---|---|
| `packages/` | `@daroms/theme` (theme from `brand.ts`), `@daroms/ui` (32 components, 102 Lucide icons, `CATALOG.md`), `@daroms/data` (Supabase, queries, errors, local tables), `@daroms/lib` (formatting, dates, zod, storage, haptics), `@daroms/i18n`, `@daroms/app` (providers, gates, modules, layouts), `@daroms/config` |
| `modules/` | `auth`, `onboarding`, `settings`, `payments` (RevenueCat), `push`, `analytics`, `ai-chat` (streaming Claude), `camera` (Supabase Storage), `maps` |
| `template/` | starter app and 5 variants: `list-detail`, `tracker`, `ai-chat`, `social`, `shop` (plus `blank`) |
| `generators/` | screen, table and module templates |
| `cli/` | the `daroms` command |
| `_ai/` | AI layer: core instructions, rules, skills, agents, hooks, context zones |

The `@daroms/*` packages are TypeScript sources linked through a Bun workspace from `core/`, with no build step.

## Commands

| Command | Purpose |
|---|---|
| `new <slug>` | create an app (`--variant`, `--local`, `--primary`, `--accent`, `--tone`, `--modules`...) |
| `dev` | Expo server and QR code (Expo Go, or `--dev-client`) |
| `doctor` | Node, `.env`, manifest, i18n, rules, TypeScript, ESLint, expo-doctor |
| `g screen \| feature \| table \| module` | generate |
| `module add \| remove \| list` | modules |
| `shot <route>` | visual check: errors and overflows first, screenshot when useful |
| `test`, `e2e` | jest-expo, Maestro |
| `assets` | icon, adaptive icon, splash, favicon from one SVG |
| `inspire <url...>` | inspiration previews (image or page) in `.daroms/inspiration/` for Claude to look at |
| `cost` | the app's tokens and price (Anthropic API rates) by step, model and session, written to `app.cost.md` |
| `db new \| push \| types \| reset` | Supabase migrations and types |
| `build`, `submit`, `update` | EAS: builds, stores, OTA updates |

All options: [CLI reference](https://daromsartof.github.io/daroms-speedapp/en/reference/cli/).

## Documentation

- [Tutorial: your app in a day](https://daromsartof.github.io/daroms-speedapp/en/demarrer/tutoriel/)
- [Installation](https://daromsartof.github.io/daroms-speedapp/en/demarrer/installation/)
- Guides (French): [screen](https://daromsartof.github.io/daroms-speedapp/guides/ajouter-un-ecran/), [table](https://daromsartof.github.io/daroms-speedapp/guides/ajouter-une-table/), [module](https://daromsartof.github.io/daroms-speedapp/guides/ajouter-un-module/), [forms](https://daromsartof.github.io/daroms-speedapp/guides/formulaires/), [brand](https://daromsartof.github.io/daroms-speedapp/guides/changer-la-marque/), [publishing](https://daromsartof.github.io/daroms-speedapp/guides/publier/)
- Reference (French): [components](https://daromsartof.github.io/daroms-speedapp/reference/composants/), [manifest](https://daromsartof.github.io/daroms-speedapp/reference/manifest/), [tokens](https://daromsartof.github.io/daroms-speedapp/reference/tokens/), [rules](https://daromsartof.github.io/daroms-speedapp/reference/regles/)
- For agents: [`llms.txt`](https://daromsartof.github.io/daroms-speedapp/llms.txt), [`llms-full.txt`](https://daromsartof.github.io/daroms-speedapp/llms-full.txt), and every page as Markdown (`.md` suffix)

## Versions

The core follows semantic versioning; breaking changes only ship in major versions (`CHANGELOG.md` in the package). Updating an app: [guide](https://daromsartof.github.io/daroms-speedapp/guides/mettre-a-jour-le-coeur/) (French).

## Developing the core

```bash
git clone https://github.com/daromsartof/daroms-speedapp.git daroms-speed-app
cd daroms-speed-app && bun install
bun run check                     # tsc, eslint, jest, CLI tests, hook tests
bun run docs:dev                  # documentation site (docs/)
bun daroms release-core minor     # version, changelog, tag; git push --follow-tags publishes to npm
```

Details: [Developing the core](https://daromsartof.github.io/daroms-speedapp/guides/developper-le-coeur/) (French).

## License

MIT, full text in the package's `LICENSE` file.
