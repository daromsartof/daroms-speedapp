import { defineModule } from '@daroms/app'

import { settingsConfig } from './config'
import en from './locales/en.json'
import fr from './locales/fr.json'

export default defineModule({
  slug: 'settings',
  config: settingsConfig,
  locales: { fr: { settings: fr }, en: { settings: en } },
})

export { SettingsScreen } from './SettingsScreen'
