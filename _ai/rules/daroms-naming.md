---
paths:
  - "src/**"
  - "app/**"
---
# Nommage et organisation

> PascalCase composants, useX hooks, kebab-case routes et dossiers, fichiers ≤ 200 lignes, imports absolus @/ et ~/.

- Feature : `src/features/<kebab>/` avec `<Pascal>Screen.tsx`, `hooks.ts`, `api.ts`, `schema.ts`, `components/`.
- Hooks : `use<Nom>` ; composants : `<Nom>.tsx` exportant `<Nom>` ; tests à côté : `<Nom>.test.tsx`.
- Imports : `@/` pour `src/`, `~/` pour la racine (`~/brand`, `~/locales/fr.json`) ; jamais `../`.
- Fonctionnalité optionnelle réutilisable : module du cœur (`/daroms-module`), pas dans l'app.
