---
title: "Tutoriel : de l'idée à l'app publiée"
description: Le parcours complet mené par l'agent, de l'idée à l'app installée sur téléphone, soumise aux stores puis suivie, avec les skills Claude et les commandes daroms.
sidebar:
  order: 3
  label: De l'idée à l'app publiée
---

Objectif : partir d'une idée et arriver à une app publiée et suivie. L'agent fait tout le répétitif dans le cadre du framework (générateurs, règles, contrôles) ; tu valides chaque étape. Exemple suivi : Lecture, un suivi de lecture.

:::note[En une commande]
`/daroms-pilot <idée>` mène toutes les étapes ci-dessous et s'arrête après chacune : tu vérifies la liste « À vérifier par vous », puis tu tapes `/daroms-valider <réponse>` avec la réponse à la question de l'étape, une chose que tu as regardée (ou `/daroms-corriger <consigne>`). L'agent ne peut pas passer à l'étape suivante sans toi ; `bun daroms steps` montre où en est le parcours. Ce tutoriel détaille ce qu'il fait, pour pouvoir lancer une étape seule.
:::

## Prérequis (une fois)

- Node >= 22.18, Bun >= 1.3, Python 3, Git ; Android Studio (émulateur) ou Xcode (simulateur) facultatifs.
- Comptes : Expo (EAS), Supabase ; Apple Developer et Google Play pour publier.
- La CLI : rien à installer, `npx @daromsart/daroms-speed-app` la télécharge depuis npm ; ou `npm install -g @daromsart/daroms-speed-app` pour avoir `daroms` partout.

Détail : [Installation](/demarrer/installation/).

## 1. Cadrer et créer

1. **Création**, au terminal : une commande crée l'app complète.
   ```bash
   npx @daromsart/daroms-speed-app new lecture --name "Lecture" --variant tracker --primary "#0F766E" --accent "#F59E0B" --tone minimal
   ```
   Template, sous-module `core/`, `brand.ts`, `app.manifest.ts`, modules de la variante, icône de départ, dépendances, couche IA (`.claude/`), commit initial.
2. `cd lecture && cp .env.example .env` (URL et clé publique Supabase ; `--local` à la création pour s'en passer), puis `bun daroms dev` : scanner le QR avec Expo Go.
3. Ouvrir Claude Code **dans le dossier de l'app** (`claude`) : le hook de démarrage installe skills et hooks dans `.claude/`. Lancer `/daroms-pilot Une app pour suivre ses habitudes de lecture`.
4. **Cadrage** (`/daroms-idea`) : Claude écrit `app.spec.md` (cible, boucle principale, 3 à 6 écrans, tables, modules, monétisation, nom, ton). Relire, puis `/daroms-valider` (ou `/daroms-corriger <consigne>`) : c'est la source unique des étapes suivantes.

## 2. Concevoir et modéliser

5. **Inspiration** (`/daroms-inspire`) : Claude cherche des maquettes et des apps publiées sur Dribbble, Pinterest, Behance, Mobbin et Screens Design, regarde les aperçus (`bun daroms inspire <url>`), propose 2 ou 3 directions et écrit celle que tu choisis dans `app.spec.md > Inspiration`. Il s'en inspire sans rien copier.
6. **Marque** (`/daroms-brand`) : 5 valeurs dans `brand.ts`, six directions d'icône vérifiées avec `daroms logo`, la choisie installée (`daroms logo --use`). Vérifier `/_dev/kitchen-sink` en clair et en sombre. Voir [Changer la marque](/guides/changer-la-marque/).
7. **Design** (`/daroms-design`) : wireframes texte par écran dans `app.spec.md`, uniquement avec les composants du [catalogue](/reference/composants/).
8. **Données** (`/daroms-data`) : `bun daroms g table books --fields "title:text, author:text?, pages:int=0"` crée la migration avec RLS, le schéma zod, les hooks `useBooks`, `useCreateBook`... puis `bun daroms db push`. Voir [Ajouter une table](/guides/ajouter-une-table/).

## 3. Construire et vérifier

9. **Écrans** (`/daroms-screen books --tab --icon BookOpen`) : route mince, feature, 4 états, textes FR/EN, test ; Claude remplit avec `@daroms/ui` et vérifie avec `bun daroms shot /books`. Voir [Ajouter un écran](/guides/ajouter-un-ecran/).
10. **Modules** (`/daroms-module payments`) : paywall RevenueCat, statut Pro, restauration ; idem `push`, `ai-chat`, `analytics`, `camera` (photos vers Supabase Storage), `maps` (carte, position). Voir [Ajouter un module](/guides/ajouter-un-module/).
11. **Vérification** (`/daroms-check`) puis **finition** (`/daroms-polish`) : revue visuelle par l'agent `daroms-designer`. Voir [Vérifier](/guides/verifier/).

## 4. Publier et suivre

12. **Fiche store** (`/daroms-store`) : titres, mots-clés, descriptions FR/EN, captures, politique de confidentialité.
13. **Build** (`/daroms-build preview`) : installation interne par QR ; puis `production` et `/daroms-submit` (TestFlight, piste interne). Voir [Publier](/guides/publier/).
14. **Bilan** : `/daroms-learn` (zones de contexte), puis `bun daroms cost` écrit `app.cost.md` : tokens et prix de l'app par étape, par modèle et par session, au tarif de l'API Anthropic. C'est la référence à faire baisser à l'app suivante. Enfin `/daroms-commit`.

## Et ensuite

- Une correction JavaScript sans changement natif : `bun daroms update production --message "..."`.
- Une nouvelle version du cœur : [Mettre à jour le cœur](/guides/mettre-a-jour-le-coeur/).
