---
title: CLI daroms
description: Toutes les commandes de la CLI daroms (new, dev, doctor, g, icons, module, shot, test, e2e, assets, inspire, db, build, submit, update, cost, sync-ai, catalog, release-core) avec leurs options.
---

Dans une app : `bun daroms <commande>`. Hors app : `npx @daromsart/daroms-speed-app <commande>` (paquet npm), `daroms <commande>` après `npm install -g @daromsart/daroms-speed-app`, ou `bun <clone du cœur>/cli/daroms.ts <commande>`. `bun daroms --help` liste les commandes.

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
| [`promo`](#promo) | vidéo promo depuis les vrais écrans |
| [`test`, `e2e`](#test-et-e2e) | tests unitaires, flows Maestro |
| [`assets`](#assets) | icônes, splash, favicon depuis un SVG |
| [`logo`](#logo) | directions d'icône sur une grille, vérifiées |
| [`inspire`](#inspire) | aperçus d'inspiration à regarder avant le design |
| [`db`](#db) | migrations et types Supabase |
| [`build`, `submit`, `update`](#build-submit-update) | EAS |
| [`steps`](#steps) | parcours `/daroms-day`, une validation manuelle par étape |
| [`cost`](#cost) | ce que l'app a coûté en tokens et en dollars |
| [`sync-ai`, `catalog`](#sync-ai-et-catalog) | couche IA, catalogue |
| [`release-core`](#release-core) | version du cœur |

## new

```bash
npx @daromsart/daroms-speed-app new <slug> [options]
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
| `--core <url>` | dépôt du cœur | URL du sous-module (depuis npm : sous-module fixé sur le tag de la version, ou copie si le dépôt est inaccessible) |
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

Rapport texte (erreurs, exceptions, débordements, mesures de goût : teintes, rayons, tailles de texte, polices, dégradés, emoji, actions) puis capture si utile ou si `--capture`. Le serveur web est réutilisé tant que manifest et marque ne changent pas. Détail : [Vérifier](/guides/verifier/).

## promo

```bash
bun daroms promo [--locale en | --all] [--stills [auto|1,3.5]] [--audio son.wav] [--spec store/promo.json] [--port 8099]
```

Lit `store/promo.json` (format, accroche, 2 à 5 écrans légendés, fin), capture chaque route à 3x, compose aux couleurs de `brand.ts` et rend `store/promo/promo-<langue>.mp4` avec `poster-<langue>.png`. `--stills` écrit seulement des images fixes dans `.daroms/promo/`. Détail : [Publier](/guides/publier/#vidéo-promo).

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

Depuis `assets/source/icon.svg` (et `foreground.svg` facultatif) : `icon.png` (1024), `adaptive-icon.png`, `splash-icon.png` (512), `favicon.png` (48). Avec `background.svg` et `monochrome.svg` (écrits par `logo --use`) : `adaptive-background.png` et `monochrome-icon.png`, déclarés dans la config Expo.

## logo

```bash
bun daroms logo [--spec assets/source/logo.json]
bun daroms logo --use <nom> [--force]
```

Construit les 1 à 6 directions de `assets/source/logo.json` dans `.daroms/logo/<nom>/`, les vérifie (trait et contreformes à 48 px, présence, zone sûre Android, directions trop proches) et rend la planche `.daroms/logo/sheet.png`. `--use` installe la direction dans `assets/source/` puis lance `assets` ; `--force` passe outre un échec. Détail : [Changer la marque](/guides/changer-la-marque/#2-licône).

## inspire

```bash
bun daroms inspire <url...> [--clear]
bun daroms inspire
```

Télécharge dans `.daroms/inspiration/` (non versionné) l'image de chaque URL : image directe, ou page dont il prend l'aperçu (`og:image`). Claude regarde ensuite ces fichiers pendant `/daroms-inspire`. 12 adresses au plus, 8 Mo au plus par image, formats png, jpg, webp et gif ; `index.json` garde la source de chaque fichier. Sans argument : liste les aperçus ; `--clear` vide le dossier d'abord.

La commande s'annonce comme `daroms-inspire` et ne contourne rien : une page qui refuse la lecture automatique (Dribbble et Behance le font souvent) est signalée puis sautée ; garder alors le lien et l'extrait de la recherche.

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

## steps

```bash
bun daroms steps                       # état des 9 étapes, l'étape en cours marquée
bun daroms steps start                 # commence le parcours (app.steps.json)
bun daroms steps show [n]              # objectif, skills, livrables, points à vérifier
bun daroms steps ready <n> "<résumé>"  # fin d'étape : attend la validation de l'utilisateur
bun daroms steps reset <n>             # repart de l'étape n
bun daroms steps validate [n]          # validation au clavier (terminal interactif requis)
```

La validation se fait dans Claude Code en tapant `/daroms-valider` ; l'agent ne peut pas valider. Détail : [Hooks](/reference/hooks/#parcours-avec-validation-manuelle).

## cost

```bash
bun daroms cost [--print] [--out fichier]
```

Lit les transcripts de Claude Code (`~/.claude/projects`, ou `$CLAUDE_CONFIG_DIR/projects`) et chiffre chaque réponse de Claude au tarif de l'API Anthropic : entrée, sortie, cache lu, cache écrit (5 min et 1 h), mode rapide, recherches web. Écrit `app.cost.md` : total, coût par étape (`/daroms-idea`, `/daroms-brand`, `/daroms-screen`...), par modèle et par session, et ce qu'il faut retenir (étape la plus chère, effet du cache, part des sous-agents). `--print` affiche sans écrire.

- Une session compte pour l'app où elle a passé la majorité de son temps : `/daroms-day` lancé depuis une autre app compte pour la nouvelle.
- Les sous-agents (designer, store...) sont inclus et rattachés à l'étape en cours.
- Avec un abonnement Claude Pro ou Max, ces montants ne sont pas facturés ainsi : ils mesurent l'usage, à comparer d'une app à l'autre.
- Claude Code efface ses transcripts après 30 jours (`cleanupPeriodDays`) : `/daroms-day` écrit le rapport en fin de journée et le versionne.
- Tarifs dans `cli/lib/pricing.ts` du cœur, avec leur date de relevé ; un modèle inconnu est signalé et compté 0 $.

## sync-ai et catalog

- `sync-ai` : copie `core/_ai` vers `.claude/` (règles, skills, agents, hooks, contexte) et fusionne `settings.json`. Le hook `daroms-sync` le fait au début de chaque session.
- `catalog` : régénère `packages/ui/CATALOG.md` et `_ai/digest.md` depuis les sources du cœur.

## release-core

```bash
bun daroms release-core <patch|minor|major> [--dry]
```

Dans le dépôt du cœur : nouvelle version dans `VERSION` et tous les `package.json`, section de `CHANGELOG.md` depuis les commits conventionnels, commit et tag. L'arbre git doit être propre ; `--dry` affiche le résultat sans rien écrire. `git push --follow-tags` déclenche ensuite la publication npm ([Développer le cœur](/guides/developper-le-coeur/#publier-une-version)).
