---
name: daroms-brand
description: Identité visuelle - choisit palette et ton dans brand.ts, dessine l'icône (SVG) puis génère icône, adaptive icon, splash et favicon avec daroms assets.
---

# /daroms-brand : marque et icônes

1. Lire `app.spec.md` (ton, cible) et `brand.ts`.
2. Choisir les 5 valeurs : `primary` (couleur forte, contraste AA avec le blanc), `accent` (complémentaire), `font` (`inter` | `system`), `radius` (`sm` sobre, `lg` standard, `full` ludique), `tone` (`playful` | `pro` | `minimal`). Écrire `brand.ts` seulement.
3. Icône : écrire `assets/source/icon.svg` (1024 x 1024, fond plein ou dégradé des couleurs de marque, un symbole simple et lisible à 48 px, pas de texte long, marges de 15 %). Optionnel : `assets/source/foreground.svg` (symbole seul, fond transparent) pour Android.
4. `bun daroms assets` puis regarder `assets/icon.png` (Read).
5. Vérifier le rendu : `bun daroms shot /_dev/kitchen-sink --capture` puis `--dark --capture`.
6. **Stop** : montrer les deux captures et la ligne `brand.ts`.
