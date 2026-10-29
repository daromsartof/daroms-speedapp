---
title: Tokens et thèmes
description: Les tokens Tamagui v3 utilisables dans une app daroms - espaces, rayons, couleurs de thème, sous-thèmes, conditions, typographie, icônes et animations, avec la syntaxe v3.
---

Les styles d'une app daroms n'utilisent que des tokens, en **valeurs plates Tamagui v3 sans `$`**. Liste courte et à jour : la section Tokens du [catalogue](/reference/composants/).

## Espaces

| Token | Usage |
|---|---|
| `gutter` | marge horizontale d'écran |
| `section` | entre deux sections |
| `stack` | entre éléments empilés |
| `inline` | entre éléments en ligne |
| `tight` | entre un libellé et sa valeur |
| `0`..`96`, `0-5`, `1-5` | échelle 4 pt (`4` = 16 px), demi-pas |

Les valeurs sémantiques dépendent du ton ([Marque](/reference/marque/#ce-que-change-le-ton)).

```tsx
<YStack p="gutter" gap="stack">
  <XStack gap="inline" items="center" justify="space-between">...</XStack>
</YStack>
```

## Rayons

`button`, `input`, `card`, `sheet`, `chip`, `badge`, `avatar`, `pill` : `rounded="card"`.

## Couleurs

| Token | Rôle |
|---|---|
| `background`, `background-hover`, `background-press` | fond et états |
| `color` | texte |
| `color-1`..`color-11` | rampe du thème, `1` proche du fond, `11` proche du texte |
| `border-color`, `placeholder-color`, `separator`, `overlay`, `skeleton` | rôles |
| `card` | fond de carte |
| `brand-50`..`brand-950`, `accent-*`, `surface-*` | palettes absolues de la marque |
| `emerald-500`, `red-500`... | palettes Tailwind |

Une couleur hex ou `rgb()` est refusée par le hook et par ESLint. Préférer les clés de thème (`color-9`, `card`) aux palettes absolues : elles suivent le mode sombre.

## Sous-thèmes

```tsx
<YStack theme="soft" bg="background" p="4" rounded="card">
  <Body>{t('tips.today')}</Body>
</YStack>
```

`brand`, `soft`, `accent`, `highlight`, `success`, `warning`, `danger`, `destructive`, `level2`..`level4`, `inverse`. Détail : [Marque](/reference/marque/#thèmes-et-sous-thèmes).

## Conditions dans la valeur

Tamagui v3 met les états et les points de rupture dans la valeur :

```tsx
<Card bg="card press:background-press dark:surface-900" />
<YStack opacity="1 enter:0 exit:0" transition="medium" />
<YStack p="4 sm:6" scale="1 press:0.97" />
```

`hoverStyle`, `pressStyle`, `$4`, `$color10` sont la syntaxe v2 : elle n'existe plus. Voir [Tamagui v3](/explications/tamagui-v3/).

## Typographie

Composants `Title`, `Heading level={1|2|3}`, `Body`, `Caption` avec `tone` (`default`, `muted`, `brand`, `accent`, `danger`, `success`) et `align`. Tailles `size="1"`..`"10"` (11 à 40 px), graisse des titres réglée par le ton.

## Icônes

```tsx
import { Plus } from '@daroms/ui/icons'

<Plus size="5" color="color-9" />
```

102 icônes Lucide incluses (liste dans le [catalogue](/reference/composants/)). Autre icône : `bun daroms icons add NomLucide`.

## Animations

`transition="fast" | "medium" | "slow" | "bouncy"` ; Reanimated 4 pour le geste et le continu. Jamais l'API Animated de React Native en app.
