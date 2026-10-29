---
title: Marque (brand.ts)
description: Les 5 valeurs de brand.ts et ce que @daroms/theme en calcule - palettes OKLCH, neutres, thèmes clair et sombre, sous-thèmes, rayons, espacements, graisses et ressorts selon le ton.
---

`brand.ts` est la seule entrée du thème. `createBrandTheme(brand)` de `@daroms/theme` en dérive tous les tokens et thèmes Tamagui v3 ; changer d'identité = changer ces valeurs. L'éditeur de la [page d'accueil](/) utilise exactement ce calcul.

```ts
import { defineBrand } from '@daroms/theme/brand'

export default defineBrand({ primary: '#0F766E', accent: '#F59E0B', font: 'inter', radius: 'lg', tone: 'minimal' })
```

| Valeur | Type | Défaut | Effet |
|---|---|---|---|
| `primary` | hex `#RRGGBB` | requis | palette `brand-*`, sous-thèmes `brand` et `soft`, boutons, liens, éléments actifs, teinte des neutres |
| `accent` | hex `#RRGGBB` | requis | palette `accent-*`, sous-thèmes `accent` et `highlight` |
| `font` | `inter`, `system` | `inter` | Inter embarquée, ou San Francisco / Roboto |
| `radius` | `none`, `sm`, `md`, `lg`, `xl`, `full` | `lg` | rayon de base : 0, 4, 8, 12, 16 px ; `full` = boutons et champs en pilule |
| `tone` | `playful`, `pro`, `minimal` | `pro` | rayons, espacements, graisses, rebond des animations, teinte des neutres |

## Palettes

- **11 nuances** `50` à `950` par couleur, calculées en OKLCH sur une échelle de luminosité proche de Tailwind v4.
- **Ta couleur est gardée telle quelle** sur la nuance de luminosité la plus proche (souvent 500 ou 600) ; les voisines suivent son écart de luminosité, la chroma suit une courbe pleine au milieu et faible aux extrémités.
- **Neutres** (`surface-*`) : gris teintés par la teinte de `primary`, avec la chroma du ton (0 en `minimal`, gris pur).

## Thèmes et sous-thèmes

Thèmes `light` et `dark`, avec des sous-thèmes aux noms fixes (typés), utilisables partout avec `theme="..."` :

| Sous-thème | Palette | Rendu |
|---|---|---|
| `brand` | brand, plein | fond de la couleur principale |
| `soft` | brand, teinté | fond léger de la couleur principale |
| `accent` | accent, teinté | mise en avant discrète |
| `highlight` | accent, plein | mise en avant forte |
| `success`, `warning`, `danger` | émeraude, ambre, rouge, teintés | états |
| `destructive` | rouge, plein | action irréversible |
| `level2`..`level4`, `inverse` | surface | profondeur, inversion clair/sombre |

Les noms des sous-thèmes sont en minuscules d'un seul mot (une majuscule casse la résolution des niveaux relatifs de Tamagui v3).

## Ce que change le ton

| | `playful` | `pro` | `minimal` |
|---|---|---|---|
| Chroma des neutres | 0.018 | 0.01 | 0 |
| Multiplicateur de rayon | x 1.25 | x 1 | x 0.75 |
| Rebond des ressorts | 0.35 | 0.12 | 0 |
| Graisse des titres | 800 | 700 | 600 |
| Interlettrage des titres | -0.4 | -0.3 | -0.2 |
| `gutter` / `section` / `stack` | 20 / 28 / 14 | 16 / 24 / 12 | 24 / 32 / 16 |
| `inline` / `tight` | 10 / 6 | 8 / 4 | 8 / 4 |

## Rayons sémantiques

Rayon de base = rayon du preset x multiplicateur du ton.

| Token | Valeur |
|---|---|
| `button`, `input` | base (pilule si `radius: 'full'`) |
| `card` | base x 1.5 (24 si `full`) |
| `sheet` | base x 1.5 + 8 (28 si `full`) |
| `chip`, `badge` | pilule (0 si `radius: 'none'`) |
| `avatar`, `pill` | pilule |

## Animations

Durées partagées : `fast` 160 ms, `medium` 280 ms, `slow` 420 ms. Ressorts `fast`, `medium`, `slow`, `bouncy`, `lazy` réglés par le rebond du ton. Usage : `transition="fast"` sur un composant Tamagui.

## API

`defineBrand`, `BrandSchema`, `createBrandTheme`, `createBrandPalettes`, `createPalette`, `createNeutral`, `anchorShade`, `contrastRatio`, `semanticRadius`, `semanticSpace`, `springs`, `TONES`, `DURATIONS`, `Z_INDEX`. Voir [Paquets](/reference/paquets/#daromstheme).

Mode d'emploi : [Changer la marque](/guides/changer-la-marque/).
