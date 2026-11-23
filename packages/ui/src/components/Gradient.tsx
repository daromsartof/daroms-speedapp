import { getDirection } from '@daroms/theme'
import { useId } from 'react'
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg'
import { useTheme, YStack } from 'tamagui'

import type { StyleProps } from './style-props'

export type GradientKind = 'brand' | 'halo'

/** Couleurs d'un dégradé de la direction artistique, résolues pour le thème courant (clair ou sombre). */
export function useGradientColors(kind: GradientKind = 'brand'): string[] {
  const theme = useTheme() as unknown as Record<string, { val?: string } | undefined>
  const name = kind === 'brand' ? 'gradient' : 'halo'
  return [1, 2, 3].map((i) => theme[`${name}-${i}`]?.val ?? 'transparent')
}

/** Extrémités d'un dégradé linéaire selon l'angle (degrés, 0 = vers le haut, 90 = vers la droite). */
export function gradientVector(angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  const x = Math.cos(rad) / 2
  const y = Math.sin(rad) / 2
  const r = (v: number) => Math.round(v * 1000) / 1000
  return { x1: r(0.5 - x), y1: r(0.5 - y), x2: r(0.5 + x), y2: r(0.5 + y) }
}

/**
 * @catalog Gradient
 * @props kind: brand (dégradé de marque) | halo (fond clair à deux lueurs) · angle (défaut 135) · + props de style (rounded, opacity)
 * @example <Card position="relative" padded={false}><Gradient kind="halo" /><YStack p="stack">...</YStack></Card> (le parent porte position="relative")
 */
export function Gradient({ kind = 'brand', angle = 135, ...style }: StyleProps & { kind?: GradientKind; angle?: number }) {
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const colors = useGradientColors(kind)
  const v = gradientVector(angle)
  return (
    <YStack position="absolute" t="0" l="0" r="0" b="0" z={-1} overflow="hidden" pointerEvents="none" aria-hidden {...style}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          {kind === 'brand' ? (
            <LinearGradient id={id} x1={v.x1} y1={v.y1} x2={v.x2} y2={v.y2}>
              <Stop offset="0" stopColor={colors[0]} />
              <Stop offset="0.55" stopColor={colors[1]} />
              <Stop offset="1" stopColor={colors[2]} />
            </LinearGradient>
          ) : (
            <>
              <RadialGradient id={`${id}a`} cx="0.15" cy="0.1" r="0.75">
                <Stop offset="0" stopColor={colors[0]} stopOpacity="1" />
                <Stop offset="1" stopColor={colors[0]} stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id={`${id}b`} cx="0.95" cy="0.55" r="0.7">
                <Stop offset="0" stopColor={colors[1]} stopOpacity="0.9" />
                <Stop offset="1" stopColor={colors[1]} stopOpacity="0" />
              </RadialGradient>
            </>
          )}
        </Defs>
        {kind === 'brand' ? (
          <Rect width="100%" height="100%" fill={`url(#${id})`} />
        ) : (
          <>
            <Rect width="100%" height="100%" fill={colors[2]} />
            <Rect width="100%" height="100%" fill={`url(#${id}a)`} />
            <Rect width="100%" height="100%" fill={`url(#${id}b)`} />
          </>
        )}
      </Svg>
    </YStack>
  )
}

/** true si la direction artistique demande des dégradés francs (soft, vivid). */
export const richDirection = () => getDirection().gradient !== 'subtle'
