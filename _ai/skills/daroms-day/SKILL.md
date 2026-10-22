---
name: daroms-day
description: Orchestrateur de la journée daroms - de l'idée à l'app publiée en une journée, étape par étape avec validation entre chaque étape.
argument-hint: "<idée de l'app>"
disable-model-invocation: true
---

# /daroms-day : une app en un jour

Idée : $ARGUMENTS

Enchaîner les étapes ci-dessous. Après chacune : résumé de 3 lignes maximum, puis **demander la validation** (AskUserQuestion : Continuer / Ajuster / Arrêter). Ne jamais sauter une validation.

| # | Étape | Skill | Livrable |
|---|---|---|---|
| 1 | Cadrage | `/daroms-idea` | `app.spec.md` validé |
| 2 | Création | `/daroms-new` | app qui démarre, QR affiché |
| 3 | Marque | `/daroms-brand` | `brand.ts`, icône, splash |
| 4 | Design | `/daroms-design` | wireframes texte dans `app.spec.md` |
| 5 | Données | `/daroms-data` | tables RLS, `api.ts` générés |
| 6 | Écrans | `/daroms-screen <nom>` pour chaque écran du cahier | écrans 4 états |
| 7 | Modules | `/daroms-module <slug>` si le cahier en liste | modules configurés |
| 8 | Vérification | `/daroms-check` | tout vert |
| 9 | Finition | `/daroms-polish` | revue UX appliquée |
| 10 | Store | `/daroms-store` | fiche FR/EN, captures |
| 11 | Build | `/daroms-build` | build preview installable |
| 12 | Soumission | `/daroms-submit` (si comptes prêts) | TestFlight / piste interne |

Règles de la journée :
- Une étape = un objectif ; `/clear` conseillé entre deux étapes longues (le cahier et le code portent l'état).
- Ordre des écrans : boucle principale d'abord, réglages et secondaires ensuite.
- Commits par étape avec `/daroms-commit`.
- Fin : `/daroms-learn`, puis noter dans `app.spec.md` > Journal ce qui a ralenti (référence tokens : `.claude/stats.jsonl`).
