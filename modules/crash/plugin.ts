// Config plugin : avec organisation et projet, les builds de release envoient leurs source maps à Sentry
// (jeton SENTRY_AUTH_TOKEN en variable EAS « sensitive »). Sans eux, les erreurs remontent quand même,
// mais les traces des versions de production restent minifiées.
import type { ExpoConfig } from 'expo/config'

import type { CrashConfig } from './config'

export default function crashPlugin(config: ExpoConfig, options: Partial<CrashConfig>): ExpoConfig {
  if (!options.organization || !options.project) return config
  const sentry = ['@sentry/react-native/expo', { organization: options.organization, project: options.project, url: options.url ?? 'https://sentry.io/' }] as const
  return { ...config, plugins: [...(config.plugins ?? []), sentry as unknown as [string, Record<string, string>]] }
}
