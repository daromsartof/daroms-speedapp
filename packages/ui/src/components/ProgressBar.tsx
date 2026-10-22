import { useDaromsT } from '@daroms/i18n'
import { YStack } from 'tamagui'

const FILL = {
  brand: { theme: 'brand', bg: 'background' },
  accent: { theme: 'highlight', bg: 'background' },
  success: { theme: undefined, bg: 'emerald-500' },
} as const

/**
 * @catalog ProgressBar
 * @props value (0 à 1) · tone: brand|accent|success
 * @example <ProgressBar value={done / total} tone="success" />
 */
export function ProgressBar({ value, tone = 'brand' }: { value: number; tone?: keyof typeof FILL }) {
  const t = useDaromsT()
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100)
  const fill = FILL[tone]
  return (
    <YStack
      h="2"
      rounded="pill"
      bg="color-3"
      overflow="hidden"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={t('a11y.progress', { value: percent })}
    >
      <YStack theme={fill.theme} h="100%" w={`${percent}%`} bg={fill.bg} rounded="pill" transition="medium" />
    </YStack>
  )
}
