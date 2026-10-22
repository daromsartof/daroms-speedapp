// Construit la config Expo depuis le manifest et la marque. Chargé par Node
// (app.config.ts) : imports relatifs avec extension .ts, syntaxe TS effaçable.
import type { ConfigContext, ExpoConfig } from 'expo/config'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

import type { Brand } from '../../theme/src/brand.ts'
import type { Manifest } from '../../lib/src/manifest/schema.ts'

type ModulePlugin = (config: ExpoConfig, options: Record<string, unknown>, manifest: Manifest) => ExpoConfig

function applyModulePlugins(config: ExpoConfig, manifest: Manifest, projectRoot: string): ExpoConfig {
  let out = config
  for (const [slug, options] of Object.entries(manifest.modules)) {
    const file = join(projectRoot, 'core', 'modules', slug, 'plugin.ts')
    if (!existsSync(file)) continue
    const loaded = createRequire(import.meta.url)(file) as { default?: ModulePlugin } | ModulePlugin
    const plugin = typeof loaded === 'function' ? loaded : loaded.default
    if (plugin) out = plugin(out, options, manifest)
  }
  return out
}

export function withDaroms(ctx: ConfigContext, { manifest, brand }: { manifest: Manifest; brand: Brand }): ExpoConfig {
  const projectRoot = ctx.projectRoot ?? process.cwd()
  const asset = (name: string) => `./assets/${name}`
  const base: ExpoConfig = {
    ...ctx.config,
    name: manifest.name,
    slug: manifest.slug,
    version: manifest.version,
    scheme: manifest.scheme ?? manifest.slug,
    orientation: manifest.orientation,
    userInterfaceStyle: 'automatic',
    icon: asset('icon.png'),
    ios: {
      ...ctx.config.ios,
      bundleIdentifier: manifest.bundleId,
      supportsTablet: false,
      config: { usesNonExemptEncryption: false },
    },
    android: {
      ...ctx.config.android,
      package: manifest.bundleId.replace(/-/g, '_'),
      adaptiveIcon: { foregroundImage: asset('adaptive-icon.png'), backgroundColor: brand.primary },
    },
    web: { favicon: asset('favicon.png'), output: 'single' },
    plugins: [
      'expo-router',
      ['expo-splash-screen', { image: asset('splash-icon.png'), imageWidth: 160, backgroundColor: '#ffffff', dark: { backgroundColor: '#0a0a0a' } }],
      'expo-localization',
      'expo-sqlite',
      'expo-font',
      ...(ctx.config.plugins ?? []),
    ],
    experiments: { typedRoutes: true, reactCompiler: true },
    extra: {
      ...ctx.config.extra,
      manifest,
      ...(manifest.eas.projectId ? { eas: { projectId: manifest.eas.projectId } } : {}),
    },
    ...(manifest.eas.owner ? { owner: manifest.eas.owner } : {}),
    ...(manifest.eas.projectId
      ? { updates: { url: `https://u.expo.dev/${manifest.eas.projectId}` }, runtimeVersion: { policy: 'appVersion' } }
      : {}),
  }
  return applyModulePlugins(base, manifest, projectRoot)
}
