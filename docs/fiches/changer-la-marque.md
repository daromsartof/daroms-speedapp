# Changer la marque

1. Modifier les 5 valeurs de `brand.ts` : `primary`, `accent` (hex), `font` (`inter` | `system`), `radius` (`none` à `full`), `tone` (`playful` | `pro` | `minimal`).
   Palettes 11 nuances, thèmes clair/sombre, sous-thèmes (`brand`, `soft`, `accent`, `highlight`, `success`, `warning`, `danger`, `destructive`), rayons, espacements, graisses et ressorts sont recalculés.
2. Icône : `assets/source/icon.svg` (1024, fond inclus), facultatif `assets/source/foreground.svg` (Android), puis `bun daroms assets`.
3. Vérifier : `bun daroms shot /_dev/kitchen-sink --capture` et `--dark --capture`.

Avec Claude : `/daroms-brand`.
