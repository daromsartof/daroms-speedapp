---
title: Introduction
description: What Daroms Speed App is, who it is for, its principles and what it provides, on one page.
sidebar:
  order: 1
---

Daroms Speed App is an **Expo SDK 58 + Tamagui v3 + Supabase** mobile framework built to be driven by Claude Code. Its goal: start from an idea in the morning and install the app on a phone by evening, with clean, checked code.

## The principle: one core, many apps

The `daroms-speed-app` repository is a **versioned core**. Each app embeds it as a git submodule in `core/` and only writes what is specific to it:

| Provided by the core (`core/`) | Written in the app |
|---|---|
| Theme, 32 components, icons (`@daroms/ui`, `@daroms/theme`) | `brand.ts`: 5 brand values |
| Supabase client, errors, queries (`@daroms/data`) | `src/features/<x>/`: screens, hooks, `api.ts` |
| Modules: auth, payments, push, AI chat, maps... | `app.manifest.ts`: enabled modules, tabs |
| Generators, `daroms` CLI, AI layer (`_ai/`) | `locales/*.json`, `supabase/migrations/` |

Updating the core in an app means switching the submodule version. See [the architecture](/en/explications/architecture/) (French).

## Five ideas behind the framework

1. **Generate before writing.** Screen, table, module: `bun daroms g ...` produces the repetitive parts from templates, without AI. Claude fills in the rest.
2. **Enforced rules, not advice.** Hard-coded colors, Supabase inside a component, text outside i18n: a hook rejects the write and explains what to do. See [the rules](/en/reference/regles/) (French).
3. **One brand, one theme.** `brand.ts` (primary color, accent, font, radius, tone) generates palettes, light and dark themes and sub-themes. See [the brand](/en/reference/marque/) (French).
4. **An optional feature is a module.** `bun daroms module add payments` adds dependencies, routes, migrations and configuration. See [the modules](/en/reference/modules/auth/) (French).
5. **Low token cost.** A short always-loaded core, rules loaded only for the files being touched, a component catalog instead of sources, and mechanical steps in Sonnet or Haiku subagents. See [the AI layer](/en/explications/couche-ia/) (French).

## Who it is for

- A developer or a small team shipping many mobile apps who wants the same foundation everywhere.
- An agent (Claude Code) working in a daroms app: this documentation also exists as Markdown, see [Using with an agent](/en/agents/utiliser-avec-un-agent/) (French).

## Fixed choices

- **Expo** (Expo Router, New Architecture, React Native 0.88), **EAS** for builds, store submission and OTA updates.
- **Tamagui v3** for theme and UI: no other UI library, a single icon set (Lucide).
- **Supabase**: authentication, Postgres with RLS, Storage, edge functions.
- **Bun** for workspaces, the CLI and scripts; strict TypeScript.

## Where to start

- Install and create a first app: [Installation](/en/demarrer/installation/).
- Build a complete app, step by step: [Tutorial: your app in a day](/en/demarrer/tutoriel/).
- Understand what an app contains: [App structure](/en/demarrer/structure-app/) (French).
