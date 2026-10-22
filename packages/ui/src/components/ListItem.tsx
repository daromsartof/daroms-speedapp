import { haptic } from '@daroms/lib/haptics'
import type { ReactNode } from 'react'
import { XStack, YStack } from 'tamagui'

import { ChevronRight, type IconComponent } from '../icons'
import { Body, Caption } from './Text'

export type ListItemProps = {
  title: string
  subtitle?: string
  icon?: IconComponent
  /** Élément à gauche à la place de l'icône (Avatar, Image). */
  leading?: ReactNode
  /** Valeur affichée à droite. */
  value?: string
  /** Élément libre à droite (Switch, Badge). */
  trailing?: ReactNode
  chevron?: boolean
  destructive?: boolean
  onPress?: () => void
}

/**
 * @catalog ListItem
 * @props title · subtitle · icon · leading · value · trailing · chevron · destructive · onPress
 * @example <ListItem title={item.title} subtitle={formatRelative(item.created_at)} chevron onPress={open} />
 */
export function ListItem({ title, subtitle, icon: Icon, leading, value, trailing, chevron, destructive, onPress }: ListItemProps) {
  const color = destructive ? 'red-600 dark:red-400' : 'color'
  return (
    <XStack
      items="center"
      gap="inline"
      px="stack"
      py="stack"
      minH="14"
      bg={onPress ? 'transparent press:background-press' : 'transparent'}
      role={onPress ? 'button' : undefined}
      aria-label={subtitle ? `${title}, ${subtitle}` : title}
      onPress={
        onPress
          ? () => {
              haptic('selection')
              onPress()
            }
          : undefined
      }
    >
      {leading ?? (Icon ? <Icon size="6" color={destructive ? 'red-500' : 'color-9'} /> : null)}
      <YStack flex={1} gap="0-5">
        <Body color={color} numberOfLines={1}>
          {title}
        </Body>
        {subtitle ? <Caption numberOfLines={2}>{subtitle}</Caption> : null}
      </YStack>
      {value ? <Body tone="muted">{value}</Body> : null}
      {trailing}
      {chevron ? <ChevronRight size="5" color="color-7" /> : null}
    </XStack>
  )
}
