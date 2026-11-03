---
title: Installation
description: Requirements, the global daroms command and creating a first app running on your phone.
sidebar:
  order: 2
---

## Requirements

| Tool | Version | Why |
|---|---|---|
| Node | >= 22.18 | `app.config.ts` loads the TypeScript manifest directly |
| Bun | >= 1.3 | workspaces, the `daroms` CLI, CLI tests |
| Python 3 | - | AI layer hooks (`_ai/hooks/*.py`) |
| Git | - | the core is a submodule of every app |
| Expo Go (phone) | SDK 58 | instant preview through a QR code |
| Android Studio or Xcode | optional | emulator, simulator, local builds |

Accounts: Expo (EAS) and Supabase to develop; Apple Developer and Google Play to publish.

## Create a first app

The framework is published on npm (`@daromsart/daroms-speed-app`, `daromsart` organization). From the folder that will hold your projects:

```bash
npx @daromsart/daroms-speed-app new my-app --name "My app" --variant list-detail
cd my-app
cp .env.example .env    # Supabase URL and public key
bun daroms dev          # scan the QR code with Expo Go
```

Optional global command: `npm install -g @daromsart/daroms-speed-app`, then `daroms new my-app` from anywhere. The CLI runs on Bun: `npx` does not work without Bun installed.

`daroms new` copies the template, adds the core as the `core/` submodule, writes `brand.ts` and `app.manifest.ts`, enables the variant's modules, generates tables and screens and the icons, installs dependencies, syncs the AI layer into `.claude/` and makes the first commit. All options: [CLI, `new`](/en/reference/cli/#new) (French).

Where `core/` comes from:

| Case | Result |
|---|---|
| CLI installed from npm, core repository reachable | git submodule pinned to the installed version's tag (`v0.5.0`...) |
| CLI installed from npm, repository unreachable | copy of the core shipped in the package (no submodule) |
| CLI run from a clone of the core | submodule of the clone's remote, default branch |
| `--copy`, `--link`, `--core <url>` | copy, symbolic link, submodule of the given URL |

## Working on the core itself

To change the framework (not to create an app):

```bash
git clone https://github.com/daromsartof/daroms-speedapp.git daroms-speed-app
cd daroms-speed-app
bun install
bun run check   # tsc, eslint, jest, CLI tests, hook tests
```

`bun link` in the clone makes the `daroms` command global and points it at your sources. See [Developing the core](/en/guides/developper-le-coeur/) (French).

:::tip[No Supabase to start with]
`--local` keeps the variant's tables on the device (same hooks). Without `.env`, the app starts and Supabase stays disabled.
:::

## Check the installation

```bash
bun daroms doctor          # Node, .env, manifest, i18n, rules, types, lint, expo-doctor
bun daroms shot /          # web render of the home screen: errors and overflows
```

Blank screen, QR code that does not load, native module missing in Expo Go: see [Troubleshooting](/en/guides/depanner/) (French).

## With Claude Code

Open Claude Code in the app folder: when the session starts, the `daroms-sync` hook copies rules, skills and hooks from `core/_ai/` into `.claude/`. Then:

```text
/daroms-day An app to track my reading habits
```

The full day is described in the [tutorial](/en/demarrer/tutoriel/).
