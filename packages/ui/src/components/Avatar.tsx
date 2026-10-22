import { initials } from '@daroms/lib/format'
import { Image as ExpoImage } from 'expo-image'
import { SizableText, YStack } from 'tamagui'

const SIZES = { sm: { box: '8', text: '1' }, md: { box: '10', text: '3' }, lg: { box: '14', text: '5' }, xl: { box: '20', text: '7' } } as const

export type AvatarProps = { name: string; uri?: string | null; size?: keyof typeof SIZES }

/**
 * @catalog Avatar
 * @props name (initiales de repli, a11y) · uri · size: sm|md|lg|xl
 * @example <Avatar name={profile.display_name} uri={profile.avatar_url} size="lg" />
 */
export function Avatar({ name, uri, size = 'md' }: AvatarProps) {
  const { box, text } = SIZES[size]
  return (
    <YStack w={box} h={box} rounded="avatar" overflow="hidden" theme="accent" bg="background" items="center" justify="center" aria-label={name} role="img">
      {uri ? (
        <ExpoImage source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={150} />
      ) : (
        <SizableText size={text} fontWeight="700" color="color">
          {initials(name)}
        </SizableText>
      )}
    </YStack>
  )
}
