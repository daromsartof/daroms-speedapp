import { QueryProvider, SessionProvider } from '@daroms/data'
import { Toaster } from '@daroms/ui'
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useMemo, type ReactNode } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { TamaguiProvider, useTheme, type TamaguiInternalConfig } from 'tamagui'

import { useAppColorScheme } from './color-scheme'
import { GateKeeper } from './gates'
import type { ResolvedModule } from './module'
import { ModuleProviders } from './ModuleProviders'

/** Couleurs des navigateurs (barre d'onglets, fonds de pile) tirées du thème Tamagui. */
function NavigationTheme({ scheme, children }: { scheme: 'light' | 'dark'; children: ReactNode }) {
  const theme = useTheme()
  const value = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme['brand-500']?.val ?? base.colors.primary,
        background: theme.background?.val ?? base.colors.background,
        card: theme.card?.val ?? base.colors.card,
        text: theme.color?.val ?? base.colors.text,
        border: theme.separator?.val ?? base.colors.border,
      },
    }
  }, [scheme, theme])
  return <ThemeProvider value={value}>{children}</ThemeProvider>
}

export type AppProviderProps = { config: TamaguiInternalConfig; modules: ResolvedModule[]; children: ReactNode }

/** Ordre imposé par Tamagui v3 : SafeAreaProvider au-dessus de TamaguiProvider. */
export function AppProvider({ config, modules, children }: AppProviderProps) {
  const scheme = useAppColorScheme()
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={scheme}>
          <NavigationTheme scheme={scheme}>
            <QueryProvider>
              <SessionProvider>
                <GateKeeper expected={modules.filter(({ module }) => module.gate).map(({ module }) => module.slug)}>
                  <ModuleProviders modules={modules}>
                    {children}
                    <Toaster />
                  </ModuleProviders>
                </GateKeeper>
              </SessionProvider>
            </QueryProvider>
          </NavigationTheme>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        </TamaguiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
