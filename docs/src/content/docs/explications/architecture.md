---
title: "Architecture"
description: "Un cœur versionné en sous-module, des paquets TypeScript liés, une configuration pilotée par le manifest, des modules activables et des générateurs déterministes."
---

## Un cœur, des apps

Le dépôt `daroms-speed-app` est un **cœur versionné** ajouté à chaque app comme sous-module `core/`. L'app déclare `core/packages/*` (et les modules actifs `core/modules/<slug>`) comme workspaces Bun : les paquets `@daroms/*` sont des sources TypeScript liées, sans étape de build. Une app ne contient que son spécifique : `src/features`, `locales`, `supabase/migrations`, `brand.ts`, `app.manifest.ts`, `app.spec.md`.

| Paquet | Rôle |
|---|---|
| `@daroms/theme` | `createBrandTheme(brand)` : palettes OKLCH 11 nuances, thèmes Tamagui v3 (light/dark, sous-thèmes), tokens sémantiques, polices, ressorts |
| `@daroms/ui` | composants (états, a11y, haptique intégrés), icônes Lucide générées, `CATALOG.md` ([catalogue](/reference/composants/)) |
| `@daroms/data` | client Supabase typé par `Register`, session, QueryClient, erreurs traduites, `parseOrThrow` |
| `@daroms/lib` | formats, zod partagé, stockage (MMKV > SQLite kv > mémoire), haptique, schéma du manifest |
| `@daroms/i18n` | i18next + expo-localization, `useT` typé, textes du cœur |
| `@daroms/app` | provider racine, gates ordonnées, préférences, système de modules, layouts racine et onglets, `withDaroms` (config Expo) |
| `@daroms/config` | tsconfig strict, ESLint (règles daroms), Jest, Prettier |

## Configuration pilotée par le manifest

`app.config.ts` appelle `withDaroms(ctx, { manifest, brand })` : nom, identifiants, schéma, icônes, splash, plugins des modules (`core/modules/<slug>/plugin.ts`) et manifest injecté dans `extra`. Node >= 22.18 charge ces fichiers TypeScript directement (imports relatifs avec extension `.ts`). Au runtime, `getManifest()` relit le manifest validé.

## Modules

Un module = un dossier `core/modules/<slug>` : `index.ts` (`defineModule` : config zod, Provider, gate, textes, sections de réglages, modales), `module.json` (routes, dépendances natives, migrations, fonctions, textes d'app), `plugin.ts` (config plugin Expo), `README.md`. Le registre `src/generated/modules.ts` n'importe que les modules activés. Les gates (onboarding 10, auth 20, paywall 30) décident ensemble de la redirection et gardent le splash affiché tant que leur état est inconnu.

## Générateurs déterministes

Les gabarits `generators/` (écran, table, module) sont remplis par variables, sans IA : Claude ne remplit que le spécifique. Les variantes de template (`template/variants/*/variant.json`) sont des recettes : modules, tables et écrans générés à la création.
