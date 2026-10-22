import { haptic } from '@daroms/lib/haptics'
import { SizableText, XStack, YStack } from 'tamagui'

export type SegmentOption<V extends string> = { value: V; label: string }

export type SegmentedControlProps<V extends string> = {
  options: readonly SegmentOption<V>[]
  value: V
  onChange: (value: V) => void
}

/**
 * @catalog SegmentedControl
 * @props options [{ value, label }] · value · onChange (2 à 4 choix exclusifs)
 * @example <SegmentedControl options={periods} value={period} onChange={setPeriod} />
 */
export function SegmentedControl<V extends string>({ options, value, onChange }: SegmentedControlProps<V>) {
  return (
    <XStack bg="color-2" rounded="button" p="1" gap="1" role="tablist">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <YStack
            key={option.value}
            flex={1}
            items="center"
            py="2"
            rounded="button"
            bg={selected ? 'card' : 'transparent'}
            boxShadow={selected ? '0 1px 3px shadow-3' : undefined}
            transition="fast"
            role="tab"
            aria-selected={selected}
            onPress={() => {
              if (selected) return
              haptic('selection')
              onChange(option.value)
            }}
          >
            <SizableText size="3" fontWeight={selected ? '600' : '500'} color={selected ? 'color' : 'color-8'}>
              {option.label}
            </SizableText>
          </YStack>
        )
      })}
    </XStack>
  )
}
