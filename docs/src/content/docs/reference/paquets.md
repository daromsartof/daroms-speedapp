---
title: Paquets @daroms/*
description: API publique des paquets du cœur - @daroms/ui, @daroms/theme, @daroms/data, @daroms/lib, @daroms/i18n, @daroms/app, @daroms/config - avec leurs points d'entrée et exemples.
---

Les paquets sont des sources TypeScript liées par workspace Bun (`core/packages/*`), sans étape de build. Importer uniquement les points d'entrée listés ici.

| Paquet | Rôle |
|---|---|
| [`@daroms/ui`](#daromsui) | composants, icônes Lucide, primitives de mise en page |
| [`@daroms/theme`](#daromstheme) | thème piloté par `brand.ts` |
| [`@daroms/data`](#daromsdata) | Supabase, requêtes, erreurs, tables locales |
| [`@daroms/lib`](#daromslib) | formats, dates, zod partagé, stockage, haptique, manifest |
| [`@daroms/i18n`](#daromsi18n) | i18next, `useT` typé |
| [`@daroms/app`](#daromsapp) | provider racine, gates, modules, layouts |
| [`@daroms/config`](#daromsconfig) | tsconfig, ESLint, Jest, Prettier |

## @daroms/ui

```ts
import { Button, Screen, List, YStack } from '@daroms/ui'
import { Plus } from '@daroms/ui/icons'
```

- Composants : voir le [catalogue](/reference/composants/) (props et exemples).
- Primitives Tamagui réexportées : `XStack`, `YStack`, `View`, `ScrollView`, `Separator`, `Spacer`, `Spinner`, `Switch`, `Theme`, `styled`, `useMedia`, `useTheme`.
- Notifications : `notify.success | error | info(message)` (`<Toaster />` est monté par `AppProvider`).

## @daroms/theme

```ts
import { defineBrand } from '@daroms/theme/brand'          // dans brand.ts
import { createBrandConfig } from '@daroms/theme'           // dans tamagui.config.ts
```

| Export | Rôle |
|---|---|
| `defineBrand`, `BrandSchema` | valide et complète la marque |
| `createBrandConfig` | configuration Tamagui complète (tokens, thèmes, polices, animations) |
| `createBrandTheme`, `createBrandPalettes` | données pures : palettes, tokens couleur, thèmes |
| `createPalette`, `createNeutral`, `anchorShade`, `paletteToTokens`, `SHADES` | palettes OKLCH |
| `contrastRatio`, `hexToRgb`, `rgbToHex`, `rgbToOklch`, `oklchToHex` | couleurs |
| `semanticRadius`, `semanticSpace`, `springs`, `TONES`, `DURATIONS`, `Z_INDEX` | ton, rayons, espaces, animations |
| `createBrandFonts`, `FONT_SIZES`, `INTER_FILES` (`@daroms/theme/fonts`) | polices |

Détail du calcul : [Marque](/reference/marque/).

## @daroms/data

Seul accès à Supabase, et seulement depuis `src/features/<x>/api.ts`.

| Export | Rôle |
|---|---|
| `db()` | client Supabase typé par `src/types/db.ts` : `db().from('books').select()` |
| `configureSupabase`, `getSupabase`, `getSupabaseEnv`, `isSupabaseConfigured` | configuration (faite par `createRootLayout`) |
| `moduleDb()` | client non typé, réservé aux modules du cœur |
| `parseOrThrow(schema, data)` | valide une réponse ; erreur `validation` sinon |
| `unwrap(result)` | renvoie `data` ou lève l'erreur Supabase normalisée |
| `queryKeys('books')` | clés `all`, `list(params)`, `detail(id)` |
| `AppError`, `toAppError` | erreurs normalisées avec `code` et `messageKey` i18n |
| `localTable(name, schema)` | table sur l'appareil, mêmes lignes que Supabase : `list`, `get`, `insert`, `update`, `remove`, `clear` |
| `SessionProvider`, `useSession()`, `useUser()` | session Supabase |
| `QueryProvider`, `createQueryClient` | TanStack Query |

Codes d'`AppError` : `network`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `validation`, `rateLimit`, `config`, `unknown`. `ErrorState` affiche le message traduit et le bouton Réessayer.

```ts
export function useBooks() {
  return useQuery({
    queryKey: booksKeys.list(),
    queryFn: async () => parseOrThrow(BookSchema.array(), unwrap(await db().from('books').select('*'))),
  })
}
```

## @daroms/lib

Fonctions pures, testées. Sous-chemins : `@daroms/lib/format`, `/dates`, `/zod`, `/storage`, `/haptics`, `/id`, `/manifest`, `/manifest-schema`.

| Domaine | Exports |
|---|---|
| Formats | `formatPrice(montant, devise?)`, `formatNumber`, `formatPercent(ratio)`, `formatDate(valeur, 'short'\|'medium'\|'long'\|'time'\|'datetime')`, `formatRelative` (« il y a 3 min »), `initials`, `deviceLocale` |
| Jours calendaires | `dayKey` (« AAAA-MM-JJ » local), `toDay`, `addDays`, `daysBetween`, `isToday`, `lastDays(items, date, { days, value })` (somme par jour), `streak(dates)` (série), `formatWeekday(jour, 'narrow'\|'short'\|'long')` |
| zod | `zEmail`, `zPassword`, `zRequired`, `zUuid`, `zUrl`, `zIsoDate`, `zMoney`, `zPositiveInt`, `zRow`, `z` |
| Stockage | `storage` (instance de l'app), `createStorage(id)` : `getString`, `setString`, `getBoolean`, `setBoolean`, `getJSON(cle, schema?)`, `setJSON`, `has`, `remove` ; `zustandStorage`, `supabaseAuthStorage`. MMKV, sinon SQLite kv-store (Expo Go), sinon mémoire. |
| Haptique | `haptic('light'\|'medium'\|'heavy'\|'selection'\|'success'\|'warning'\|'error')`, `setHapticsEnabled`, `hapticsEnabled` |
| Identifiants | `createId()` (UUID si disponible) |
| Manifest | `getManifest()`, `defineManifest`, `ManifestSchema`, `setManifestForTests` |

Les jours sont calculés par date civile, pas en millisecondes : un jour de 23 h ou 25 h (heure d'été) ne décale rien.

## @daroms/i18n

| Export | Rôle |
|---|---|
| `useT()` | traductions de l'app, typées par les clés de `locales/` |
| `useDaromsT()` | textes du cœur (namespace `daroms`) |
| `useTranslateKey()` | traduit une clé préfixée (`daroms:validation.email`) |
| `createNamespaceT(ns)` | hook typé pour un namespace (modules) |
| `initI18n`, `detectLanguage`, `coreResources`, `i18next` | initialisation (faite par `createRootLayout`) |

Mode d'emploi : [Textes et langues](/guides/textes-et-langues/).

## @daroms/app

L'assemblage d'une app ; une app n'y touche presque jamais directement.

| Export | Rôle |
|---|---|
| `createRootLayout({ config, modules, locales, supabase, loadInter })` | layout racine : i18n, Supabase, modules, polices, splash, providers, pile |
| `AppProvider` | gestes, safe area, Tamagui, thème de navigation, requêtes, session, gates, modules, toasts |
| `TabsLayout` | onglets construits depuis `manifest.tabs` |
| `defineModule`, `resolveModules` | définir et valider les modules |
| `useModules`, `useModuleConfig(slug)`, `useModuleSettings` | modules au runtime |
| `GateKeeper`, `useGate(slug, priorité, { ready, redirect })` | redirections au démarrage (onboarding 10, auth 20, paywall 30) ; le splash reste tant qu'une gate n'est pas prête |
| `usePreferences`, `useAppColorScheme` | préférences : apparence système, clair ou sombre |
| `withDaroms` (`@daroms/app/expo-config`) | configuration Expo dérivée du manifest et de la marque |
| `@daroms/app/testing` | rendu de test avec providers |

`defineModule({ slug, config, Provider, init, locales, useSettings, gate, modals })` : voir [Architecture](/explications/architecture/#modules).

## @daroms/config

`tsconfig.base.json` (strict), `eslint` (règles daroms : routes, styles, données, imports, `any`), `jest` (preset jest-expo, mocks), `prettier`. Les apps les étendent ; ne pas les copier.
