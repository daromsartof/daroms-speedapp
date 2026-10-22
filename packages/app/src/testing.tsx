// Rendu de test d'un écran avec les providers de l'app (thème, i18n, requêtes, safe area).
import { initI18n } from '@daroms/i18n'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react-native'
import type { ReactElement, ReactNode } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { TamaguiProvider, type TamaguiInternalConfig } from 'tamagui'

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } }

export type RenderAppOptions = { config: TamaguiInternalConfig; locales: Record<string, object>; scheme?: 'light' | 'dark' }

export function renderApp(ui: ReactElement, { config, locales, scheme = 'light' }: RenderAppOptions) {
  initI18n({ app: locales, supported: Object.keys(locales), fallback: Object.keys(locales)[0] ?? 'fr' })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  function Providers({ children }: { children: ReactNode }) {
    return (
      <SafeAreaProvider initialMetrics={metrics}>
        <TamaguiProvider config={config} defaultTheme={scheme}>
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        </TamaguiProvider>
      </SafeAreaProvider>
    )
  }
  return render(ui, { wrapper: Providers })
}
