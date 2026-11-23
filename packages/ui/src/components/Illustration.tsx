import { useEffect, useId, useMemo } from 'react'
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { SvgXml } from 'react-native-svg'
import { useTheme, useThemeName, YStack } from 'tamagui'

import { illustrationSvg, VIEWBOX, type IllustrationColors, type IllustrationName } from '../illustrations/scenes'
import type { StyleProps } from './style-props'

const SIZE = { sm: '48', md: '64', lg: '80' } as const

/** Couleurs d'illustration résolues depuis le thème courant (marque, accent, dégradé de la direction, mode sombre). */
export function useIllustrationColors(): IllustrationColors {
  const theme = useTheme() as unknown as Record<string, { val?: string } | undefined>
  const dark = useThemeName().startsWith('dark')
  const v = (key: string) => theme[key]?.val ?? 'transparent'
  return useMemo(
    () => ({
      b1: v(dark ? 'brand-900' : 'brand-100'),
      b2: v(dark ? 'brand-800' : 'brand-200'),
      b3: v('brand-300'),
      b4: v('brand-400'),
      b5: v('brand-500'),
      b6: v('brand-600'),
      b7: v('brand-700'),
      a2: v(dark ? 'accent-800' : 'accent-200'),
      a3: v('accent-300'),
      a4: v('accent-400'),
      a5: v('accent-500'),
      g1: v('gradient-1'),
      g2: v('gradient-2'),
      g3: v('gradient-3'),
      on: 'white',
      card: v('card'),
      line: v(dark ? 'surface-800' : 'surface-200'),
      shadow: dark ? 'black' : v('surface-950'),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, dark],
  )
}

/**
 * @catalog Illustration
 * @props name: welcome|growth|chat|secure|empty|success|calendar|focus|community|spark · size: sm|md|lg (défaut md) · animated (défaut true : entrée puis flottement lent, coupé si « réduire les animations ») · + props de style
 * @example <Illustration name="growth" size="lg" />
 */
export function Illustration({ name, size = 'md', animated = true, ...style }: StyleProps & { name: IllustrationName; size?: keyof typeof SIZE; animated?: boolean }) {
  const colors = useIllustrationColors()
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const xml = useMemo(() => illustrationSvg(name, colors, `${name}${id}`), [name, colors, id])
  const reduced = useReducedMotion()
  const move = animated && !reduced
  const enter = useSharedValue(move ? 0 : 1)
  const float = useSharedValue(0)

  useEffect(() => {
    if (!move) return
    enter.set(withSpring(1, { duration: 600, dampingRatio: 0.8 }))
    // flottement lent après l'entrée : 3,2 s par cycle, presque imperceptible mais vivant
    float.set(withDelay(600, withRepeat(withSequence(withTiming(-6, { duration: 1600, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) })), -1)))
  }, [move, enter, float])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: enter.get(),
    transform: [{ translateY: float.get() + (1 - enter.get()) * 16 }, { scale: 0.92 + enter.get() * 0.08 }],
  }))

  return (
    <YStack w="100%" maxW={SIZE[size]} self="center" aspectRatio={VIEWBOX.w / VIEWBOX.h} role="img" aria-hidden {...style}>
      <Animated.View style={[{ width: '100%', height: '100%' }, animatedStyle]}>
        <SvgXml xml={xml} width="100%" height="100%" />
      </Animated.View>
    </YStack>
  )
}

export { ILLUSTRATIONS, type IllustrationName } from '../illustrations/scenes'
