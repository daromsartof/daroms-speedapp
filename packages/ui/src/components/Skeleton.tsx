import { useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import { XStack, YStack, type YStackProps } from 'tamagui'

export type SkeletonProps = Pick<YStackProps, 'w' | 'h' | 'rounded' | 'flex'>

/**
 * @catalog Skeleton
 * @props w · h (tokens) · rounded. SkeletonList : rows, avatar
 * @example <Skeleton w="66%" h="5" /> · <SkeletonList rows={5} avatar />
 */
export function Skeleton({ w = '100%', h = '4', rounded = 'md', flex }: SkeletonProps) {
  const opacity = useSharedValue(0.55)
  useEffect(() => {
    opacity.set(withRepeat(withTiming(1, { duration: 750 }), -1, true))
  }, [opacity])
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }))
  return (
    <Animated.View style={[style, flex ? { flex: 1 } : null]} aria-hidden>
      <YStack w={w} h={h} rounded={rounded} bg="skeleton" />
    </Animated.View>
  )
}

export function SkeletonList({ rows = 6, avatar = false }: { rows?: number; avatar?: boolean }) {
  return (
    <YStack gap="stack" p="gutter" aria-busy role="progressbar">
      {Array.from({ length: rows }, (_, i) => (
        <XStack key={i} gap="inline" items="center">
          {avatar ? <Skeleton w="10" h="10" rounded="pill" /> : null}
          <YStack flex={1} gap="tight">
            <Skeleton w="66%" h="4" />
            <Skeleton w="33%" h="3" />
          </YStack>
        </XStack>
      ))}
    </YStack>
  )
}
