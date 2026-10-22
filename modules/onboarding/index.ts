import { defineModule } from '@daroms/app'

import { onboardingConfig } from './config'
import en from './locales/en.json'
import fr from './locales/fr.json'
import { OnboardingProvider } from './OnboardingProvider'

export default defineModule({
  slug: 'onboarding',
  config: onboardingConfig,
  Provider: OnboardingProvider,
  gate: true,
  locales: { fr: { onboarding: fr }, en: { onboarding: en } },
})

export { OnboardingScreen } from './OnboardingScreen'
export { markOnboardingDone, useOnboardingDone } from './store'
