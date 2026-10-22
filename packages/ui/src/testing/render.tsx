// Rendu de test : providers minimaux (thème de marque, safe area, i18n du cœur).
import { initI18n } from '@daroms/i18n'
import { createBrandConfig, defineBrand } from '@daroms/theme'
import { render } from '@testing-library/react-native'
import type { ReactElement, ReactNode } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { TamaguiProvider } from 'tamagui'

const config = createBrandConfig(defineBrand({ primary: '#4F46E5', accent: '#F97316' }))
initI18n({ app: { fr: {} }, supported: ['fr'], fallback: 'fr' })

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } }

function Providers({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={metrics}>
      <TamaguiProvider config={config} defaultTheme="light">
        {children}
      </TamaguiProvider>
    </SafeAreaProvider>
  )
}

/** Rend un élément avec les providers ; `rerender` les conserve. */
export function renderUI(ui: ReactElement) {
  return render(ui, { wrapper: Providers })
}
