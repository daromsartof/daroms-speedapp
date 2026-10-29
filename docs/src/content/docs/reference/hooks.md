---
title: Hooks de la couche IA
description: Les 6 hooks Claude Code du framework - synchronisation, routeur de contexte, vérification des règles, typecheck, protection de .env, statistiques de session - avec leur événement et leur effet.
---

Les hooks vivent dans `core/_ai/hooks/` (Python 3, testés par `bun run test:hooks`) et sont déclarés dans `core/_ai/settings.json`, fusionné dans `.claude/settings.json` de l'app. Leurs messages sont courts : ils coûtent peu de tokens à l'agent.

| Hook | Événement | Effet |
|---|---|---|
| `daroms-sync.py` | SessionStart | copie `core/_ai` vers `.claude/` (fichiers `daroms-*` seulement), fusionne `settings.json`, régénère catalogue et digest ; silencieux si tout est à jour |
| `daroms-context.py build` | SessionStart | indexe les zones : features de l'app, modules actifs, zones apprises (`*-zones.json`) |
| `daroms-context.py route` | UserPromptSubmit | indique la zone probable de la demande (fichiers à lire) ; silencieux si incertain |
| `daroms-check-rules.py` | PreToolUse Edit, Write, MultiEdit | refuse une écriture qui viole une règle, avec la correction attendue |
| `daroms-typecheck.py` | PostToolUse Edit, Write, MultiEdit | `tsc` incrémental et ESLint limités au fichier touché, 20 lignes au plus |
| `daroms-deny-env.py` | PreToolUse Bash | bloque toute lecture de `.env` (en plus des permissions `deny` sur Read et Edit) |
| `daroms-session-stats.py` | Stop | tokens et durée de la session dans `.claude/stats.jsonl` |

## Ce que refuse daroms-check-rules

Sur le contenu proposé (nouveau texte uniquement) :

- couleur hex ou `rgb()`/`hsl()` : utiliser un token (`bg="card"`, `color="color-11"`, `brand-500`) ;
- `StyleSheet.create`, style inline, nombre magique de style (`p={14}`) : `p="4"`, `gap="stack"`, `rounded="card"` ;
- `any` : typer précisément (`unknown` + zod si besoin) ;
- import de Supabase, `db`, `getSupabase` ou `localTable` hors `api.ts` ;
- texte en dur dans le JSX : `t('cle')` + clés FR/EN ;
- emoji ou tiret long dans un texte ;
- librairie UI ou jeu d'icônes tiers ;
- route `app/**` qui ne se limite pas à une réexportation ;
- fichier de plus de 200 lignes.

Exemple de refus :

```text
daroms-check-rules refuse src/features/books/BooksScreen.tsx :
- couleur hex : utiliser un token (bg="card", color="color-11", brand-500)
Corriger puis réécrire (voir CATALOG.md pour les tokens).
```

Un refus se corrige, il ne se contourne pas. `daroms doctor` lance le même contrôle sur tout `src/`, `app/` et `locales/` (`--all`). Liste complète des règles : [Règles](/reference/regles/).

## Tester le routeur de contexte

```bash
python3 .claude/hooks/daroms-context.py test "écran profil"
```

`/daroms-learn` enrichit les zones en fin de tâche (`.claude/context/app-zones.json` pour l'app, `core/_ai/context/daroms-zones.json` pour le cœur).
