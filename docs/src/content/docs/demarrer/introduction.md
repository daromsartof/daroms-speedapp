---
title: Introduction
description: Ce qu'est Daroms Speed App, à qui il s'adresse, ses principes et ce qu'il fournit, en une page.
sidebar:
  order: 1
---

Daroms Speed App est un framework mobile **Expo SDK 58 + Tamagui v3 + Supabase** conçu pour être piloté par Claude Code. Son objectif : partir d'une idée le matin et installer l'app sur un téléphone le soir, avec un code propre et vérifié.

## Le principe : un cœur, des apps

Le dépôt `daroms-speed-app` est un **cœur versionné**. Chaque app l'embarque en sous-module git dans `core/` et n'écrit que son spécifique :

| Fourni par le cœur (`core/`) | Écrit dans l'app |
|---|---|
| Thème, 32 composants, icônes (`@daroms/ui`, `@daroms/theme`) | `brand.ts` : 5 valeurs de marque |
| Client Supabase, erreurs, requêtes (`@daroms/data`) | `src/features/<x>/` : écrans, hooks, `api.ts` |
| Modules : auth, paiements, push, chat IA, cartes... | `app.manifest.ts` : modules activés, onglets |
| Générateurs, CLI `daroms`, couche IA (`_ai/`) | `locales/*.json`, `supabase/migrations/` |

Mettre à jour le cœur dans une app = changer de version du sous-module. Voir [l'architecture](/explications/architecture/).

## Les cinq idées du framework

1. **Générer avant d'écrire.** Écran, table, module : `bun daroms g ...` produit le répétitif à partir de gabarits, sans IA. Claude remplit le reste.
2. **Des règles vérifiées, pas des conseils.** Couleurs en dur, Supabase dans un composant, texte hors i18n : un hook refuse l'écriture et explique quoi faire. Voir [les règles](/reference/regles/).
3. **Une marque, un thème.** `brand.ts` (couleur principale, accent, police, rayon, ton) génère palettes, thèmes clair et sombre et sous-thèmes. Voir [la marque](/reference/marque/).
4. **Une fonctionnalité optionnelle est un module.** `bun daroms module add payments` ajoute dépendances, routes, migrations et configuration. Voir [les modules](/reference/modules/auth/).
5. **Peu de tokens.** Un noyau court toujours chargé, des règles chargées selon les fichiers touchés, un catalogue de composants à la place des sources. Voir [la couche IA](/explications/couche-ia/).

## Pour qui

- Un développeur ou une petite équipe qui sort beaucoup d'apps mobiles et veut le même socle partout.
- Un agent (Claude Code) qui travaille dans une app daroms : cette documentation existe aussi en Markdown, voir [Utiliser avec un agent](/agents/utiliser-avec-un-agent/).

## Choix figés

- **Expo** (Expo Router, New Architecture, React Native 0.88), **EAS** pour build, soumission et mises à jour OTA.
- **Tamagui v3** pour le thème et l'UI : aucune autre librairie UI, un seul jeu d'icônes (Lucide).
- **Supabase** : authentification, Postgres avec RLS, Storage, edge functions.
- **Bun** pour les workspaces, la CLI et les scripts ; TypeScript strict.

## Par où commencer

- Installer le cœur et créer une première app : [Installation](/demarrer/installation/).
- Faire une app complète, étape par étape : [Tutoriel : ton app en un jour](/demarrer/tutoriel/).
- Comprendre ce que contient une app : [Structure d'une app](/demarrer/structure-app/).
