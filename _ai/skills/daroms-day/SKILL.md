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
| 3 | Inspiration | `/daroms-inspire` | références web et direction dans `app.spec.md` |
| 4 | Marque | `/daroms-brand` | `brand.ts`, icône, splash |
| 5 | Design | `/daroms-design` | wireframes texte dans `app.spec.md` |
| 6 | Données | `/daroms-data` | tables RLS, `api.ts` générés |
| 7 | Écrans | `/daroms-screen <nom>` pour chaque écran du cahier | écrans 4 états |
| 8 | Modules | `/daroms-module <slug>` si le cahier en liste | modules configurés |
| 9 | Vérification | `/daroms-check` | tout vert |
| 10 | Finition | `/daroms-polish` | revue UX appliquée |
| 11 | Store | `/daroms-store` | fiche FR/EN, captures |
| 12 | Build | `/daroms-build` | build preview installable |
| 13 | Soumission | `/daroms-submit` (si comptes prêts) | TestFlight / piste interne |
| 14 | Bilan | `/daroms-learn`, puis `bun daroms cost` | `app.cost.md` : tokens et prix par étape, modèle, session |

Règles de la journée :
- Une étape = un objectif ; `/clear` conseillé entre deux étapes longues (le cahier et le code portent l'état).
- Ordre des écrans : boucle principale d'abord, réglages et secondaires ensuite.
- Commits par étape avec `/daroms-commit`.
- Fin : `bun daroms cost` écrit `app.cost.md` ; afficher le total et les 3 étapes les plus chères, noter dans `app.spec.md` > Journal ce qui a ralenti, puis `/daroms-commit` (le rapport est versionné).
