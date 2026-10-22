---
name: daroms-check
description: Vérification complète avant de rendre - typecheck, lint, tests, règles, contrôle visuel des écrans touchés (clair et sombre) et flow Maestro principal.
---

# /daroms-check : tout vérifier

1. `bun daroms doctor` (environnement, manifest, i18n, règles, TypeScript, ESLint, expo-doctor).
2. `bun daroms test`.
3. Écrans touchés (`git diff --name-only` -> routes) : `bun daroms shot /<route>` puis `--dark`. Écrans derrière une gate : `--storage onboarding.done.v1=true`.
4. Appareil ou simulateur disponible : `bun daroms e2e` (flow `e2e/main.yaml`).
5. En cas d'échec : `/daroms-fix`.
6. **Stop** : tableau court `Vérification | Résultat`.
