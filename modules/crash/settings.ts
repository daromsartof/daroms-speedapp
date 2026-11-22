import type { SettingsSection } from '@daroms/ui'
import { Activity } from '@daroms/ui/icons'
import { useState } from 'react'

import { useCrashT } from './i18n'
import { crashReportsEnabled, setCrashReportsEnabled } from './sentry'

export function useCrashSettings(): SettingsSection[] {
  const t = useCrashT()
  const [enabled, setEnabled] = useState(crashReportsEnabled)
  const toggle = (next: boolean) => {
    setCrashReportsEnabled(next)
    setEnabled(next)
  }
  return [{ key: 'crash', title: t('section'), items: [{ key: 'crash-enabled', label: t('enabled'), description: t('description'), icon: Activity, type: 'toggle', checked: enabled, onToggle: toggle }] }]
}
