---
title: "Tamagui v3 dans daroms"
description: "Les différences de Tamagui v3 que les modèles connaissent mal : valeurs plates sans $, conditions dans la valeur, clés en kebab-case, sous-thèmes, contrôles nommés, icônes, ordre des providers."
---

Tamagui v3 (config v6) diffère de v2 sur des points que les modèles connaissent mal ; le noyau IA les rappelle.

- **Valeurs plates sans `$`** : `p="4"`, `bg="background"`, `color="color-11"`. Les conditions vivent dans la valeur : `bg="card press:background-press"`, `opacity="1 enter:0 exit:0"`, `p="4 sm:6"`. `hoverStyle`, `pressStyle`, `$4` n'existent plus.
- **Clés de thème en kebab-case** : `border-color`, `background-press`, `placeholder-color`, rampe `color-1`..`color-11`.
- **Sous-thèmes en minuscules d'un seul mot** (les segments en majuscules cassent la résolution des niveaux relatifs) : `brand`, `soft`, `accent`, `highlight`, `success`, `warning`, `danger`, `destructive`.
- **Contrôles nommés** : `size="xs|sm|md|lg|xl"` ; nos `Button` exposent `sm|md|lg` (36, 40, 48 px).
- **Animations** : prop `transition="fast|medium|slow|bouncy"` ; driver Reanimated en app, React Native Animated sous Jest.
- **Icônes** : plus de paquet Lucide complet ; génération des seules icônes utilisées (`tamagui icons add`), thémées via `@tamagui/helpers-icon`.
- **Ordre des providers** : `SafeAreaProvider` au-dessus de `TamaguiProvider`.
- **Typage** : `allowedStyleValues: 'somewhat-strict'` ; le type de config étant identique pour toutes les marques, `@daroms/theme` déclare `TamaguiCustomConfig` une fois pour le cœur et les apps.
