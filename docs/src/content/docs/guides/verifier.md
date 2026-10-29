---
title: Vérifier
description: Contrôler une app daroms avant de rendre - doctor, contrôle visuel daroms shot, tests jest-expo, flows Maestro, et le skill /daroms-check.
---

## Diagnostic

```bash
bun daroms doctor           # Node, .env, manifest, i18n, règles, TypeScript, ESLint, expo-doctor
bun daroms doctor --quick   # sans les étapes lentes, avant chaque rendu
```

`doctor` régénère aussi les types de routes s'ils sont périmés.

## Contrôle visuel : `daroms shot`

`shot` lance (ou réutilise) le serveur web d'Expo, ouvre la route dans Chromium et rend d'abord **un rapport texte** : erreurs de console, exceptions, débordements horizontaux. La capture n'est faite que si elle est utile ou demandée.

```bash
bun daroms shot /books                    # rapport, capture si un problème est vu
bun daroms shot /books --capture          # capture toujours
bun daroms shot /books --dark             # mode sombre
bun daroms shot /books --locale en        # autre langue
bun daroms shot /books --width 430        # largeur (défaut 390)
bun daroms shot /books --storage cle=valeur      # valeurs de stockage injectées avant le rendu
bun daroms shot /books --storage-file e2e/state.json
bun daroms shot /books --android          # capture sur l'émulateur Android
bun daroms shot --stop                    # arrête le serveur web
```

Le rapport texte coûte quelques lignes ; une capture coûte beaucoup plus de tokens à un agent. D'où l'ordre : texte d'abord.

## Tests unitaires

```bash
bun daroms test            # jest-expo + Testing Library
bun daroms test books      # motif
```

Les tests vivent à côté du code (`src/features/<x>/__tests__/`), sans réseau. `@daroms/app/testing` fournit le rendu avec providers.

## Tests de bout en bout (Maestro)

```bash
bun daroms e2e                 # flows e2e/*.yaml sur le build installé
bun daroms e2e --go            # app chargée dans Expo Go
bun daroms e2e main --go --driver   # pré-lance le pilote Android (API récentes)
```

Le flow du template est paramétré par `APP_ID` et `APP_URL`. Les champs de formulaire portent `testID="field-<name>"`.

## Tout d'un coup

`/daroms-check` enchaîne typecheck, lint, tests, règles, `shot` clair et sombre sur les écrans touchés et le flow Maestro principal, puis rend un rapport court. `/daroms-polish` fait ensuite relire l'UX par l'agent `daroms-designer`.

Dans le dépôt du cœur : `bun run check` (tsc, eslint, jest, tests CLI, tests Python des hooks).
