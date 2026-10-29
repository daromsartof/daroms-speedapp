---
title: Changer la marque
description: Changer l'identité visuelle d'une app en modifiant les 5 valeurs de brand.ts, puis régénérer icône, splash et favicon.
---

## 1. Les 5 valeurs

```ts
// brand.ts
import { defineBrand } from '@daroms/theme/brand'

export default defineBrand({
  primary: '#0F766E', // boutons, liens, éléments actifs
  accent: '#F59E0B',  // mises en avant, badges
  font: 'inter',      // 'inter' (embarquée) | 'system'
  radius: 'lg',       // 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  tone: 'minimal',    // 'playful' | 'pro' | 'minimal'
})
```

Palettes 11 nuances, thèmes clair et sombre, sous-thèmes (`brand`, `soft`, `accent`, `highlight`, `success`, `warning`, `danger`, `destructive`), rayons, espacements, graisses et ressorts sont recalculés. Le détail du calcul : [Marque](/reference/marque/). Essayer sans app : l'éditeur de la [page d'accueil](/).

## 2. L'icône

1. Dessiner `assets/source/icon.svg` (1024 x 1024, fond inclus) ; facultatif : `assets/source/foreground.svg` pour l'icône adaptative Android.
2. Générer :
   ```bash
   bun daroms assets   # icon.png, adaptive-icon.png, splash-icon.png, favicon.png
   ```

## 3. Vérifier

```bash
bun daroms shot /_dev/kitchen-sink --capture
bun daroms shot /_dev/kitchen-sink --dark --capture
```

L'écran `/_dev/kitchen-sink` (absent en production) montre tous les composants avec le thème courant.

:::caution[Contraste]
Une couleur principale très claire (jaune, vert d'eau) donne des boutons peu lisibles. Préférer une nuance moyenne ou foncée pour `primary`, et garder les couleurs claires pour `accent`.
:::

## Avec Claude

`/daroms-brand` propose palette et ton depuis `app.spec.md`, dessine l'icône en SVG, lance `daroms assets` et vérifie le kitchen-sink.
