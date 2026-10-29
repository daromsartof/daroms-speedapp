---
title: CLI daroms
description: Toutes les commandes de la CLI daroms (new, dev, doctor, g, icons, module, shot, test, e2e, assets, db, build, submit, update, sync-ai, catalog, release-core) avec leurs options.
---

Dans une app : `bun daroms <commande>`. Hors app : `bun <cœur>/cli/daroms.ts <commande>`, ou `daroms <commande>` après `bun link` dans le cœur. `bun daroms --help` liste les commandes.

## Résumé

| Commande | Rôle |
|---|---|
| [`new`](#new) | crée une app complète |
| [`dev`](#dev) | serveur Expo et QR |
| [`doctor`](#doctor) | diagnostic complet |
| [`g`](#g) | génère écran, feature, table, module |
| [`icons`](#icons) | ajoute des icônes Lucide à l'app |
| [`module`](#module) | active, retire, liste les modules |
| [`shot`](#shot) | contrôle visuel d'une route |
| [`test`, `e2e`](#test-et-e2e) | tests unitaires, flows Maestro |
| [`assets`](#assets) | icônes, splash, favicon depuis un SVG |
| [`db`](#db) | migrations et types Supabase |
| [`build`, `submit`, `update`](#build-submit-update) | EAS |
| [`sync-ai`, `catalog`](#sync-ai-et-catalog) | couche IA, catalogue |
| [`release-core`](#release-core) | version du cœur |

## new

```bash
bun <cœur>/cli/daroms.ts new <slug> [options]
```

| Option | Défaut | Effet |
|---|---|---|
| `--name "Nom"` | slug capitalisé | nom affiché |
| `--variant` | `blank` | `blank`, `list-detail`, `tracker`, `ai-chat`, `social`, `shop` ([Variantes](/reference/variantes/)) |
| `--local` | - | tables de la variante sur l'appareil (`localTable`) |
| `--primary`, `--accent` | `#4F46E5`, `#F97316` | couleurs de `brand.ts` |
| `--font` | `inter` | `inter` ou `system` |
| `--radius` | `lg` | `none`, `sm`, `md`, `lg`, `xl`, `full` |
| `--tone` | `pro` | `playful`, `pro`, `minimal` |
| `--bundle` | `com.daroms.<slug>` | identifiant iOS et Android |
| `--modules a,b` | - | modules en plus de ceux de la variante |
| `--supabase <ref>` | - | `manifest.supabase.projectRef` |
| `--dir <dossier>` | dossier courant | où créer l'app |
| `--core <url>` | remote du cœur | URL du sous-module |
| `--copy` | - | copie le cœur (instantané, sans sous-module) |
| `--link` | - | lien symbolique vers le cœur (développement du cœur) |
| `--no-git` | - | ni `git init` ni commit initial |

Étapes : copie du template, variante, substitution des valeurs, `git init`, cœur (sous-module, copie ou lien), `bun install`, manifest, modules, registre, tables et écrans de la variante, icônes, types de routes, couche IA, commit initial.

## dev

```bash
bun daroms dev [--dev-client] [--web] [--android] [--ios] [--tunnel] [--clear]
```

Expo Go par défaut (aperçu immédiat). `--dev-client` : build de développement déjà installé. `--tunnel` si le téléphone n'est pas sur le même réseau, `--clear` vide le cache Metro. Avertit si `.env` manque ou si `payments` ou `push` sont actifs sans `--dev-client`.

## doctor

```bash
bun daroms doctor [--quick]
```

Node, `.env`, manifest, cohérence de l'app (écrans, onglets, clés i18n FR = EN), règles, TypeScript, ESLint, expo-doctor. `--quick` saute les étapes lentes.

## g

```bash
bun daroms g screen <nom> [--tab] [--icon NomLucide] [--title "Titre"] [--title-en "Title"] [--route chemin] [--force]
bun daroms g feature <nom>
bun daroms g table <table> --fields "titre:text, fait:bool=false" [--feature nom] [--singular nom] [--local]
bun daroms g module <slug> [--description "..."]      # dans le dépôt du cœur
```

Détail : [Ajouter un écran](/guides/ajouter-un-ecran/), [Ajouter une table](/guides/ajouter-une-table/), [Développer le cœur](/guides/developper-le-coeur/).

## icons

```bash
bun daroms icons add Rocket Sprout
```

Génère les icônes Lucide demandées dans l'app (`@/icons`). Le jeu de base (102 icônes) est dans `@daroms/ui/icons`. Jamais d'autre jeu d'icônes.

## module

```bash
bun daroms module list
bun daroms module add <slug> [--no-install]
bun daroms module remove <slug>
```

Détail : [Ajouter un module](/guides/ajouter-un-module/).

## shot

```bash
bun daroms shot <route> [--dark] [--capture] [--width 390] [--locale en] [--storage cle=val,...] [--storage-file f.json] [--android] [--port 8099]
bun daroms shot --stop
```

Rapport texte (erreurs, exceptions, débordements) puis capture si utile ou si `--capture`. Le serveur web est réutilisé tant que manifest et marque ne changent pas. Détail : [Vérifier](/guides/verifier/).

## test et e2e

```bash
bun daroms test [motif]
bun daroms e2e [flow] [--go] [--driver]
```

`test` : jest-expo. `e2e` : Maestro sur l'appareil connecté ; `--go` charge l'app dans Expo Go ; `--driver` pré-lance le pilote Android.

## assets

```bash
bun daroms assets
```

Depuis `assets/source/icon.svg` (et `foreground.svg` facultatif) : `icon.png` (1024), `adaptive-icon.png`, `splash-icon.png` (512), `favicon.png` (48).

## db

```bash
bun daroms db new <nom>   # migration vide horodatée
bun daroms db push        # applique les migrations au projet lié, régénère src/types/db.ts
bun daroms db types       # src/types/db.ts depuis Supabase (hors ligne sans projet lié)
bun daroms db reset       # supabase db reset (base locale)
```

## build, submit, update

```bash
bun daroms build [preview|production|development] [--platform ios|android|all]
bun daroms submit [--platform ios|android|all]
bun daroms update [canal] --message "..."
```

Détail : [Publier](/guides/publier/).

## sync-ai et catalog

- `sync-ai` : copie `core/_ai` vers `.claude/` (règles, skills, agents, hooks, contexte) et fusionne `settings.json`. Le hook `daroms-sync` le fait au début de chaque session.
- `catalog` : régénère `packages/ui/CATALOG.md` et `_ai/digest.md` depuis les sources du cœur.

## release-core

```bash
bun daroms release-core <patch|minor|major> [--dry]
```

Dans le dépôt du cœur : nouvelle version dans `VERSION`, section de `CHANGELOG.md` depuis les commits conventionnels, commit et tag. L'arbre git doit être propre ; `--dry` affiche le résultat sans rien écrire.
