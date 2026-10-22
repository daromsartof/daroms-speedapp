---
name: daroms-screen
description: Crée ou complète un écran - daroms g screen puis remplissage avec @daroms/ui selon le wireframe de app.spec.md, 4 états, clés i18n FR/EN, test, contrôle visuel.
argument-hint: "<nom-ecran> [--tab --icon Nom]"
---

# /daroms-screen : un écran

Écran : $ARGUMENTS

1. Lire le wireframe de l'écran dans `app.spec.md` et `core/packages/ui/CATALOG.md` (pas d'autres fichiers du cœur).
2. Générer si absent : `bun daroms g screen <nom> [--tab --icon Nom] --title "Titre FR" --title-en "Title"` (route, feature, i18n, test, manifest). Si une table existe pour l'écran, la générer d'abord (`/daroms-data`) : l'écran se branche sur son `api.ts`.
3. Remplir `src/features/<nom>/` :
   - `<Nom>Screen.tsx` : composition @daroms/ui ; 4 états via `QueryView` ou `List` ; textes `t('...')`.
   - `hooks.ts` : logique d'écran (`use<Nom>Screen`) ; `components/` pour les items (mémoïsés) ; formulaires `FormField` + zod.
   - Clés i18n FR et EN ajoutées ensemble.
4. Vérifier : `bun daroms shot /<route>` puis `--dark` ; corriger erreurs et débordements ; `--capture` seulement pour juger le visuel.
5. `bun daroms test <nom>` ; adapter le test généré si l'écran a changé.
6. **Stop** : 2 lignes de résumé + chemin de la capture si prise.
