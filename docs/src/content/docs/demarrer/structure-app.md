---
title: Structure d'une app
description: Arborescence d'une app créée par daroms new, rôle de chaque fichier et ce qui est généré ou écrit à la main.
sidebar:
  order: 4
---

Une app daroms ne contient que son spécifique ; le reste vient de `core/`.

```text
mon-app/
  core/                    sous-module daroms-speed-app (ne jamais modifier depuis l'app)
  app/                     Expo Router : routes minces uniquement
    _layout.tsx  (tabs)/  (auth)/  +not-found.tsx  _dev/kitchen-sink.tsx
  src/
    features/<x>/          XScreen.tsx, hooks.ts, api.ts, schema.ts, components/, __tests__/
    lib/                   fonctions pures de l'app, testées
    types/db.ts            types Supabase générés (bun daroms db types)
    generated/             registre des modules, généré (ne pas éditer)
  brand.ts                 5 valeurs de marque
  app.manifest.ts          nom, identifiants, modules, onglets, écrans, monétisation
  app.config.ts            configuration Expo dérivée du manifest (withDaroms)
  app.spec.md              cahier de l'app (écrit par /daroms-idea) : source unique pour Claude
  locales/fr.json en.json  textes de l'app, mêmes clés partout
  supabase/migrations/     structure de la base, RLS
  assets/source/icon.svg   source de l'icône, du splash et du favicon
  e2e/*.yaml               flows Maestro
  CLAUDE.md                @core/_ai/CLAUDE.core.md + spécificités de l'app
  .claude/                 règles, skills, hooks synchronisés (daroms-*) + fichiers app-*
  eas.json  .env.example
```

## Une feature

Chaque écran a une route d'une ligne et un dossier de feature :

```tsx
// app/(tabs)/books.tsx
export { default } from '@/features/books/BooksScreen'
```

| Fichier | Contient | Règle |
|---|---|---|
| `BooksScreen.tsx` | l'UI, uniquement `@daroms/ui` et tokens | 4 états, <= 200 lignes |
| `hooks.ts` | la logique de l'écran (requêtes, état local) | pas de JSX |
| `api.ts` | hooks TanStack Query, seul endroit où l'on parle à Supabase | sorties validées zod |
| `schema.ts` | schémas zod (ligne, saisie) et types | - |
| `components/` | composants propres à la feature | tokens seulement |

## Généré, synchronisé, écrit à la main

| Généré par la CLI | Synchronisé depuis le cœur | Écrit à la main |
|---|---|---|
| `src/generated/`, `src/types/db.ts`, `assets/*.png` | `.claude/rules/daroms-*`, `.claude/skills/daroms-*`, hooks | `src/features/`, `src/lib/` |
| squelettes `g screen`, `g table` (puis complétés) | `CATALOG.md`, `digest.md` (dans `core/`) | `locales/*.json`, `app.spec.md` |
| `app.manifest.ts` (réécrit par `g screen`, `module add`) | | `brand.ts`, migrations spécifiques |

Les fichiers `.claude/` préfixés `daroms-` sont écrasés à chaque synchronisation ; ce qui est propre à l'app porte le préfixe `app-` et n'est jamais touché.

## Imports

- `@/` pointe vers `src/` (`@/features/books/api`), `~/` vers la racine (`~/brand`).
- Paquets du cœur : `@daroms/ui`, `@daroms/ui/icons`, `@daroms/data`, `@daroms/lib`, `@daroms/i18n`, `@daroms/app`, et `@daroms/module-<slug>` pour un module actif. Détail : [Paquets](/reference/paquets/).
