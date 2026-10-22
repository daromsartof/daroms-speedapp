# Daroms Speed App : framework mobile Expo + Tamagui + Supabase, piloté par Claude

> Plan destiné à Claude Opus, à exécuter dans le dépôt `daroms-speed-app`.
> Annotation unique : préfixe **`daroms-`** pour tout ce qui vient du cœur (règles, skills, agents, hooks, zones), préfixe **`app-`** pour ce qui est propre à une app. Packages npm : `@daroms/*`. CLI : `daroms`.

## Contexte

Objectif : un framework mobile solide pour sortir **une app par jour** en consommant peu de tokens. Principes :
- un **cœur partagé** en sous-module git, chaque app n'écrit que son spécifique ;
- des **règles de code précises**, vérifiées automatiquement ;
- un **thème unique** réutilisable, piloté par 5 valeurs de marque ;
- des **générateurs déterministes** pour tout le répétitif, Claude ne remplit que le spécifique ;
- des **commandes Claude** (skills) pour chaque étape de production, de l'idée au store, inspirées de Rork (prompt → app → aperçu QR → publication) ;
- une **couche IA** économe : noyau court toujours chargé, règles chargées selon les fichiers touchés, routeur de contexte, catalogue de composants.

Choix figés : **Expo** (dernier SDK stable, Expo Router, New Architecture), **Tamagui** (thème + UI), **Supabase** (auth, Postgres, storage, edge functions), **EAS** (build, submit, update).

---

## 1. Concepts du framework

| Concept | Dans Daroms Speed App |
|---|---|
| Cœur partagé | Dépôt `daroms-speed-app` en sous-module `core/` de chaque app (workspace Bun : `core/packages/*`) |
| Écran | Route mince `app/(...)/x.tsx` + dossier `src/features/x/` (`XScreen.tsx`, `hooks.ts`, `api.ts`, `schema.ts`) |
| Configuration | `app.manifest.ts` typé (zod), lu via `getManifest()` ; `app.config.ts` en dérive (nom, bundle id, icônes, modules) |
| Actions et données | `features/x/api.ts` : hooks TanStack Query, entrée validée zod, appel Supabase uniquement via `@daroms/data` |
| Logique réutilisable | `src/lib/<domaine>/` (app) et `core/packages/lib` (cœur) : fonctions pures, testées |
| Schéma base | `supabase/migrations/*.sql`, RLS obligatoire, `supabase gen types` → `src/types/db.ts` |
| Fonctionnalité activable | **Module** `core/modules/<slug>` activé dans `manifest.modules` ; registre généré, rien d'importé si absent |
| Thème | `@daroms/theme` : tokens + thèmes Tamagui générés depuis `brand.ts` |
| Icônes | Un seul jeu : `@tamagui/lucide-icons`, réexporté par `@daroms/ui/icons` |
| Textes | `locales/<iso>.json` + i18next + expo-localization, clés typées |
| Boîte à outils | CLI `daroms` (Bun) à commandes courtes |
| Couche IA | `core/_ai/` (format Claude natif), synchronisé dans `.claude/` de l'app au démarrage de session |
| Contrôle visuel | `daroms shot <route>` : logs, erreurs, débordements d'abord, capture seulement si utile |
| Tests | `daroms test` (jest-expo + Testing Library) + flows Maestro (e2e mobile) |
| Versions du cœur | `daroms release-core` (version, changelog, tag) |

---

## 2. Arborescence du cœur `daroms-speed-app`

```
daroms-speed-app/
  packages/
    theme/        tokens, thèmes, polices, animations, createBrandTheme(brand)
    ui/           composants Tamagui (liste §4), icons, CATALOG.md généré
    data/         client Supabase, session auth, query client, gestion d'erreurs
    lib/          format (prix, dates), zod partagé, storage (MMKV), haptics
    i18n/         init i18next, hook useT typé
  modules/        auth, onboarding, settings, payments (RevenueCat), push, analytics, ai-chat, camera, maps
    <slug>/       index.ts (provider + écrans), config.ts (schéma zod), plugin.ts (config plugin Expo), README.md
  template/       app de départ (copiée par `daroms new`), variants/ par type d'app
  generators/     gabarits screen, feature, table, module (remplissage par variables, sans IA)
  cli/            daroms.ts + commands/<famille>.ts
  _ai/
    CLAUDE.core.md            noyau toujours chargé (< 120 lignes)
    rules/daroms-*.md         une convention par fichier, frontmatter `paths:` (chargée selon fichiers)
    rules-ondemand/daroms-*.md lue seulement quand le sujet arrive
    digest.md                 une ligne par règle (toujours chargé), généré
    skills/daroms-*/SKILL.md  commandes de production (§6)
    agents/daroms-*.md        sous-agents (designer, reviewer, store)
    hooks/daroms-*.py         garde-fous (§5)
    context/daroms-zones.json daroms-alias.json
    settings.json             hooks + permissions, fusionné dans l'app
  docs/           tutoriel, fiches pratiques, référence, explications
  CHANGELOG.md  VERSION
```

