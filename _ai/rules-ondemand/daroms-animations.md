# Animations

> transition Tamagui pour les états simples ; Reanimated 4 pour le geste et le continu.

- Simple : `<YStack transition="medium" opacity="1 enter:0 exit:0" y="0 enter:10">` dans un `AnimatePresence` (exporté par tamagui).
- Pression : `scale="1 press:0.97" transition="fast"` (déjà sur Button et Card pressable).
- Reanimated : `useSharedValue`, `useAnimatedStyle`, `withSpring` ; lire et écrire avec `.get()` / `.set()` (compatible React Compiler).
- Listes : entrées `entering={FadeIn}` avec parcimonie ; jamais d'animation par item dans de longues listes.
- Respecter « réduire les animations » : `useReducedMotion()` de Reanimated.
- Durées et ressorts : presets de marque `fast`, `medium`, `slow`, `bouncy` (réglés par le ton).
