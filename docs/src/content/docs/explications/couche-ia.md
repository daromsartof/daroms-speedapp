---
title: "La couche IA"
description: "Comment Claude produit du code conforme en consommant peu de tokens : ce qui est chargé et quand, les hooks, l'apprentissage d'une app à l'autre, les préfixes daroms- et app-."
---

But : que Claude produise du code conforme en consommant peu de tokens.

## Ce qui est chargé, et quand

| Élément | Chargement | Taille |
|---|---|---|
| `CLAUDE.md` de l'app -> `@core/_ai/CLAUDE.core.md` + `@core/_ai/digest.md` | toujours | < 150 lignes |
| `.claude/rules/daroms-*.md` (frontmatter `paths:`) | quand Claude lit ou écrit un fichier concerné | 10 à 20 lignes chacune |
| `.claude/rules-ondemand/` | lues à la demande (le digest les liste) | - |
| Skills `daroms-*` | description seule, contenu à l'invocation | - |
| Skills tiers (vendor) | nom seul (`skillOverrides: name-only`) | - |
| `CATALOG.md` | lu avant d'écrire une UI, à la place des sources | ~60 lignes |

## Hooks (garde-fous et contexte)

| Hook | Événement | Effet |
|---|---|---|
| `daroms-sync.py` | SessionStart | copie `core/_ai` vers `.claude/` (daroms-* seulement), fusionne `settings.json`, régénère catalogue et digest ; silencieux si à jour |
| `daroms-context.py build/route` | SessionStart / UserPromptSubmit | indexe les zones (features, modules actifs, zones apprises) puis indique la zone probable de la demande ; silencieux si incertain |
| `daroms-check-rules.py` | PreToolUse Edit/Write | refuse l'écriture qui viole une règle, avec un message court |
| `daroms-typecheck.py` | PostToolUse Edit/Write | tsc incrémental + eslint limités au fichier touché (20 lignes max) |
| `daroms-deny-env.py` | PreToolUse Bash | aucune lecture de `.env` (et permissions deny sur Read/Edit) |
| `daroms-session-stats.py` | Stop | tokens et durée par session dans `.claude/stats.jsonl` |

## Apprendre d'une app à l'autre

`/daroms-learn` ajoute des zones dans `.claude/context/app-zones.json` (propres à l'app) ou propose des zones génériques pour `core/_ai/context/daroms-zones.json`. `stats.jsonl` donne la référence de tokens par étape de `/daroms-day`, à faire baisser à l'app suivante.

## Préfixes

`daroms-` : vient du cœur, écrasé à chaque synchronisation. `app-` : propre à l'app, jamais touché.
