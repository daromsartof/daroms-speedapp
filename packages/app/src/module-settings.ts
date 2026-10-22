import type { SettingsSection } from '@daroms/ui'

import { useModules } from './ModuleProviders'

/** Sections de réglages apportées par les modules actifs (auth, payments, push...). */
export function useModuleSettings(): SettingsSection[] {
  const modules = useModules()
  // le registre est statique (généré) : l'ordre des appels de hooks ne change jamais
  return modules.flatMap(({ module }) => module.useSettings?.() ?? [])
}
