import { useAppColorScheme } from '@daroms/app'
import { YStack } from '@daroms/ui'
import { useEffect, useRef } from 'react'
import NativeMap, { Marker } from 'react-native-maps'

import { mapsDefaults } from './defaults'
import { regionFor } from './geo'
import type { MapProps } from './types'

/** Carte native (Apple Plans sur iOS, Google Maps sur Android) ; repli sans carte sur le web (Map.web.tsx). */
export function Map({ label, markers = [], center, span, onMarkerPress, showsUserLocation, ratio = 1, flex }: MapProps) {
  const scheme = useAppColorScheme()
  const defaults = mapsDefaults()
  const region = center ? regionFor([center], center, span ?? defaults.span) : regionFor(markers, defaults.center, span ?? defaults.span)
  const ref = useRef<NativeMap>(null)
  // recadre quand la zone utile change (données chargées, filtre), pas à chaque rendu
  const fit = [region.latitude, region.longitude, region.latitudeDelta, region.longitudeDelta].map((n) => n.toFixed(5)).join(',')
  useEffect(() => {
    const [latitude = 0, longitude = 0, latitudeDelta = 0, longitudeDelta = 0] = fit.split(',').map(Number)
    ref.current?.animateToRegion({ latitude, longitude, latitudeDelta, longitudeDelta }, 300)
  }, [fit])

  return (
    <YStack flex={flex} aspectRatio={flex ? undefined : ratio} rounded="card" overflow="hidden" bg="skeleton">
      <NativeMap
        ref={ref}
        style={{ flex: 1 }}
        initialRegion={region}
        showsUserLocation={showsUserLocation}
        userInterfaceStyle={scheme}
        accessibilityLabel={label}
      >
        {markers.map((marker) => (
          <Marker key={marker.id} coordinate={marker} title={marker.title} description={marker.description} onPress={() => onMarkerPress?.(marker)} />
        ))}
      </NativeMap>
    </YStack>
  )
}
