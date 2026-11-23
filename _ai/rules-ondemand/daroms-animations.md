# Animations

> transition Tamagui pour les états simples ; Reanimated 4 pour le geste et le continu ; durées et courbes tirées des préréglages de la marque.

- Simple : `<YStack transition="medium" opacity="1 enter:0 exit:0" y="0 enter:10">` dans un `AnimatePresence` (exporté par tamagui).
- Pression : `scale="1 press:0.97" transition="fast"` (déjà sur Button et Card pressable).
- Reanimated : `useSharedValue`, `useAnimatedStyle`, `withSpring` ; lire et écrire avec `.get()` / `.set()` (compatible React Compiler).
- Listes : entrées `entering={FadeIn}` avec parcimonie ; jamais d'animation par item dans de longues listes.
- Respecter « réduire les animations » : `useReducedMotion()` de Reanimated ; la version réduite garde le changement d'état (fondu court ou rien), jamais un déplacement.
- Durées et ressorts : presets de marque `fast`, `medium`, `slow`, `bouncy` (réglés par le ton) ; dans Reanimated, `DURATIONS` et `springs(brand)` de `@daroms/theme`, jamais un nombre en dur.
- Construction (fil d'exécution, propriétés, geste, haptique) : skill `expo-animation`.

## Valeurs publiées par Material 3

Jetons `md.sys.motion` de material-web (v0.192), en ms :

| Famille | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| short | 50 | 100 | 150 | 200 |
| medium | 250 | 300 | 350 | 400 |
| long | 450 | 500 | 550 | 600 |
| extra-long | 700 | 800 | 900 | 1000 |

Courbes (`Easing.bezier` de Reanimated) :

| Courbe | Valeurs |
|---|---|
| emphasized, standard | 0.2, 0, 0, 1 |
| emphasized-decelerate | 0.05, 0.7, 0.1, 1 |
| emphasized-accelerate | 0.3, 0, 0.8, 0.15 |
| standard-decelerate | 0, 0, 0, 1 |
| standard-accelerate | 0.3, 0, 1, 1 |

## Correspondance avec les préréglages (choix du framework)

Ce tableau est la règle daroms, pas une consigne de Material 3 : il range les jetons M3 sous les préréglages de la marque.

| Préréglage | ms | Zone M3 | Usage |
|---|---|---|---|
| `fast` | 160 | short3 à short4 | appui, sélection, bascule, case cochée |
| `medium` | 280 | medium1 à medium2 | entrée d'un élément, feuille, carte qui s'ouvre |
| `slow` | 420 | medium4 à long1 | transition d'écran, changement de mise en page |
| `bouncy` | 420, ressort | - | réussite, célébration (ton playful) |

- Entrer : courbe décélérée (`emphasized-decelerate`) ; sortir : courbe accélérée (`emphasized-accelerate`), sortie environ un tiers plus courte que l'entrée.
- Ce que le doigt touche (glisser, feuille, carte) : ressort `springs(brand)`, qui suit le ton (`bounce` 0 en minimal, 0.12 en pro, 0.35 en playful).
- Exemple Reanimated : `withTiming(1, { duration: DURATIONS.medium, easing: Easing.bezier(0.05, 0.7, 0.1, 1) })`.

## Traduire une référence mesurée

`bun daroms inspire --frames <vidéo ou gif>` donne départ, arrêt et durée de chaque phase, et le préréglage le plus proche.

- Durée de phase vers le préréglage le plus proche ; ne jamais recopier la durée exacte de la référence.
- La mesure ignore la traîne de décélération (mouvement sous 8 % du pic) : une courbe décélérée mesurée à 300 ms vaut souvent 350 à 400 ms nominaux ; en cas d'hésitation, prendre le préréglage du dessus. Précision : une image (33 ms à 30 i/s).
- Plusieurs phases : une phase courte qui revient en arrière est un rebond (ressort du ton ou `bouncy`) ; des éléments qui partent l'un après l'autre sont un décalage (30 à 50 ms entre éléments, total sous `slow`) ; sinon un enchaînement de préréglages.
- Si la référence dépasse `slow` pour un geste courant, raccourcir : l'interface ne fait jamais attendre.
