import { haptic } from '@daroms/lib/haptics'
import { SizableText, XStack } from 'tamagui'

import type { IconComponent } from '../icons'

export type ChipProps = { label: string; selected?: boolean; icon?: IconComponent; onPress?: () => void }

/**
 * @catalog Chip
 * @props label · selected · icon · onPress (filtres, tags)
 * @example <Chip label={t('filters.today')} selected={filter === 'today'} onPress={() => setFilter('today')} />
 */
export function Chip({ label, selected = false, icon: Icon, onPress }: ChipProps) {
  return (
    <XStack
      theme={selected ? 'brand' : undefined}
      bg="background press:background-press"
      borderWidth={1}
      borderColor="border-color"
      rounded="chip"
      px="3"
      py="1-5"
      gap="1-5"
      items="center"
      role="button"
      aria-selected={selected}
      aria-label={label}
      onPress={() => {
        haptic('selection')
        onPress?.()
      }}
    >
      {Icon ? <Icon size="3" color="color" /> : null}
      <SizableText size="3" fontWeight="500" color="color">
        {label}
      </SizableText>
    </XStack>
  )
}
