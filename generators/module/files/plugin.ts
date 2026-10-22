// Config plugin Expo du module (chargé par Node via app.config.ts) : syntaxe TS effaçable uniquement.
import type { ExpoConfig } from 'expo/config'

export default function {{camel}}Plugin(config: ExpoConfig, _options: Record<string, unknown>): ExpoConfig {
  return config
}
