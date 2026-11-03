---
name: daroms-ecc
description: Traduit les skills ECC figés (ecc-tdd-workflow, ecc-security-review, ecc-accessibility, ecc-typescript-patterns) vers les commandes et règles daroms - Bun, jest-expo, Maestro, Supabase RLS, @daroms/ui. Aucun script ECC.
---

# daroms-ecc : interface entre la méthode ECC et le framework

Les skills `ecc-*` viennent d'ECC (Everything Claude Code, https://ecc.tools), figés dans le cœur.
Garder leur méthode (ordre des étapes, listes de contrôle) ; l'outillage et le code restent ceux des règles daroms.
Ne lancer aucun script ECC (`setup-package-manager.js`, `CLAUDE_PLUGIN_ROOT`) : ils n'existent pas dans une app.

| Skill | Quand |
|---|---|
| `ecc-tdd-workflow` | logique nouvelle ou bug : `src/lib/`, `features/x/hooks.ts`, `schema.ts` |
| `ecc-security-review` | auth, paiements, entrées utilisateur, secrets, migrations RLS, edge functions |
| `ecc-accessibility` | écran neuf, `/daroms-polish` |
| `ecc-typescript-patterns` | types complexes, unions discriminées, relecture |

| Conseil ECC | Traduction daroms |
|---|---|
| Détecter le gestionnaire et le lanceur de tests | Bun + jest-expo, toujours |
| `npm test`, `npx jest`, `vitest`, `bun test`, mode watch | `bun daroms test [motif]` |
| Couverture 80 % | `bunx jest --coverage [motif]` ; viser `src/lib/` et les hooks, l'écran garde son test généré |
| E2E Playwright ou Cypress | flow Maestro `e2e/<flow>.yaml`, `bun daroms e2e` (`--go` dans Expo Go) |
| `render` de `@testing-library/react`, `toBeInTheDocument` | `renderApp(<XScreen />, { config, locales: { fr } })` de `@daroms/app/testing`, `await` sur render et `fireEvent` |
| Mock Supabase, Redis, OpenAI | `jest.mock('./api', ...)` avec une variable préfixée `mock` ; jamais de réseau |
| Commit à chaque étape RED, GREEN, refactor | un commit par fonctionnalité avec `/daroms-commit`, RED puis GREEN résumés dans le message |
| Rapport de preuve (`.claude/tdd/`, `docs/releases/`) | pas de fichier : le message de commit suffit |
| Build, lint, typecheck | `bun daroms doctor --quick` ; avant de rendre `/daroms-check` |
| Secrets, `process.env`, clés d'API | `.env` jamais lu (hook) ; côté app seulement la clé publique Supabase ; jamais `service_role` |
| Requêtes paramétrées, injection SQL | `db()` de `@daroms/data` dans `features/x/api.ts` ; structure par migration (`bun daroms db new`) |
| Autorisation, contrôle d'accès | RLS sur chaque table (`bun daroms g table` écrit les 4 politiques) ; relire toute politique modifiée |
| Validation des entrées | schéma zod dans `schema.ts`, `parseOrThrow` ; messages = clés i18n |
| XSS, CSP, CSRF, cookies, en-têtes HTTP, rate limiting, cloud | sans objet dans l'app native ; seulement pour une edge function (`.claude/rules-ondemand/daroms-supabase-advanced.md`) |
| `aria-label`, `accessibilityLabel`, `contentDescription` | `aria-label` ; déjà posé par le catalogue (`IconButton label` requis, `ListItem`, `Chip`, `BarChart label`) |
| Rôle, traits | composant du catalogue d'abord ; `role` seulement sur une primitive Tamagui pressable hors catalogue |
| Contraste 4,5:1 | palettes de `brand.ts` (texte `color-11` sur fond) ; vérifier clair et sombre avec `bun daroms shot --dark` |
| Cible 44 pt | `IconButton` : `md` = 40 pt, `lg` = 48 pt ; `lg` pour une action isolée |
| Erreurs de formulaire en texte | `FormField` affiche le message zod traduit |
| Couleur seule pour signaler un état | ajouter une icône ou un libellé (`tone` + texte) |
| Focus clavier, Escape, zoom 400 % | web seulement ; sur mobile, tester VoiceOver ou TalkBack et le texte agrandi |
| `any`, `unknown` + rétrécissement, types de base | `any` interdit ; types de base générés (`bun daroms db types` vers `src/types/db.ts`), jamais écrits à la main |
| Nouvelle dépendance, frontières de modules | pas de dépendance sans nécessité ; fonctionnalité optionnelle = module du cœur |
