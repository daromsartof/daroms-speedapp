// Config plugin : expo-notifications (icône et couleur Android par défaut).
import type { ExpoConfig } from 'expo/config'

export default function pushPlugin(config: ExpoConfig): ExpoConfig {
  return { ...config, plugins: [...(config.plugins ?? []), ['expo-notifications', { defaultChannel: 'default' }]] }
}
