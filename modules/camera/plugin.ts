// Config plugin : expo-image-picker avec des textes de permission explicites (refus App Store sinon).
import type { ExpoConfig } from 'expo/config'

import type { Manifest } from '../../packages/lib/src/manifest/schema.ts'

const TEXTS = {
  fr: { camera: "Pour prendre une photo et l'ajouter dans l'app.", photos: "Pour choisir une photo de votre galerie et l'ajouter dans l'app." },
  en: { camera: 'To take a photo and add it in the app.', photos: 'To pick a photo from your library and add it in the app.' },
}

export default function cameraPlugin(config: ExpoConfig, options: Record<string, unknown>, manifest?: Manifest): ExpoConfig {
  const texts = manifest?.defaultLocale === 'fr' ? TEXTS.fr : TEXTS.en
  const text = (key: string, fallback: string) => (typeof options[key] === 'string' ? (options[key] as string) : fallback)
  const pickerOptions = {
    cameraPermission: text('cameraPermission', texts.camera),
    photosPermission: text('photosPermission', texts.photos),
    microphonePermission: false,
  }
  return { ...config, plugins: [...(config.plugins ?? []), ['expo-image-picker', pickerOptions]] }
}
