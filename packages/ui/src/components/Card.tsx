import { getDirection } from '@daroms/theme'
import { styled, YStack, type GetProps } from 'tamagui'

const CardFrame = styled(YStack, {
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
    // relief de la direction artistique : 0 aplat bordé, 1 ombre douce, 2 ombre marquée
    elevation: {
      0: {},
      1: { borderWidth: 0, boxShadow: '0 6px 20px shadow-2, 0 1px 3px shadow-1' },
      2: { borderWidth: 0, boxShadow: '0 14px 36px shadow-3, 0 2px 6px shadow-2' },
    },
  } as const,
  defaultVariants: { padded: true },
})

export type CardProps = GetProps<typeof CardFrame>

/**
 * @catalog Card
 * @props pressable (retour visuel) · flat (sans bordure ni ombre) · padded (défaut true) · elevation: 0|1|2 (défaut : relief de la direction) · + props YStack
 * @example <Card pressable onPress={() => open(item.id)}><Body>{item.title}</Body></Card>
 */
export function Card({ elevation, flat, ...props }: CardProps) {
  return <CardFrame flat={flat} elevation={flat ? 0 : (elevation ?? getDirection().elevation)} {...props} />
}
