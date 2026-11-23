import { Children, type ReactNode } from 'react'
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated'

import { DURATIONS } from '@daroms/theme'

/**
 * @catalog Reveal
 * @props children (chaque enfant entre l'un après l'autre) · delay (ms avant le premier, défaut 0) · step (ms entre deux, défaut 70)
 * @example <Reveal><Title>{t('home.title')}</Title><Body>{t('home.subtitle')}</Body><Button>{t('home.start')}</Button></Reveal>
 */
export function Reveal({ children, delay = 0, step = 70 }: { children: ReactNode; delay?: number; step?: number }) {
  const reduced = useReducedMotion()
  if (reduced) return <>{children}</>
  return (
    <>
      {Children.toArray(children).map((child, i) => (
        <Animated.View key={i} entering={FadeInDown.duration(DURATIONS.medium).delay(delay + i * step).springify().damping(18)}>
          {child}
        </Animated.View>
      ))}
    </>
  )
}
