import { defineModule } from '@daroms/app'

import { paymentsConfig } from './config'
import en from './locales/en.json'
import fr from './locales/fr.json'
import { PaymentsProvider } from './PaymentsProvider'
import { usePaymentsSettings } from './settings'

export default defineModule({
  slug: 'payments',
  config: paymentsConfig,
  Provider: PaymentsProvider,
  gate: true,
  modals: ['paywall'],
  locales: { fr: { payments: fr }, en: { payments: en } },
  useSettings: usePaymentsSettings,
})

export { usePro } from './PaymentsProvider'
export { PaywallScreen } from './PaywallScreen'
export { ProGate } from './ProGate'
