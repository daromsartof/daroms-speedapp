// Config plugin : permission de localisation (au premier plan seulement) et clé Google Maps Android.
import type { ExpoConfig } from 'expo/config'

import type { Manifest } from '../../packages/lib/src/manifest/schema.ts'

const TEXTS = {
  fr: "Pour afficher votre position sur la carte et les lieux proches de vous.",
  en: 'To show your position on the map and places near you.',
}

export default function mapsPlugin(config: ExpoConfig, options: Record<string, unknown>, manifest?: Manifest): ExpoConfig {
  const permission = typeof options.locationPermission === 'string' ? options.locationPermission : manifest?.defaultLocale === 'fr' ? TEXTS.fr : TEXTS.en
  // clé de build (EAS : variable d'environnement), sans elle la carte Android reste vide hors Expo Go
  const androidKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY
  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      ['expo-location', { locationWhenInUsePermission: permission, locationAlwaysAndWhenInUsePermission: false, locationAlwaysPermission: false, isAndroidBackgroundLocationEnabled: false }],
      ['react-native-maps', androidKey ? { androidGoogleMapsApiKey: androidKey } : {}],
    ],
  }
}
