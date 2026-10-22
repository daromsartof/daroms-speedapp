---
name: daroms-release-core
description: Publie une version du cœur daroms-speed-app - vérifications, version, changelog, tag - et donne la consigne de mise à jour des apps. À lancer dans le dépôt cœur.
argument-hint: "<patch|minor|major>"
disable-model-invocation: true
---

# /daroms-release-core : version du cœur

Niveau : $ARGUMENTS (défaut patch ; minor si nouveauté, major si rupture)

1. Être dans le dépôt cœur (pas dans `core/` d'une app). `git status` propre.
2. `bun run check` (tsc, eslint, jest, tests CLI, tests hooks) : tout vert.
3. `bun daroms catalog` (catalogue et digest à jour) ; committer si changement.
4. Aperçu : `bun cli/daroms.ts release-core <niveau> --dry` ; vérifier le changelog proposé.
5. `bun cli/daroms.ts release-core <niveau>` (VERSION, package.json, CHANGELOG.md, commit, tag local).
6. **Stop** : afficher la consigne de mise à jour des apps imprimée par la commande ; ne pas pousser sans accord.
