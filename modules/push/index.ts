import { defineModule } from '@daroms/app'

import { pushConfig } from './config'
import en from './locales/en.json'
import fr from './locales/fr.json'
import { PushProvider } from './PushProvider'
import { usePushSettings } from './settings'

export default defineModule({
  slug: 'push',
  config: pushConfig,
  Provider: PushProvider,
  locales: { fr: { push: fr }, en: { push: en } },
  useSettings: usePushSettings,
})

export { registerForPush, permissionGranted } from './notifications'