## 3. Arborescence d'une app (sortie de `daroms new`)

```
<app>/
  core/                   sous-module daroms-speed-app
  app/                    Expo Router : routes minces uniquement
    _layout.tsx  (tabs)/  (auth)/  +not-found.tsx
  src/
    features/<x>/         XScreen.tsx, hooks.ts, api.ts, schema.ts, components/
    lib/  types/db.ts
  brand.ts                couleur principale, accent, police, rayon, ton (playful | pro | minimal)
  app.manifest.ts         nom, slug, bundleId, modules[], écrans, monétisation
  app.spec.md             cahier de l'app (produit par /daroms-idea) : source unique pour Claude
  locales/fr.json en.json
  supabase/migrations/
  assets/                 icon, splash, adaptive-icon générés
  e2e/*.yaml              flows Maestro
  CLAUDE.md               @core/_ai/CLAUDE.core.md + spécificités app (court)
  .claude/                généré (daroms-*) + app-* écrits à la main
  eas.json
```

---

## 4. Thème et UI (`@daroms/theme`, `@daroms/ui`)

- **Une seule entrée par app : `brand.ts`.** `createBrandTheme(brand)` (basé sur `@tamagui/theme-builder`) génère palettes 12 nuances, thèmes `light`/`dark`, sous-thèmes `accent`, `success`, `warning`, `danger`, et ajuste rayons, espacements et polices selon `tone`. Changer d'identité = changer 5 valeurs.
- Tokens figés : `space` 4-pt, `size`, `radius`, `zIndex`, typographie (`$1…$10`), durées et ressorts d'animation (driver Reanimated).
- Composants (variants, états pressed/disabled/loading, a11y, haptics intégrés) : `Screen` (safe area, scroll, clavier, pull-to-refresh), `Header`, `Button`, `IconButton`, `Input`, `FormField` (react-hook-form + zod), `Card`, `ListItem`, `List` (FlashList), `Sheet`, `Dialog`, `Toast`, `EmptyState`, `ErrorState`, `Skeleton`, `Avatar`, `Badge`, `Chip`, `SegmentedControl`, `Tabs`, `ProgressBar`, `Image` (expo-image), `Paywall`, `OnboardingPager`, `SettingsList`.
- **Catalogue pour Claude** : `packages/ui/CATALOG.md` généré (une ligne par composant : nom, props clés, exemple). Claude lit ce fichier, jamais les sources : gros gain de tokens.
- Écran vitrine `/_dev/kitchen-sink` dans le template (absent en production) pour vérifier le thème d'un coup d'œil.

## 5. Règles de code

Noyau `CLAUDE.core.md` très court ; détail dans `rules/` avec `paths:`.

1. **Routes minces** : `app/**` n'exporte qu'un écran de `src/features`. Aucune logique.
2. **Styles** : uniquement `@daroms/ui` / primitives Tamagui avec tokens (`$4`, `$color10`). Interdits : couleur hex, nombre magique, `StyleSheet.create`, librairie UI tierce, autre jeu d'icônes.
3. **Données** : tout accès Supabase passe par `features/x/api.ts` (TanStack Query), entrée et sortie validées zod, types depuis `types/db.ts`. Jamais d'appel Supabase dans un composant.
4. **Base** : structure uniquement par migration SQL ; RLS sur chaque table ; jamais de clé `service_role` côté app.
5. **État** : serveur = TanStack Query ; local persistant = MMKV via `@daroms/lib/storage` ; global UI = Zustand (un store par feature, rare).
6. **Textes** : tout texte affiché passe par `t('cle')` ; pas d'emoji ni de tiret long dans les textes.
7. **Fonctionnalité optionnelle = module**, jamais dans les packages communs.
8. **Nommage** : `PascalCase` composants, `useX` hooks, `kebab-case` routes, fichiers ≤ 200 lignes, `any` interdit, imports absolus `@/`.
9. **Chaque écran** gère 4 états : chargement (Skeleton), vide (EmptyState), erreur (ErrorState + réessayer), données.
10. **Performance** : FlashList pour toute liste, expo-image, items mémoïsés, animations Reanimated uniquement.
11. **Fichiers IA** : `daroms-*` jamais modifiés dans l'app (écrasés à la synchro) ; ce qui est propre à l'app porte `app-`.
12. **Méthode** : une tâche par session, `/clear` entre deux sujets, lectures en parallèle, agent Explore pour les recherches larges, lire `CATALOG.md` et `app.spec.md` avant tout.

