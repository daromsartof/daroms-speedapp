---
title: Hooks de la couche IA
description: Les 7 hooks Claude Code du framework - synchronisation, routeur de contexte, vérification des règles, typecheck, protection de .env, validation manuelle des étapes, statistiques de session - avec leur événement et leur effet.
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
| `daroms-steps.py prompt` | UserPromptSubmit | parcours `/daroms-pilot` : enregistre `/daroms-valider` et `/daroms-corriger` tapés par l'utilisateur dans `app.steps.json` ; seul un message humain passe par ce hook |
| `daroms-steps.py gate` | PreToolUse Skill, Edit, Write, MultiEdit, Bash | refuse à l'agent les skills d'une étape tant que les précédentes ne sont pas validées, et toute écriture de `app.steps.json` ; sans parcours en cours, ne fait rien |
| `daroms-session-stats.py` | Stop | tokens et durée de la session dans `.claude/stats.jsonl` ; alerte affichée à l'utilisateur (hors contexte de Claude) quand le contexte relu à chaque réponse dépasse 150 k tokens, puis tous les 60 k ; seuil `DAROMS_CONTEXT_WARN` en milliers, `0` coupe |

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

## Parcours avec validation manuelle

`/daroms-pilot` suit les 9 étapes du cycle réel d'une app (cadrage, conception, données, développement, qualité, conformité, publication, lancement, suivi), définies dans `core/_ai/context/daroms-steps.json`. À la fin de chaque étape, l'agent lance `bun daroms steps ready <n> "<résumé>"`, montre les livrables et la liste « À vérifier par vous », puis s'arrête.

| Vous tapez | Effet (écrit par le hook, pas par l'agent) |
|---|---|
| `/daroms-valider [note]` | étape validée, l'agent passe à la suivante |
| `/daroms-corriger <consigne>` | étape à corriger, l'agent applique la consigne puis représente la fin d'étape |
| `/daroms-valider passer : <raison>` | étape sautée, raison notée |

Ce que l'agent ne peut pas faire : lancer un skill d'une étape suivante (refus du hook), écrire `app.steps.json` (refus du hook), lancer `/daroms-valider` ou `/daroms-corriger` (réservés à l'utilisateur par `disable-model-invocation`), valider avec `bun daroms steps validate` (terminal interactif requis). Vous gardez la main : un skill tapé par vous n'est jamais bloqué. `app.steps.json` est versionné, avec l'historique des validations (date, auteur, note).

C'est un garde-fou de méthode, pas une barrière de sécurité : un agent qui contournerait délibérément les outils (script qui réécrit le fichier sans le nommer) ne serait pas arrêté.

## Tester le routeur de contexte

```bash
python3 .claude/hooks/daroms-context.py test "écran profil"
```

`/daroms-learn` enrichit les zones en fin de tâche (`.claude/context/app-zones.json` pour l'app, `core/_ai/context/daroms-zones.json` pour le cœur).
