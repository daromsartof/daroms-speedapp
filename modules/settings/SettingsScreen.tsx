import { useModuleConfig, useModuleSettings, usePreferences, type ColorSchemePreference } from '@daroms/app'
import { createNamespaceT, i18next } from '@daroms/i18n'
import { getManifest } from '@daroms/lib/manifest'
import { Header, Screen, SegmentedControl, SettingsList, type SettingsSection } from '@daroms/ui'
import { FileText, Languages, Mail, Shield, Vibrate } from '@daroms/ui/icons'
import Constants from 'expo-constants'
import { Linking } from 'react-native'

import type { SettingsConfig } from './config'
import type fr from './locales/fr.json'

const useSettingsT = createNamespaceT<typeof fr>('settings')

export function SettingsScreen() {
  const t = useSettingsT()
  const config = useModuleConfig<SettingsConfig>('settings')
  const manifest = getManifest()
  const prefs = usePreferences()
  const moduleSections = useModuleSettings()
  const language = i18next.language

  const preferences: SettingsSection = {
    key: 'preferences',
    title: t('preferences.section'),
    items: [
      ...(config.haptics ? [{ key: 'haptics', label: t('preferences.haptics'), icon: Vibrate, type: 'toggle' as const, checked: prefs.haptics, onToggle: prefs.setHaptics }] : []),
      ...(config.language && manifest.locales.length > 1
        ? manifest.locales.map((code) => ({
            key: `lang-${code}`,
            label: t(`languages.${code}`),
            icon: code === manifest.locales[0] ? Languages : undefined,
            type: 'action' as const,
            selected: language === code,
            onPress: () => {
              prefs.setLanguage(code)
              void i18next.changeLanguage(code)
            },
          }))
        : []),
    ],
  }
  const { privacyUrl, termsUrl, supportEmail } = manifest.store
  const about: SettingsSection = {
    key: 'about',
    title: t('about.section'),
    items: [
      { key: 'version', label: t('about.version'), value: Constants.expoConfig?.version ?? manifest.version },
      ...(privacyUrl ? [{ key: 'privacy', label: t('about.privacy'), icon: Shield, type: 'link' as const, onPress: () => void Linking.openURL(privacyUrl) }] : []),
      ...(termsUrl ? [{ key: 'terms', label: t('about.terms'), icon: FileText, type: 'link' as const, onPress: () => void Linking.openURL(termsUrl) }] : []),
      ...(supportEmail ? [{ key: 'support', label: t('about.support'), icon: Mail, type: 'link' as const, onPress: () => void Linking.openURL(`mailto:${supportEmail}`) }] : []),
    ],
  }
  return (
    <Screen header={<Header title={t('title')} large />}>
      {config.appearance ? (
        <SegmentedControl<ColorSchemePreference>
          options={[
            { value: 'system', label: t('appearance.system') },
            { value: 'light', label: t('appearance.light') },
            { value: 'dark', label: t('appearance.dark') },
          ]}
          value={prefs.colorScheme}
          onChange={prefs.setColorScheme}
        />
      ) : null}
      <SettingsList sections={[preferences, ...moduleSections, about].filter((s) => s.items.length > 0)} />
    </Screen>
  )
}

