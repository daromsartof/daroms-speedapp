---
title: Développer le cœur
description: Travailler dans le dépôt daroms-speed-app - vérifications, essai dans une vraie app, nouveau composant, icône, module, règle ou skill, publication d'une version.
---

On développe le cœur dans son propre dépôt, jamais dans le `core/` d'une app.

## Vérifier

```bash
bun run check   # tsc, eslint, jest, tests CLI (bun test ./cli), tests Python des hooks
```

## Essayer dans une vraie app

```bash
bun cli/daroms.ts new essai --dir /tmp --copy   # instantané du cœur, fiable
bun cli/daroms.ts new essai --dir /tmp --link   # cœur lié, modifications visibles immédiatement
```

Avec `--link`, les workspaces sont écrits en chemins explicites (Bun ne suit pas un lien dans `core/packages/*`) et `tsc` dans l'app peut signaler des types en double si une dépendance n'a pas la même version dans `node_modules` du cœur et de l'app (Metro n'est pas concerné).

## Ajouter

| Quoi | Comment |
|---|---|
| Composant UI | fichier dans `packages/ui/src/components/` avec un bloc JSDoc `@catalog / @props / @example`, export dans `index.ts`, puis `bun daroms catalog` (régénère `CATALOG.md`, donc la [page Composants](/reference/composants/)) |
| Icône du jeu de base | `bunx tamagui icons add Nom --out packages/ui/src/icons/lucide` |
| Module | `bun daroms g module <slug> --description "..."` puis compléter `module.json` (routes, dépendances natives, migrations, fonctions, textes d'app) et `index.ts` (`defineModule`). Sa page de référence est générée depuis `README.md`, `module.json` et `config.ts`. |
| Règle | `_ai/rules/daroms-<nom>.md` avec frontmatter `paths:` et une ligne `> résumé` ; `bun daroms catalog` régénère le digest |
| Skill | `_ai/skills/daroms-<nom>/SKILL.md` (ou `/daroms-skill-new`) |

## Documentation

Le site vit dans `docs/` (Astro + Starlight) :

```bash
cd docs && bun install
bun run dev     # génère les pages de référence puis lance le site
bun run check   # build complet + vérification des fichiers pour agents et des liens
```

Les pages Composants, Modules, Règles et Skills sont générées depuis les sources par `docs/scripts/sync-content.ts` : modifier la source, pas la page.

## Publier une version

```bash
bun daroms release-core minor --dry   # aperçu : version et section de changelog
bun daroms release-core minor         # version, CHANGELOG.md, commit et tag
```

L'arbre git doit être propre. Ensuite, chaque app suit [Mettre à jour le cœur](/guides/mettre-a-jour-le-coeur/).
