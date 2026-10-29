import { Body, Caption, YStack } from '@daroms/ui'
import { MapPin } from '@daroms/ui/icons'

import { useMapsT } from './i18n'
import type { MapProps } from './types'

/** Web (aperçu, captures) : react-native-maps n'existe pas, zone de repli stable. */
export function Map({ label, markers = [], ratio = 1, flex }: MapProps) {
  const t = useMapsT()
  return (
    <YStack flex={flex} aspectRatio={flex ? undefined : ratio} rounded="card" bg="color-2" items="center" justify="center" gap="tight" p="section" role="img" aria-label={label}>
      <MapPin size="8" color="color-8" />
      <Body tone="muted" align="center">
        {t('webTitle')}
      </Body>
      {markers.length ? <Caption>{t('places', { count: markers.length })}</Caption> : null}
    </YStack>
  )
}