Hooks (`core/_ai/hooks/`) :
- `daroms-check-rules.py` (PostToolUse Edit|Write) : bloque hex, `StyleSheet.create`, `any`, import Supabase hors `api.ts`, texte en dur dans JSX, emoji. Message court et précis.
- `daroms-typecheck.py` (PostToolUse, fichier touché seulement) : `tsc` incrémental + eslint, sortie limitée à 20 lignes.
- `daroms-deny-env.py` (PreToolUse Bash) + permissions deny sur `.env*`.
- `daroms-context.py` (SessionStart build, UserPromptSubmit route) : routeur de zones (ancres de la demande → zones apprises `*-zones.json` → recherche plein texte), silencieux si incertain.
- `daroms-sync.py` (SessionStart) : copie `core/_ai/` → `.claude/`, régénère `digest.md` et `CATALOG.md` si besoin.
- `daroms-session-stats.py` (Stop) : tokens et durée par session dans `.claude/stats.jsonl`.

## 6. Commandes de production (skills `daroms-*`)

Chaque skill : étapes numérotées, décisions déjà prises, scripts déterministes appelés par la CLI, point d'arrêt clair.

| Étape | Commande | Ce qu'elle fait |
|---|---|---|
| 0 | `/daroms-day <idée>` | Orchestrateur de la journée : enchaîne les étapes avec un point de validation entre chaque |
| 1 | `/daroms-idea` | Brainstorm court → `app.spec.md` : cible, boucle principale, 3 à 6 écrans, données, modules, monétisation, nom, ton |
| 2 | `/daroms-new` | `daroms new <slug>` : template, sous-module core, `brand.ts`, `app.manifest.ts`, modules, bundle id, projet Supabase lié |
| 3 | `/daroms-brand` | Palette et ton → `brand.ts` ; icône, splash, adaptive icon (génération image + `daroms assets`) |
| 4 | `/daroms-design` | Passe design avec les skills design (§7) : flux, hiérarchie, wireframes texte par écran dans `app.spec.md` |
| 5 | `/daroms-data` | Tables + RLS en migration, `supabase db push`, types générés, hooks `api.ts` générés |
| 6 | `/daroms-screen <nom>` | `daroms g screen` puis remplissage avec `@daroms/ui` ; 4 états ; clés i18n ajoutées |
| 7 | `/daroms-module <slug>` | Ajout d'un module (auth, paiement, push, IA…) : manifest, config plugin, écrans, variables d'env |
| 8 | `/daroms-fix` | Auto-réparation façon Rork : lit logs Metro/Expo et `daroms doctor`, corrige, relance, 3 essais max puis rapport |
| 9 | `/daroms-check` | typecheck + lint + tests + `daroms shot` sur les écrans touchés + flow Maestro principal |
| 10 | `/daroms-polish` | Revue UX par l'agent `daroms-designer` : espacements, états, a11y, haptics, micro-animations, mode sombre |
| 11 | `/daroms-store` | Fiche store : titre, sous-titre, mots-clés ASO, description FR/EN, captures, politique de confidentialité |
| 12 | `/daroms-build` | `eas build --profile preview` (QR interne) puis `production` |
| 13 | `/daroms-submit` | `eas submit` iOS (TestFlight) et Android (piste interne), checklist conformité |
| 14 | `/daroms-update` | Mise à jour OTA `eas update` sur un canal |
| · | `/daroms-commit` | Commits en français, découpés par fonctionnalité |
| · | `/daroms-learn` | Fin de tâche : enrichit `app-zones.json` / `daroms-zones.json` |
| · | `/daroms-skill-new` | Crée un skill `daroms-` ou `app-` au bon endroit et au bon format |
| · | `/daroms-release-core` | Version du cœur, changelog, tag, consigne de mise à jour des apps |

