// Config plugin : Sign in with Apple (entitlement iOS) si le fournisseur est activé.
import type { ExpoConfig } from 'expo/config'

export default function authPlugin(config: ExpoConfig, options: Record<string, unknown>): ExpoConfig {
  const providers = Array.isArray(options.providers) ? options.providers : ['email', 'apple', 'google']
  if (!providers.includes('apple')) return config
  return {
    ...config,
    ios: { ...config.ios, usesAppleSignIn: true },
    plugins: [...(config.plugins ?? []), 'expo-apple-authentication'],
  }
}
