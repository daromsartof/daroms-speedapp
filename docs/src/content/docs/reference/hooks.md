---
title: Hooks de la couche IA
description: Les 10 hooks Claude Code du framework - synchronisation, routeur de contexte, vérification des règles, typecheck, protection de .env, paquets npm vérifiés, cœur en lecture seule, push sur main refusé, validation manuelle des étapes, statistiques de session - avec leur événement et leur effet.
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
| `daroms-core-lock.py` | PreToolUse Edit, Write, MultiEdit, NotebookEdit, Bash | `core/` en lecture seule dans une app : refuse toute écriture sous `core/` (outils d'écriture, redirection, `sed -i`, `cp`/`mv`/`rm`, git qui commite ou fusionne dans `core/`, écriture après `cd core`) ; lire et passer à une version publiée restent permis ([détail](#cœur-en-lecture-seule)) |
| `daroms-push-guard.py` | PreToolUse Bash | refuse `git push` vers `main` ou `master` (explicite, ou implicite depuis la branche courante), `--all` et `--mirror` ; une branche de travail et des tags passent ([détail](#push-sur-main)) |
| `daroms-deps.py` | PreToolUse Bash | `bun add`, `npm i`, `expo install`... : refuse un paquet absent de npm (nom inventé par le modèle), demande confirmation sous 500 téléchargements par semaine ; paquets déjà dans `package.json` non vérifiés, registre injoignable : laisse passer avec un avertissement |
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
- zone pressable maison (`Pressable`, `YStack onPress`...) sans `aria-label` : les lecteurs d'écran n'annoncent rien (Button, IconButton et ListItem sont déjà nommés) ;
- route `app/**` qui ne se limite pas à une réexportation ;
- fichier de plus de 200 lignes.

Exemple de refus :

```text
daroms-check-rules refuse src/features/books/BooksScreen.tsx :
- couleur hex : utiliser un token (bg="card", color="color-11", brand-500)
Corriger puis réécrire (voir CATALOG.md pour les tokens).
```

Un refus se corrige, il ne se contourne pas. `daroms doctor` lance le même contrôle sur tout `src/`, `app/` et `locales/` (`--all`). Liste complète des règles : [Règles](/reference/regles/).

## Cœur en lecture seule

Dans une app, `core/` est le sous-module du framework, versionné dans son propre dépôt. Un fichier modifié là crée une divergence locale non versionnée : perdue ou en conflit à la prochaine mise à jour, invisible pour les autres apps. Les permissions `deny` de `settings.json` couvrent Edit et Write ; `daroms-core-lock` couvre aussi le shell.

| Refusé | Permis |
|---|---|
| Edit, Write, MultiEdit, NotebookEdit sous `core/` (aussi par le lien de `--link`) | lire : `cat`, `grep`, `Read` sur `core/` |
| `echo ... > core/...`, `tee`, `sed -i`, `perl -i` | copier depuis le cœur vers l'app : `cp core/template/x src/x` |
| `cp`/`rsync` vers `core/`, `mv`, `rm`, `touch`, `mkdir` dans `core/` | passer à une version publiée : `git -C core fetch --tags && git -C core checkout v0.10.0`, `git submodule update` |
| `git -C core commit`, `add`, `reset`, `stash`, `merge`, `pull`, `push`, `tag`... | `git -C core status`, `log`, `diff` |
| toute écriture après `cd core` ; `python -c` ou `node -e` qui écrit dans `core/` | |

Le changement voulu se fait dans l'app (`src/`, fichiers `app-*` de `.claude/`), ou dans le dépôt du cœur, dans une session dédiée, puis par une nouvelle version. Dans le dépôt du cœur lui-même, le hook ne fait rien. Maintenance du cœur depuis une app (mode `--link`) : lancer Claude Code avec `DAROMS_CORE_UNLOCK=1 claude` ; la variable doit être celle de la session, celle d'une commande ne lève rien.

## Push sur main

Le code arrive sur `main` par une PR relue par un humain. `daroms-push-guard` refuse :

- `git push origin main`, `HEAD:main`, `+main`, `refs/heads/main`, `:main` (et `master`) ;
- `git push`, `git push origin`, `git push -u origin HEAD` ou `--follow-tags` quand la branche courante est `main` ou `master` (aussi avant le premier commit) ;
- `git push --all`, `--mirror`.

Passent : une branche de travail (`git push -u origin claude/ma-branche`), des tags seuls (`git push origin v1.2.0`, `--tags`). Le dépôt visé suit `git -C <dossier>` et `cd <dossier>`. Session de maintenance : `DAROMS_ALLOW_MAIN_PUSH=1 claude`. Côté serveur, la vraie barrière reste une règle de protection de branche sur GitHub (Settings, Branches) : le hook arrête l'agent, la règle arrête tout le monde.

## Parcours avec validation manuelle

`/daroms-pilot` suit les 9 étapes du cycle réel d'une app (cadrage, conception, données, développement, qualité, conformité, publication, lancement, suivi), définies dans `core/_ai/context/daroms-steps.json`. À la fin de chaque étape, l'agent lance `bun daroms steps ready <n> "<résumé>"`, montre les livrables et la liste « À vérifier par vous », puis s'arrête.

Chaque étape pose aussi une question d'observation (« Quel texte affiche l'état vide de l'écran principal sur votre téléphone ? ») : la validation demande cette réponse, pas un simple oui. Le biais d'automatisation résiste à la formation et aux consignes ([Parasuraman et Manzey, 2010](https://journals.sagepub.com/doi/10.1177/0018720810376055)) ; une question concrète oblige à regarder.

| Vous tapez | Effet (écrit par le hook, pas par l'agent) |
|---|---|
| `/daroms-valider <réponse>` | étape validée avec la réponse à sa question d'observation (sans réponse : rien n'est enregistré), l'agent passe à la suivante |
| `/daroms-corriger <consigne>` | étape à corriger, l'agent applique la consigne puis représente la fin d'étape |
| `/daroms-valider passer : <raison>` | étape sautée, raison notée |

Ce que l'agent ne peut pas faire : lancer un skill d'une étape suivante (refus du hook), écrire `app.steps.json` (refus du hook), lancer `/daroms-valider` ou `/daroms-corriger` (réservés à l'utilisateur par `disable-model-invocation`), valider avec `bun daroms steps validate` (terminal interactif requis). Vous gardez la main : un skill tapé par vous n'est jamais bloqué. `app.steps.json` est versionné, avec l'historique des validations (date, auteur, note).

C'est un garde-fou de méthode, pas une barrière de sécurité : un agent qui contournerait délibérément les outils (script qui réécrit le fichier sans le nommer) ne serait pas arrêté.

## Tester le routeur de contexte

```bash
python3 .claude/hooks/daroms-context.py test "écran profil"
```

`/daroms-learn` enrichit les zones en fin de tâche (`.claude/context/app-zones.json` pour l'app, `core/_ai/context/daroms-zones.json` pour le cœur).
