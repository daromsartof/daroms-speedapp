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

Une app neuve part de son initiale sur l'aplat de `primary`. Pour une vraie icône, `daroms logo` construit des **directions** décrites dans `assets/source/logo.json` : des formes simples posées sur une grille de 48, combinées dans l'ordre. Une recette se place et se vérifie ; une courbe dessinée à main levée, non.

```json
{ "directions": [
  { "name": "coche-creusee", "idea": "Une coche creusée dans un disque : la tâche faite.", "kind": "negative",
    "background": "light", "ink": "primary",
    "mark": [ { "shape": "circle", "cx": 24, "cy": 24, "r": 20 },
              { "op": "cut", "shape": "polygon", "points": [[13,24],[17,20],[22,25],[32,15],[36,19],[22,33]] } ] }
] }
```

| Champ | Valeurs |
|---|---|
| `kind` | `monogram`, `negative`, `stencil`, `symbol`, `wordmark`, `construction` |
| `background`, `ink` | `primary`, `accent`, `light`, `dark`, `white` : couleurs de `brand.ts` et ses neutres, contraste 3:1 au moins |
| formes | `rect` (x y w h r), `circle` (cx cy r), `ring` (cx cy r width), `arc` (cx cy r width start end), `polygon` (points), `glyph` (1 ou 2 caractères, Inter) |
| par forme | `op` (`add`, `cut`, `keep`, `xor`), `rotate`, `pivot`, `mirror` (`x`, `y`), `repeat` (`count` avec `rotate` ou `step`) |

```bash
bun daroms logo                        # construit, vérifie, planche dans .daroms/logo/sheet.png
bun daroms logo --use coche-creusee    # installe la direction puis lance daroms assets
```

Chaque direction est vérifiée sur le rendu réel :

| Vérification | Seuil |
|---|---|
| trait à 48 px (écran d'accueil) | 2 px au moins |
| contreformes à 48 px | les mêmes qu'en grand (un jour qui se ferme ou un trou qui apparaît échoue) |
| contreformes à 16 px | indicatif (favicon) |
| présence | l'encre couvre 5 % de l'icône au moins |
| zone sûre Android | symbole dans le cercle de 66 dp sur 108 |
| directions trop proches | moins de 80 % de recouvrement entre deux silhouettes |

La planche montre chaque direction à 220, 120, 60, 48 et 16 px, sur un écran d'accueil clair et sombre, et en icône thématique Android. `--use` écrit `icon.svg`, `foreground.svg`, `background.svg` et `monochrome.svg` dans `assets/source/`, puis `daroms assets` génère aussi `adaptive-background.png` et `monochrome-icon.png` (icônes thématiques d'Android 13 et plus) ; la config Expo les déclare dès qu'ils existent.

Toujours possible à la main : écrire `assets/source/icon.svg` (1024 x 1024, fond inclus), facultatif `foreground.svg`, `background.svg`, `monochrome.svg`, puis `bun daroms assets`.

Méthode inspirée de [make-logo](https://github.com/arla6ka/design.how) (design.how, MIT), sans calque ni logo de marque en entrée. Aucune vérification ne vaut recherche d'antériorité : la faire avant de déposer la marque.

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

`/daroms-brand` propose palette et ton depuis `app.spec.md` (et la direction retenue par `/daroms-inspire` si elle existe), écrit six directions d'icône, les fait vérifier et noter par `daroms-designer`, vous fait choisir parmi les trois meilleures, installe la choisie et vérifie le kitchen-sink.
