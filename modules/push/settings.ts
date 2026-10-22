import { notify, type SettingsSection } from '@daroms/ui'
import { Bell } from '@daroms/ui/icons'
import { useEffect, useState } from 'react'
import { Linking, Platform } from 'react-native'

import { usePushT } from './i18n'
import { permissionGranted, registerForPush } from './notifications'

export function usePushSettings(): SettingsSection[] {
  const t = usePushT()
  const [enabled, setEnabled] = useState(false)
  useEffect(() => void permissionGranted().then(setEnabled), [])
  if (Platform.OS === 'web') return []
  const toggle = async (next: boolean) => {
    if (!next) return void Linking.openSettings()
    const granted = await registerForPush()
    setEnabled(granted)
    if (!granted) notify.info(t('denied'))
  }
  return [{ key: 'push', title: t('section'), items: [{ key: 'push-enabled', label: t('enabled'), icon: Bell, type: 'toggle', checked: enabled, onToggle: (v) => void toggle(v) }] }]
}
