---
title: Utiliser avec un agent
description: Comment un agent IA consomme cette documentation (llms.txt, llms-full.txt, pages en Markdown) et comment il travaille dans une app daroms avec Claude Code.
---

Cette documentation est écrite pour être lue par des personnes et par des agents. Chaque page existe en HTML et en Markdown, avec le même contenu.

## Les fichiers pour agents

| Adresse | Contenu |
|---|---|
| [`/llms.txt`](/llms.txt) | index au format llmstxt.org : une ligne par page avec son résumé, et les points à connaître avant d'écrire du code daroms |
| [`/llms-full.txt`](/llms-full.txt) | toute la documentation en un fichier Markdown, dans l'ordre de lecture |
| `/<page>.md` | une page en Markdown, ex. [`/guides/ajouter-une-table.md`](/guides/ajouter-une-table.md) ; liens internes absolus vers d'autres `.md` |

Chaque page HTML annonce sa version Markdown par `<link rel="alternate" type="text/markdown">`. En haut de chaque page : **Copier en Markdown**, **Voir le Markdown**, **Ouvrir dans Claude**.

:::tip[Quel fichier donner à un agent]
Une tâche précise : la page `.md` du guide correspondant (quelques centaines de tokens). Une question large : `llms.txt`, l'agent choisit ensuite les pages. Tout charger d'un coup : `llms-full.txt`, seulement si le contexte le permet.
:::

## Dans une app daroms, l'agent a déjà le contexte

Dans une app, Claude Code n'a pas besoin de ce site : la couche IA du cœur lui fournit le nécessaire, au bon moment.

| Toujours chargé | À la demande |
|---|---|
| `CLAUDE.md` : noyau `core/_ai/CLAUDE.core.md` + digest des règles | règles détaillées selon les fichiers touchés (`.claude/rules/`) |
| descriptions des skills `daroms-*` | contenu d'un skill à son invocation |
| | `core/packages/ui/CATALOG.md` avant d'écrire une UI |
| | `app.spec.md`, le cahier de l'app |

Le site sert à **apprendre** le framework, à **préparer** une tâche hors de l'app, ou à donner du contexte à un agent qui n'est pas dans une app daroms.

## Règles à donner à un agent qui écrit du code daroms

1. Lire `app.spec.md` et `core/packages/ui/CATALOG.md` ; ne pas lire les sources de `core/`, ne jamais modifier `core/` depuis une app.
2. Générer avant d'écrire : `bun daroms g screen|feature|table`, `bun daroms module add`, `bun daroms icons add`.
3. UI : `@daroms/ui` et tokens Tamagui v3 sans `$` ; ni hex, ni nombre magique, ni `StyleSheet`, ni style inline.
4. Données : Supabase seulement dans `features/x/api.ts` via `db()`, résultats validés par `parseOrThrow`.
5. Textes : `t('cle')`, clé ajoutée en FR et en EN, ni emoji ni tiret long.
6. Chaque écran gère chargement, vide, erreur avec réessai, données (`QueryView` ou `List`).
7. Vérifier avec `bun daroms shot /route` (texte d'abord) puis `bun daroms doctor --quick` et `bun daroms test`.
8. Un refus de hook se corrige, il ne se contourne pas.

Détail : [Règles](/reference/regles/), [Hooks](/reference/hooks/).

## Exemples de demandes

```text
Lis https://daromsartof.github.io/daroms-speedapp/llms.txt puis ajoute un écran « Livres » en suivant le guide Ajouter un écran.
```

```text
/daroms-screen books --tab --icon BookOpen
```

```text
/daroms-module ai-chat
```

## Économiser les tokens

- Une tâche par session, `/clear` entre deux sujets.
- `daroms shot` rend un rapport texte avant toute capture.
- Le routeur de contexte (`daroms-context.py`) indique où regarder ; `/daroms-learn` l'améliore en fin de tâche.
- `.claude/stats.jsonl` mesure les tokens par session : la référence à battre à l'app suivante.
