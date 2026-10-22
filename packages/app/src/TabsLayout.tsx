import { useT } from '@daroms/i18n'
import { haptic } from '@daroms/lib/haptics'
import { getManifest } from '@daroms/lib/manifest'
import { getIcon } from '@daroms/ui/icons'
import { Tabs } from 'expo-router'
import { useTheme } from 'tamagui'

/** Onglets générés depuis `manifest.tabs` (nom de route, icône Lucide, clé de titre). */
export function TabsLayout() {
  const t = useT() as unknown as (key: string) => string
  const theme = useTheme()
  const tabs = getManifest().tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme['brand-500']?.val,
        tabBarInactiveTintColor: theme['color-8']?.val,
        tabBarStyle: { backgroundColor: theme.card?.val, borderTopColor: theme.separator?.val },
      }}
      screenListeners={{ tabPress: () => haptic('selection') }}
    >
      {tabs.map((tab) => {
        const Icon = getIcon(tab.icon)
        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: t(tab.titleKey),
              tabBarIcon: Icon ? ({ focused, size }) => <Icon color={focused ? 'brand-500' : 'color-8'} size={size} /> : undefined,
            }}
          />
        )
      })}
    </Tabs>
  )
}