Sous-agents : `daroms-designer` (revue visuelle et UX), `daroms-reviewer` (règles §5, sécurité RLS), `daroms-store` (ASO et captures). Ils renvoient un résumé court.

CLI `daroms` : `new`, `dev` (expo start + QR), `doctor` (expo-doctor + vérif règles), `g screen|feature|table|module`, `shot <route> [--dark]`, `test`, `e2e`, `assets`, `db push|types`, `build`, `submit`, `update`, `sync-ai`, `catalog`, `release-core`.

## 7. Skills design intégrés

À installer lors de la création du cœur (vérifier noms et sources actuels avec `find-skills` / `npx skills`, puis figer la version dans `core/_ai/skills/vendor/` avec leur licence) :
- `frontend-design` (Anthropic) : direction esthétique, éviter le rendu générique.
- Skills officiels Expo (dépôt `expo/skills` : UI native, data fetching, déploiement EAS, mise à jour SDK).
- Bonnes pratiques React Native (Callstack ou Vercel) : performance, listes, animations.
- `ui-ux-pro-max` ou équivalent populaire : palettes, typographies, patterns par type d'app.
- Skills Supabase (Postgres et RLS) + MCP Supabase.

Un skill d'interface `daroms-design-system` traduit leurs conseils vers `@daroms/ui` et les tokens (sinon ils poussent du CSS ou d'autres librairies). Chargement `name-only` par défaut (`skillOverrides`) pour ne pas payer leur description à chaque tour.

## 8. Emprunts aux concurrents (Rork, a0.dev, Bolt Expo, Natively)

- Aperçu immédiat : `daroms dev` affiche le QR Expo Go / dev client dès `/daroms-new`.
- Templates d'app (`template/variants/` : liste + détail, réseau social léger, tracker, chat IA, boutique) choisis par `/daroms-idea`.
- Boucle d'auto-correction sur erreurs (`/daroms-fix`).
- Génération icône, splash et captures store intégrée.
- Publication en une commande (EAS build + submit) avec checklist.
- Différence assumée : code propre, règles strictes, cœur versionné et réutilisable.

---

## 9. Ordre d'exécution pour Claude Opus

1. **Amorçage** : dépôt, workspace Bun, TypeScript strict, ESLint (règles §5 en lint quand possible), Prettier, dernier SDK Expo stable, Expo Router, Tamagui (version stable compatible SDK).
2. **`@daroms/theme`** : `createBrandTheme`, tokens, polices, animations ; tests snapshot pour 3 `brand.ts`.
3. **`@daroms/ui`** + `CATALOG.md` généré + kitchen-sink.
4. **`@daroms/data`, `@daroms/lib`, `@daroms/i18n`**.
5. **`template/`** + `app.manifest.ts` (schéma zod) + `app.config.ts` dérivé.
6. **Générateurs** + **CLI `daroms`**.
7. **Modules** : `auth` (email + Apple + Google), `onboarding`, `settings`, `payments` (RevenueCat), `push`, `analytics`, `ai-chat` ; registre généré.
8. **Couche IA** : `CLAUDE.core.md`, règles, digest, hooks, `settings.json`, routeur de contexte, `daroms-sync.py`.
9. **Skills et agents** §6, puis skills design §7.
10. **Docs** : tutoriel « ton app en un jour », fiches pratiques, référence CLI et règles, explication de la couche IA.
11. **App pilote** complète via `/daroms-day`, corrections du cœur, `CHANGELOG` v0.1.0.

## 10. Vérification

- `daroms new demo` produit une app qui démarre (`daroms dev`), passe `tsc`, lint, `daroms test` et `expo-doctor`.
- Changer `brand.ts` (3 marques) change tout le rendu, vérifié par `daroms shot` clair et sombre.
- Une édition avec couleur hex, `StyleSheet.create` ou appel Supabase dans un composant est bloquée par le hook avec un message clair.
- `python3 .claude/hooks/daroms-context.py test "écran profil"` renvoie la bonne zone.
- Flow Maestro principal vert sur simulateur iOS et émulateur Android.
- `eas build --profile preview` réussit, l'app s'installe par QR.
- App pilote de bout en bout en une journée ; `stats.jsonl` donne la référence de tokens par étape, à faire baisser à l'app suivante.
