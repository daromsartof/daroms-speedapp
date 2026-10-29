import { AppError } from '@daroms/data'
import { useQuery } from '@tanstack/react-query'
import * as Location from 'expo-location'
import { Linking, Platform } from 'react-native'

import { mapsUrl, type LatLng } from './geo'

/** Demande la permission (au moment de l'usage) puis renvoie la position ; AppError `forbidden` si refusée. */
export async function getCurrentLocation(): Promise<LatLng> {
  if (!(await Location.requestForegroundPermissionsAsync()).granted) throw new AppError('forbidden', 'permission localisation refusée')
  const position = (await Location.getLastKnownPositionAsync({ maxAge: 60_000 })) ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }))
  return { latitude: position.coords.latitude, longitude: position.coords.longitude }
}

/** Position de l'utilisateur (requête : chargement, erreur, réessayer) ; `enabled: false` pour attendre un geste. */
export function useCurrentLocation({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ queryKey: ['maps', 'location'], queryFn: getCurrentLocation, enabled, staleTime: 60_000, retry: false })
}

/** Ouvre le point dans Apple Plans, Google Maps ou le navigateur. */
export function openInMaps(point: LatLng, label?: string): Promise<void> {
  return Linking.openURL(mapsUrl(point, label, Platform.OS))
}
