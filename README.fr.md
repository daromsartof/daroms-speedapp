# Daroms Speed App

[English](https://github.com/daromsartof/daroms-speedapp/blob/main/README.md) · **Français**

[![npm](https://img.shields.io/npm/v/@daromsart/daroms-speed-app?color=3347ff&label=npm)](https://www.npmjs.com/package/@daromsart/daroms-speed-app)
[![licence MIT](https://img.shields.io/npm/l/@daromsart/daroms-speed-app?color=3347ff)](https://www.npmjs.com/package/@daromsart/daroms-speed-app?activeTab=code)
![Expo SDK 58](https://img.shields.io/badge/Expo-SDK%2058-121a3a)
![Tamagui v3](https://img.shields.io/badge/Tamagui-v3-121a3a)
![Bun >= 1.3](https://img.shields.io/badge/Bun-%3E%3D%201.3-121a3a)

**Le framework mobile conçu pour les agents IA.** Claude construit, le framework le garde sur les rails, tu valides chaque étape.

[![Démo : création d'une app avec npx, brand.ts modifié, table et écran générés, un hook qui refuse une couleur en dur, l'écran en clair et en sombre](https://raw.githubusercontent.com/daromsartof/daroms-speedapp/main/docs/public/demo.gif)](https://daromsartof.github.io/daroms-speedapp/demo.mp4)

*Sorties réelles d'une app de démo : une commande crée l'app complète, puis générateurs et hooks de règles font le reste. [Voir la démo complète de 50 s](https://daromsartof.github.io/daroms-speedapp/demo.mp4).*

Framework mobile **Expo + Tamagui + Supabase** conçu pour être piloté par un agent IA (Claude Code). Le cœur fournit le thème, les composants, les données, les modules et la publication ; l'agent n'écrit que le spécifique de ton app, dans des générateurs, des règles et des contrôles qu'il ne peut pas contourner.

## Ce qui le rend différent

Les starters donnent du code et laissent l'agent deviner tes conventions. Les générateurs d'apps par IA produisent une app sur leur propre plateforme. daroms donne à l'agent un framework dans lequel travailler :

- **Conçu pour l'agent, pas adapté après coup** : un noyau court toujours chargé, des règles chargées selon les fichiers touchés, un catalogue de composants à la place des sources, un routeur de contexte, et les étapes mécaniques dans des sous-agents Sonnet ou Haiku à contexte neuf.
- **Générer, puis remplir** : écrans, tables (avec RLS) et modules sortent de gabarits déterministes, sans IA ; l'agent n'écrit que le spécifique.
- **Des règles qui tiennent** : couleur en dur, Supabase dans un composant, texte hors i18n : un hook refuse l'écriture avant qu'elle n'arrive et dit quoi faire.
- **Un goût mesuré** : `daroms shot` compte sur le rendu réel ce qui trahit une interface générée (teintes hors marque, rayons hors échelle, emoji, boutons sans nom...), et une critique notée sur 10 pilote la finition.
- **Des validations humaines que l'agent ne peut pas falsifier** : `/daroms-pilot` suit les 9 étapes du cycle réel d'une app et s'arrête après chacune ; seul ton `/daroms-valider` le fait avancer.
- **Une vraie app, à toi** : un dépôt Expo dans ton git et tes comptes, un fichier de marque (`brand.ts`) pour tout le thème, des modules activables (auth, paiements, push, chat IA, photos, cartes, suivi des plantages), builds EAS, conformité des stores et mises à jour OTA.
- **Un coût lisible** : `daroms cost` chiffre chaque étape en tokens et en dollars.

Documentation complète : **https://daromsartof.github.io/daroms-speedapp/**

## Créer une app

Prérequis : [Bun](https://bun.sh) >= 1.3, Node >= 22.18, Git, Python 3, et [Expo Go](https://expo.dev/go) sur le téléphone.

```bash
npx @daromsart/daroms-speed-app new mon-app --name "Mon app" --variant list-detail
cd mon-app
cp .env.example .env    # URL et clé publique Supabase
bun daroms dev          # scanner le QR avec Expo Go
```

Commande globale : `npm install -g @daromsart/daroms-speed-app`, puis `daroms new mon-app`. La CLI s'exécute avec Bun.

`daroms new` copie le template, ajoute le cœur dans `core/`, écrit `brand.ts` et `app.manifest.ts`, active les modules de la variante, génère tables et écrans, icônes et splash, installe les dépendances, synchronise la couche IA dans `.claude/` et fait le commit initial. `core/` est un sous-module git fixé sur la version installée ; si le dépôt du cœur est inaccessible, c'est une copie du cœur contenu dans ce paquet.

Sans Supabase pour commencer : `--local` garde les données sur l'appareil, avec les mêmes hooks.

## Avec Claude Code

Ouvrir Claude Code dans l'app, puis :

```text
/daroms-pilot Une app pour suivre ses habitudes de lecture
```

L'agent mène chaque étape, puis s'arrête et montre ce qu'il faut vérifier ; tu tapes `/daroms-valider`, ou `/daroms-corriger <consigne>`.

| Étapes | Skills | Résultat |
|---|---|---|
| 1. Cadrer | `daroms new` (terminal), `/daroms-idea` | app créée, aperçu QR, cahier `app.spec.md` |
| 2-3. Concevoir et modéliser | `/daroms-inspire`, `/daroms-brand`, `/daroms-design`, `/daroms-data`, `/daroms-module` | références et direction choisie, marque et icône vérifiée, wireframes, tables Supabase avec RLS, modules |
| 4-5. Construire et vérifier | `/daroms-screen`, `/daroms-check`, `/daroms-polish` | écrans avec leurs 4 états, vérifications au vert, finition mesurée et notée |
| 6-9. Conformité, publication, suivi | `/daroms-store`, `/daroms-promo`, `/daroms-build`, `/daroms-submit`, `/daroms-update` | politique de confidentialité et conformité, fiche FR/EN, vidéo promo, build EAS, TestFlight et piste interne, suivi des plantages, puis `app.cost.md` |

25 skills, 3 sous-agents (designer, reviewer, store) et 7 hooks (synchronisation, routeur de contexte, vérification des règles, typecheck, protection de `.env`, validation manuelle des étapes, statistiques de tokens). La méthode [ECC](https://ecc.tools) est embarquée : `ecc-tdd-workflow`, `ecc-security-review`, `ecc-accessibility` et `ecc-typescript-patterns`, figés dans le cœur et traduits vers les commandes daroms par `daroms-ecc`. Détail : [skills](https://daromsartof.github.io/daroms-speedapp/reference/skills/), [hooks](https://daromsartof.github.io/daroms-speedapp/reference/hooks/).

## Exemple : une table et son écran

```bash
bun daroms g table books --fields "title:text, author:text?, pages:int=0"
bun daroms g screen books --tab --icon BookOpen --title "Livres" --title-en "Books"
bun daroms db push
```

La première commande écrit la migration (RLS propriétaire sur les 4 opérations), le schéma zod et les hooks `useBooks`, `useBook`, `useCreateBook`, `useUpdateBook`, `useDeleteBook`. La seconde écrit la route, l'écran avec ses 4 états, les textes FR/EN, le test et l'onglet. L'écran se remplit avec `@daroms/ui` :

```tsx
// src/features/books/BooksScreen.tsx
import { useT } from '@daroms/i18n'
import { Header, ListItem, QueryView, Screen } from '@daroms/ui'
import { BookOpen } from '@daroms/ui/icons'

import { useBooksScreen } from './hooks'

export default function BooksScreen() {
  const t = useT()
  const { query } = useBooksScreen()
  return (
    <Screen header={<Header title={t('books.title')} large />}>
      <QueryView query={query} empty={{ icon: BookOpen, title: t('books.emptyTitle') }}>
        {(books) => books.map((book) => <ListItem key={book.id} title={book.title} subtitle={book.author ?? undefined} chevron />)}
      </QueryView>
    </Screen>
  )
}
```

## Ce que contient le paquet

| Dossier | Contenu |
|---|---|
| `packages/` | `@daroms/theme` (thème depuis `brand.ts`), `@daroms/ui` (32 composants, 102 icônes Lucide, `CATALOG.md`), `@daroms/data` (Supabase, requêtes, erreurs, tables locales), `@daroms/lib` (formats, dates, zod, stockage, haptique), `@daroms/i18n`, `@daroms/app` (providers, gates, modules, layouts), `@daroms/config` |
| `modules/` | `auth`, `onboarding`, `settings`, `payments` (RevenueCat), `push`, `analytics`, `ai-chat` (Claude en streaming), `camera` (Supabase Storage), `maps` |
| `template/` | app de départ et 5 variantes : `list-detail`, `tracker`, `ai-chat`, `social`, `shop` (plus `blank`) |
| `generators/` | gabarits d'écran, de table et de module |
| `cli/` | la commande `daroms` |
| `_ai/` | couche IA : noyau, règles, skills, agents, hooks, zones de contexte |

Les paquets `@daroms/*` sont des sources TypeScript liées par workspace Bun depuis `core/`, sans étape de build.

## Commandes

| Commande | Rôle |
|---|---|
| `new <slug>` | créer une app (`--variant`, `--local`, `--primary`, `--accent`, `--tone`, `--modules`...) |
| `dev` | serveur Expo et QR (Expo Go, ou `--dev-client`) |
| `doctor` | Node, `.env`, manifest, i18n, règles, TypeScript, ESLint, expo-doctor |
| `g screen \| feature \| table \| module` | générer |
| `module add \| remove \| list` | modules |
| `shot <route>` | contrôle visuel : erreurs et débordements d'abord, capture si utile |
| `test`, `e2e` | jest-expo, Maestro |
| `assets` | icône, adaptive icon, splash, favicon depuis un SVG |
| `inspire <url...>` | aperçus d'inspiration (image ou page) dans `.daroms/inspiration/` pour que Claude les regarde |
| `cost` | tokens et prix de l'app (tarif API Anthropic) par étape, modèle et session, écrits dans `app.cost.md` |
| `db new \| push \| types \| reset` | migrations et types Supabase |
| `build`, `submit`, `update` | EAS : builds, stores, mises à jour OTA |

Toutes les options : [référence de la CLI](https://daromsartof.github.io/daroms-speedapp/reference/cli/).

## Documentation

- [Tutoriel : de l'idée à l'app publiée](https://daromsartof.github.io/daroms-speedapp/demarrer/tutoriel/)
- Guides : [écran](https://daromsartof.github.io/daroms-speedapp/guides/ajouter-un-ecran/), [table](https://daromsartof.github.io/daroms-speedapp/guides/ajouter-une-table/), [module](https://daromsartof.github.io/daroms-speedapp/guides/ajouter-un-module/), [formulaires](https://daromsartof.github.io/daroms-speedapp/guides/formulaires/), [marque](https://daromsartof.github.io/daroms-speedapp/guides/changer-la-marque/), [publier](https://daromsartof.github.io/daroms-speedapp/guides/publier/)
- Référence : [composants](https://daromsartof.github.io/daroms-speedapp/reference/composants/), [manifest](https://daromsartof.github.io/daroms-speedapp/reference/manifest/), [tokens](https://daromsartof.github.io/daroms-speedapp/reference/tokens/), [règles](https://daromsartof.github.io/daroms-speedapp/reference/regles/)
- Pour les agents : [`llms.txt`](https://daromsartof.github.io/daroms-speedapp/llms.txt), [`llms-full.txt`](https://daromsartof.github.io/daroms-speedapp/llms-full.txt), et chaque page en Markdown (suffixe `.md`)

## Versions

Le cœur suit le versionnage sémantique ; les ruptures n'arrivent qu'en version majeure (`CHANGELOG.md` dans le paquet). Mettre à jour une app : [guide](https://daromsartof.github.io/daroms-speedapp/guides/mettre-a-jour-le-coeur/).

## Développer le cœur

```bash
git clone https://github.com/daromsartof/daroms-speedapp.git daroms-speed-app
cd daroms-speed-app && bun install
bun run check                     # tsc, eslint, jest, tests CLI, tests des hooks
bun run docs:dev                  # site de documentation (docs/)
bun daroms release-core minor     # version, changelog, tag ; git push --follow-tags publie sur npm
```

Détail : [Développer le cœur](https://daromsartof.github.io/daroms-speedapp/guides/developper-le-coeur/).

## Licence

MIT, texte complet dans le fichier `LICENSE` du paquet.

Conçu par [Daroms'Art](https://daromsart.xyz/), agence de développement web, mobile et IA.
