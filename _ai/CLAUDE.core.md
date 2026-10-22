# Daroms Speed App : noyau (toujours chargé)

App mobile Expo SDK 58 (Expo Router, React Native 0.88, New Architecture) + Tamagui v3 + Supabase.
Objectif : livrer vite un code propre. Le cœur (`core/`, sous-module) fournit tout le répétitif ;
l'app n'écrit que son spécifique. Ne jamais modifier `core/` depuis une app.

## Avant toute tâche
1. Lire `app.spec.md` (cahier de l'app) et `core/packages/ui/CATALOG.md` (composants, tokens, icônes). Ne pas lire les sources de `core/`.
2. Une tâche par session ; `/clear` entre deux sujets. Lectures en parallèle ; agent Explore pour les recherches larges.
3. Générer avant d'écrire : `bun daroms g screen|feature|table`, `bun daroms module add`, `bun daroms icons add`.

## Carte de l'app
- `app/**` : routes minces, une ligne : `export { default } from '@/features/x/XScreen'`.
- `src/features/<x>/` : `XScreen.tsx` (UI), `hooks.ts` (logique), `api.ts` (Supabase + TanStack Query), `schema.ts` (zod), `components/`.
- `src/lib/` fonctions pures testées ; `src/types/db.ts` généré ; `src/generated/` généré (ne pas éditer).
- `app.manifest.ts` (nom, modules, onglets, écrans) réécrit par la CLI ; `brand.ts` (5 valeurs de marque).
- `locales/fr.json`, `locales/en.json` : mêmes clés partout.

## Règles non négociables (détail : `.claude/rules/`, chargé selon les fichiers)
- UI : uniquement `@daroms/ui` et primitives Tamagui ; icônes `@daroms/ui/icons` (Lucide). Pas d'autre librairie UI.
- Styles : tokens Tamagui v3 sans `$` (`p="gutter"`, `gap="stack"`, `rounded="card"`, `bg="card"`, `color="color-9"`).
  Interdits : couleur hex/rgb, nombre magique de style, `StyleSheet.create`, style inline.
- Données : Supabase seulement dans `features/x/api.ts` via `db()` de `@daroms/data`, résultat validé zod (`parseOrThrow`).
  Jamais dans un composant. Base : migrations SQL, RLS sur chaque table, jamais de clé `service_role` dans l'app.
- État : serveur = TanStack Query ; local persistant = `@daroms/lib/storage` (MMKV) ; global UI = Zustand (rare).
- Textes : `t('cle')` (useT de `@daroms/i18n`), clé ajoutée en FR et EN. Pas d'emoji, pas de tiret long.
- Chaque écran gère 4 états : chargement (Skeleton), vide (EmptyState), erreur (ErrorState + réessayer), données. `QueryView` ou `List` le font.
- Listes : `List` (FlashList), `renderItem` mémoïsé ; images : `Image` (expo-image) ; animations : Reanimated ou `transition`.
- Fonctionnalité optionnelle = module (`core/modules`), jamais dans les paquets communs.
- Nommage : `PascalCase` composants, `useX` hooks, `kebab-case` routes et dossiers, fichiers <= 200 lignes,
  `any` interdit, imports absolus `@/` (src) et `~/` (racine).
- Fichiers IA : `daroms-*` dans `.claude/` sont écrasés à la synchro ; ce qui est propre à l'app porte `app-`.

## Tamagui v3 (différent de v2, ne pas se fier à la mémoire)
- Valeurs plates sans `$` : `p="4"`, `bg="background"`, `color="color-11"`. Conditions dans la valeur :
  `bg="card press:background-press"`, `opacity="1 enter:0 exit:0"`, `p="4 sm:6"`. Plus de `hoverStyle`/`pressStyle`.
- Couleurs du thème : `color-1`..`color-11` (1 = proche du fond), clés en kebab-case (`border-color`, `background-press`).
- Sous-thèmes : `theme="brand"` (plein), `soft`, `accent`, `highlight`, `success`, `warning`, `danger`, `destructive`, `level2`.
- Tailles de contrôles nommées (`size="sm|md|lg"` sur nos Button) ; texte `size="1".."10"` ; `transition="fast|medium|slow"`.

## Boucle de travail
- Écrire -> les hooks vérifient règles + types du fichier touché (message court si refus : corriger, ne pas contourner).
- Vérifier l'écran : `bun daroms shot /route` (erreurs, débordements, puis capture si utile) ; `--dark` pour le sombre.
- Avant de rendre : `bun daroms doctor --quick` puis `bun daroms test`.
- Erreurs Metro/Expo : `/daroms-fix`. Fin de tâche : `/daroms-learn` puis `/daroms-commit`.

## Commandes
`bun daroms` : `dev`, `doctor`, `g screen|feature|table`, `module add|list`, `icons add`, `shot`, `test`, `e2e`,
`assets`, `db new|push|types`, `build`, `submit`, `update`, `sync-ai`.
Skills : `/daroms-day` (journée complète), `/daroms-idea`, `/daroms-new`, `/daroms-brand`, `/daroms-design`,
`/daroms-data`, `/daroms-screen`, `/daroms-module`, `/daroms-fix`, `/daroms-check`, `/daroms-polish`,
`/daroms-store`, `/daroms-build`, `/daroms-submit`, `/daroms-update`, `/daroms-commit`, `/daroms-learn`.

## Style de réponse
Français, court, factuel. Pas de résumé de ce qui vient d'être fait si la sortie d'outil le montre déjà.
