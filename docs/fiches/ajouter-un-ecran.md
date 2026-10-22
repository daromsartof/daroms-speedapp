# Ajouter un écran

1. `bun daroms g screen <nom> [--tab --icon NomLucide] --title "Titre" --title-en "Title"`
   crée `app/<route>.tsx` (route mince), `src/features/<nom>/` (`<Nom>Screen.tsx`, `hooks.ts`, `api.ts`, `schema.ts`, test), les clés i18n FR/EN, et met à jour le manifest (écran, onglet).
2. Si l'écran affiche une table, créer la table d'abord (`bun daroms g table <nom> ...`) : l'écran se branche sur `use<Nom>()`.
3. Remplir l'écran avec les composants du [catalogue](../../packages/ui/CATALOG.md) ; garder les 4 états (`QueryView` ou `List`).
4. Vérifier : `bun daroms shot /<route>` puis `--dark`, et `bun daroms test <nom>`.

Avec Claude : `/daroms-screen <nom> --tab --icon Star`.
