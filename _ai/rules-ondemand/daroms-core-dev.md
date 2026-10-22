# Développement du cœur

> Travailler dans le dépôt daroms-speed-app (et non dans core/ d'une app), tester, publier une version.

- Dépôt : `packages/*` (theme, ui, data, lib, i18n, app, config), `modules/*`, `template/`, `generators/`, `cli/`, `_ai/`.
- Vérifier : `bun run check` (tsc, eslint, jest, tests CLI, tests hooks Python).
- Tester sur une vraie app : `bun cli/daroms.ts new essai --link --dir ../` (cœur lié) puis `bun daroms dev`.
- Composant UI : bloc `@catalog` en JSDoc, puis `bun daroms catalog` ; icône : `bunx tamagui icons add Nom --out packages/ui/src/icons/lucide`.
- Module : `bun daroms g module <slug>` ; `module.json` décrit routes, dépendances natives, migrations, fonctions, textes d'app.
- Règle ou skill du cœur : fichier `daroms-*` dans `_ai/` ; digest régénéré par `bun daroms catalog`.
- Publier : `bun daroms release-core patch|minor|major` (version, changelog, tag), puis mettre à jour les apps.
