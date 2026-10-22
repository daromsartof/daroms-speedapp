import { styled, YStack } from 'tamagui'

/**
 * @catalog Card
 * @props pressable (retour visuel) · flat (sans bordure) · padded (défaut true) · + props YStack
 * @example <Card pressable onPress={() => open(item.id)}><Body>{item.title}</Body></Card>
 */
export const Card = styled(YStack, {
  name: 'Card',
  bg: 'card',
  borderWidth: 1,
  borderColor: 'separator',
  rounded: 'card',
  gap: 'inline',
  overflow: 'hidden',
  variants: {
    padded: { true: { p: 'stack' }, false: { p: '0' } },
    flat: { true: { borderWidth: 0 } },
    pressable: {
      true: { cursor: 'web:pointer', scale: '1 press:0.98', opacity: '1 press:0.9', transition: 'fast' },
    },
  } as const,
  defaultVariants: { padded: true },
})
