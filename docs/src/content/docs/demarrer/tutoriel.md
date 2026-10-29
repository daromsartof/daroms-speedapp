---
title: "Tutoriel : ton app en un jour"
description: Une journée complète, de l'idée à l'app installée sur téléphone puis soumise aux stores, avec les skills Claude et les commandes daroms.
sidebar:
  order: 3
  label: Ton app en un jour
---

Objectif : partir d'une idée le matin et installer l'app sur un téléphone le soir, en laissant Claude faire le répétitif. Les durées sont celles de l'app pilote (Lecture, un suivi de lecture).

:::note[En une commande]
`/daroms-day <idée>` enchaîne toutes les étapes ci-dessous et s'arrête pour ta validation entre chacune. Ce tutoriel détaille ce qu'il fait, pour pouvoir lancer une étape seule.
:::

## Prérequis (une fois)

- Node >= 22.18, Bun >= 1.3, Python 3, Git ; Android Studio (émulateur) ou Xcode (simulateur) facultatifs.
- Comptes : Expo (EAS), Supabase ; Apple Developer et Google Play pour publier.
- Le cœur : `git clone https://github.com/daromsartof/daroms-speedapp.git daroms-speed-app && cd daroms-speed-app && bun install`.
- Commande globale facultative : `bun link` dans le cœur, puis `daroms` partout.

Détail : [Installation](/demarrer/installation/).

## Matin : cadrer et créer (1 h)

1. Ouvrir Claude Code dans le dossier des projets et lancer `/daroms-day Une app pour suivre ses habitudes de lecture`.
2. **Cadrage** (`/daroms-idea`) : Claude écrit `app.spec.md` (cible, boucle principale, 3 à 6 écrans, tables, modules, monétisation, nom, ton, variante). Relire et valider : c'est la source unique des étapes suivantes.
3. **Création** (`/daroms-new`) : une commande crée l'app complète :
   ```bash
   bun ../daroms-speed-app/cli/daroms.ts new lecture --name "Lecture" --variant tracker --primary "#0F766E" --accent "#F59E0B" --tone minimal
   ```
   Template, sous-module `core/`, `brand.ts`, `app.manifest.ts`, modules de la variante, icônes générées, dépendances, couche IA (`.claude/`), commit initial.
4. `cd lecture && cp .env.example .env` (URL et clé publique Supabase), puis `bun daroms dev` : scanner le QR avec Expo Go.

## Midi : marque, design, données (2 h)

5. **Marque** (`/daroms-brand`) : 5 valeurs dans `brand.ts`, icône SVG dans `assets/source/icon.svg`, puis `bun daroms assets`. Vérifier `/_dev/kitchen-sink` en clair et en sombre. Voir [Changer la marque](/guides/changer-la-marque/).
6. **Design** (`/daroms-design`) : wireframes texte par écran dans `app.spec.md`, uniquement avec les composants du [catalogue](/reference/composants/).
7. **Données** (`/daroms-data`) : `bun daroms g table books --fields "title:text, author:text?, pages:int=0"` crée la migration avec RLS, le schéma zod, les hooks `useBooks`, `useCreateBook`... puis `bun daroms db push`. Voir [Ajouter une table](/guides/ajouter-une-table/).

## Après-midi : écrans et modules (3 h)

8. **Écrans** (`/daroms-screen books --tab --icon BookOpen`) : route mince, feature, 4 états, textes FR/EN, test ; Claude remplit avec `@daroms/ui` et vérifie avec `bun daroms shot /books`. Voir [Ajouter un écran](/guides/ajouter-un-ecran/).
9. **Modules** (`/daroms-module payments`) : paywall RevenueCat, statut Pro, restauration ; idem `push`, `ai-chat`, `analytics`, `camera` (photos vers Supabase Storage), `maps` (carte, position). Voir [Ajouter un module](/guides/ajouter-un-module/).
10. **Vérification** (`/daroms-check`) puis **finition** (`/daroms-polish`) : revue visuelle par l'agent `daroms-designer`. Voir [Vérifier](/guides/verifier/).

## Soir : publier (1 h)

11. **Fiche store** (`/daroms-store`) : titres, mots-clés, descriptions FR/EN, captures, politique de confidentialité.
12. **Build** (`/daroms-build preview`) : installation interne par QR ; puis `production` et `/daroms-submit` (TestFlight, piste interne). Voir [Publier](/guides/publier/).
13. **Bilan** : `/daroms-learn` (zones de contexte), `/daroms-commit`, et `.claude/stats.jsonl` donne le coût en tokens de chaque étape, à faire baisser à l'app suivante.

## Et ensuite

- Une correction JavaScript sans changement natif : `bun daroms update production --message "..."`.
- Une nouvelle version du cœur : [Mettre à jour le cœur](/guides/mettre-a-jour-le-coeur/).
