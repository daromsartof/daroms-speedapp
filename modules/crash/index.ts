import { defineModule } from '@daroms/app'

import { crashConfig } from './config'
import { CrashProvider } from './CrashProvider'
import en from './locales/en.json'
import fr from './locales/fr.json'
import { initCrash } from './sentry'
import { useCrashSettings } from './settings'

export default defineModule({
  slug: 'crash',
  config: crashConfig,
  init: initCrash,
  Provider: CrashProvider,
  locales: { fr: { crash: fr }, en: { crash: en } },
  useSettings: useCrashSettings,
})

export { crashReportsEnabled, reportError, setCrashReportsEnabled } from './sentry'
