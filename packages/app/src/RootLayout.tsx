import { configureSupabase } from '@daroms/data'
import { initI18n, type Resources } from '@daroms/i18n'
import { getManifest } from '@daroms/lib/manifest'
import { interFontFiles } from '@daroms/theme/fonts'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import type { TamaguiInternalConfig } from 'tamagui'

import { AppProvider } from './AppProvider'
import { usePreferences } from './preferences'
import { resolveModules, type ModuleRegistry } from './module'

export type RootLayoutOptions = {
  config: TamaguiInternalConfig
  modules: ModuleRegistry
  /** Textes de l'app : { fr, en } (namespace app). */
  locales: Record<string, object>
  /** Variables publiques Supabase (process.env.EXPO_PUBLIC_* lues dans l'app). */
  supabase: { url?: string; key?: string }
  /** Charge Inter (brand.font === 'inter'). */
  loadInter?: boolean
}

/** Fabrique le layout racine : i18n, Supabase, modules, polices, splash, providers, pile. */
export function createRootLayout({ config, modules, locales, supabase, loadInter = true }: RootLayoutOptions) {
  void SplashScreen.preventAutoHideAsync().catch(() => undefined)
  const manifest = getManifest()
  const resolved = resolveModules(modules, manifest.modules)
  const extra = resolved.map(({ module }) => module.locales).filter((l): l is Resources => Boolean(l))
  const language = usePreferences.getState().language
  initI18n({ app: locales, extra, supported: manifest.locales, fallback: manifest.defaultLocale, language })
  configureSupabase(supabase)
  for (const { module, config: moduleConfig } of resolved) void module.init?.(moduleConfig)
  const modals = resolved.flatMap(({ module }) => module.modals ?? [])

  return function RootLayout() {
    const [loaded, error] = useFonts(loadInter ? interFontFiles : {})
    // le splash est masqué par GateKeeper quand les gates des modules sont prêtes
    if (!loaded && !error) return null
    return (
      <AppProvider config={config} modules={resolved}>
        <Stack screenOptions={{ headerShown: false, animation: 'default' }}>
          {modals.map((name) => (
            <Stack.Screen key={name} name={name} options={{ presentation: 'modal' }} />
          ))}
        </Stack>
      </AppProvider>
    )
  }
}
