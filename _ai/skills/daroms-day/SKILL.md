---
name: daroms-day
description: Parcours guidé de l'idée à l'app publiée et suivie - les 9 étapes du cycle réel (cadrage, conception, données, développement, qualité, conformité, publication, lancement, suivi), chacune validée à la main par l'utilisateur avant la suivante.
argument-hint: "<idée de l'app>"
disable-model-invocation: true
---

# /daroms-day : parcours guidé, une validation manuelle par étape

Idée : $ARGUMENTS

1. `bun daroms steps start` puis `bun daroms steps` : le parcours est enregistré dans `app.steps.json` et reprend à l'étape en cours, d'une session à l'autre.
2. Étape en cours : `bun daroms steps show` (objectif, skills, livrables, points à vérifier), puis faire le travail avec ses skills.
3. Fin d'étape : `bun daroms steps ready <n> "<résumé en une ligne>"` affiche livrables, « À vérifier par vous » et les commandes. Montrer à l'utilisateur ce bloc, un résumé de 3 lignes et les chemins des livrables, **puis s'arrêter** : rien d'autre, aucune validation à sa place. Un hook refuse les skills des étapes suivantes tant qu'il n'a pas validé, et toute écriture de `app.steps.json`.
4. Réponse de l'utilisateur, enregistrée par le hook :
   - `/daroms-valider` : passer à l'étape suivante (point 2) ;
   - `/daroms-corriger <consigne>` : appliquer la consigne (relancer le skill concerné avec la consigne en argument), puis revenir au point 3 ;
   - `/daroms-valider passer : <raison>` : étape sautée, raison notée.

| # | Étape | Skills | Travail sans skill dédié |
|---|---|---|---|
| 1 | Cadrage et validation | `/daroms-idea`, `/daroms-new` | demander combien de personnes de la cible ont confirmé le besoin ; le noter dans `app.spec.md` |
| 2 | Conception UX/UI | `/daroms-inspire`, `/daroms-brand`, `/daroms-design` | |
| 3 | Architecture et données | `/daroms-data`, `/daroms-module` (si le cahier en liste ; proposer `crash`) | lister les comptes externes à créer |
| 4 | Développement | `/daroms-screen <nom>` pour chaque écran, boucle principale d'abord | `/daroms-commit` après chaque écran |
| 5 | Qualité | `/daroms-check`, `/daroms-polish` | rappeler la bêta externe (TestFlight, test fermé Google Play) |
| 6 | Juridique et conformité | | `store/privacy.md` d'après les modules, brouillon de CGU dans `store/terms.md`, liste `.claude/rules-ondemand/daroms-store-compliance.md` cochée dans `app.spec.md` > Conformité |
| 7 | Publication | `/daroms-store`, `/daroms-promo`, `/daroms-build`, `/daroms-submit` (sur demande explicite) | |
| 8 | Lancement | | `app.spec.md` > Lancement : canaux de la cible, calendrier, message en une phrase, page web |
| 9 | Suivi après lancement | `/daroms-update`, `/daroms-learn` | vérifier le module `crash` et l'analytique ; `bun daroms cost` ; prochaine version dans `app.spec.md` |

Règles :
- Une étape à la fois ; jamais deux étapes dans un même tour. L'utilisateur peut lancer lui-même n'importe quel skill : le hook ne bloque que l'agent.
- Les skills en sous-agent (données, écrans, modules, vérification, finition, store) lisent `app.spec.md` et le code, pas cette conversation : leur passer en argument ce qui n'est écrit nulle part (nom d'écran, slug, consigne de correction).
- Commits par étape avec `/daroms-commit` ; `app.steps.json` est versionné (historique des validations).
- Fin du parcours : `bun daroms cost` écrit `app.cost.md` ; afficher le total et les 3 étapes les plus chères, noter dans `app.spec.md` > Journal ce qui a ralenti, puis `/daroms-commit`.
