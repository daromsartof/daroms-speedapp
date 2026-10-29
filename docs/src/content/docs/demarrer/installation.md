---
title: Installation
description: Prérequis, installation du cœur, commande daroms globale et création d'une première app lancée sur téléphone.
sidebar:
  order: 2
---

## Prérequis

| Outil | Version | Pourquoi |
|---|---|---|
| Node | >= 22.18 | `app.config.ts` charge le manifest TypeScript directement |
| Bun | >= 1.3 | workspaces, CLI `daroms`, tests de la CLI |
| Python 3 | - | hooks de la couche IA (`_ai/hooks/*.py`) |
| Git | - | le cœur est un sous-module de chaque app |
| Expo Go (téléphone) | SDK 58 | aperçu immédiat par QR |
| Android Studio ou Xcode | facultatif | émulateur, simulateur, builds locaux |

Comptes : Expo (EAS) et Supabase pour développer ; Apple Developer et Google Play pour publier.

## Créer une première app

Le framework est publié sur npm (`@daromsart/daroms-speed-app`, organisation `daromsart`). Depuis le dossier qui contiendra tes projets :

```bash
bunx @daromsart/daroms-speed-app new mon-app --name "Mon app" --variant list-detail
cd mon-app
cp .env.example .env    # URL et clé publique Supabase
bun daroms dev          # scanner le QR avec Expo Go
```

Commande globale facultative : `bun add -g @daromsart/daroms-speed-app`, puis `daroms new mon-app` partout. La CLI s'exécute avec Bun : `npx` sans Bun installé ne fonctionne pas.

`daroms new` copie le template, ajoute le cœur en sous-module `core/`, écrit `brand.ts` et `app.manifest.ts`, active les modules de la variante, génère tables et écrans, les icônes, installe les dépendances, synchronise la couche IA dans `.claude/` et fait le commit initial. Toutes les options : [CLI, `new`](/reference/cli/#new).

D'où vient `core/` :

| Cas | Résultat |
|---|---|
| CLI installée depuis npm, dépôt du cœur accessible | sous-module git fixé sur le tag de la version installée (`v0.2.0`...) |
| CLI installée depuis npm, dépôt inaccessible | copie du cœur contenu dans le paquet (sans sous-module) |
| CLI lancée depuis un clone du cœur | sous-module du remote du clone, branche par défaut |
| `--copy`, `--link`, `--core <url>` | copie, lien symbolique, sous-module de l'URL donnée |

## Travailler sur le cœur lui-même

Pour modifier le framework (pas pour créer une app) :

```bash
git clone https://github.com/daromsartof/daroms-speedapp.git daroms-speed-app
cd daroms-speed-app
bun install
bun run check   # tsc, eslint, jest, tests CLI, tests des hooks
```

`bun link` dans le clone rend la commande `daroms` globale et pointée sur tes sources. Voir [Développer le cœur](/guides/developper-le-coeur/).

:::tip[Sans Supabase pour commencer]
`--local` garde les tables de la variante sur l'appareil (mêmes hooks). Sans `.env`, l'app démarre et Supabase reste désactivé.
:::

## Vérifier l'installation

```bash
bun daroms doctor          # Node, .env, manifest, i18n, règles, types, lint, expo-doctor
bun daroms shot /          # rendu web de l'accueil : erreurs et débordements
```

Écran blanc, QR qui ne charge pas, module natif absent dans Expo Go : voir [Dépanner](/guides/depanner/).

## Avec Claude Code

Ouvrir Claude Code dans le dossier de l'app : au démarrage de session, le hook `daroms-sync` copie règles, skills et hooks de `core/_ai/` dans `.claude/`. Ensuite :

```text
/daroms-day Une app pour suivre ses habitudes de lecture
```

La journée complète est décrite dans le [tutoriel](/demarrer/tutoriel/).
