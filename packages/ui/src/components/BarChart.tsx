import { XStack, YStack } from 'tamagui'

import { Caption } from './Text'

export type BarDatum = { key: string; label: string; value: number }

const FILL = {
  brand: { theme: 'brand', bg: 'background' },
  accent: { theme: 'highlight', bg: 'background' },
  success: { theme: undefined, bg: 'emerald-500' },
} as const

/**
 * @catalog BarChart
 * @props data[{ key, label, value }] · label (a11y, requis) · max (défaut : plus grande valeur) · tone: brand|accent|success · height (token, défaut 40) · highlight (key mise en avant)
 * @example <BarChart data={lastDays(entries, (e) => e.date).map((d) => ({ key: d.day, label: formatWeekday(d.day, 'narrow'), value: d.value }))} label={t('stats.week')} />
 */
export function BarChart({
  data,
  label,
  max,
  tone = 'brand',
  height = '40',
  highlight,
}: {
  data: BarDatum[]
  label: string
  max?: number
  tone?: keyof typeof FILL
  height?: '24' | '32' | '40' | '48' | '64'
  highlight?: string
}) {
  const top = Math.max(1, max ?? 0, ...data.map((d) => d.value))
  const fill = FILL[tone]
  return (
    <XStack h={height} items="flex-end" gap="tight" role="img" aria-label={`${label} : ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`}>
      {data.map((d) => {
        const active = d.value > 0
        return (
          <YStack key={d.key} flex={1} h="100%" justify="flex-end" items="center" gap="1">
            <YStack
              w="100%"
              h={`${Math.max(4, Math.round((Math.min(d.value, top) / top) * 100))}%`}
              theme={active ? fill.theme : undefined}
              bg={active ? fill.bg : 'color-3'}
              opacity={highlight && highlight !== d.key ? 0.5 : 1}
              rounded="chip"
              transition="medium"
            />
            <Caption weight={highlight === d.key ? 'bold' : 'regular'}>{d.label}</Caption>
          </YStack>
        )
      })}
    </XStack>
  )
}
