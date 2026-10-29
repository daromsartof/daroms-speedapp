# Développer le cœur

- Vérifier tout : `bun run check` (tsc, eslint, jest, tests CLI, tests Python des hooks).
- Essayer dans une vraie app : `bun cli/daroms.ts new essai --dir /tmp --copy` (instantané) ou `--link` (cœur lié, modifications visibles immédiatement ; workspaces écrits en chemins explicites car Bun ne suit pas un lien dans `core/packages/*`). Avec `--link`, `tsc` dans l'app peut signaler des types en double si une dépendance n'a pas la même version dans `node_modules` du cœur et de l'app (Metro n'est pas concerné).
- Nouveau composant UI : fichier dans `packages/ui/src/components/` avec un bloc JSDoc `@catalog / @props / @example`, export dans `index.ts`, puis `bun daroms catalog`.
- Nouvelle icône du jeu de base : `bunx tamagui icons add Nom --out packages/ui/src/icons/lucide`.
- Nouveau module : `bun daroms g module <slug>` puis compléter `module.json` (routes, dépendances natives, migrations, fonctions, textes d'app) et `index.ts` (`defineModule`).
- Règle ou skill du cœur : `_ai/rules/daroms-*.md` (frontmatter `paths:`, ligne `> résumé`), `_ai/skills/daroms-*/SKILL.md`.
- Publier : `bun daroms release-core minor`.
