---
paths:
  - "src/**/*.tsx"
---
# Performance

> FlashList pour toute liste, expo-image, items mémoïsés, animations Reanimated ou transition Tamagui.

- Liste : `List` (FlashList v2) ; `renderItem` stable (`useCallback`) ; item extrait et `memo`. Jamais `map` sur plus de ~20 éléments dans un ScrollView.
- Images : `Image` de `@daroms/ui` (cache, placeholder blurhash, `ratio`).
- Animations : prop `transition` + valeurs `enter:`/`exit:` ; cas avancés Reanimated (voir rules-ondemand/daroms-animations.md).
- React Compiler actif : pas de `useMemo`/`useCallback` défensifs partout, seulement pour les props de listes.
