import { useGate, type ModuleProviderProps } from '@daroms/app'
import type { Href } from 'expo-router'

import type { OnboardingConfig } from './config'
import { useOnboardingDone } from './store'

/** Gate prioritaire (10) : l'onboarding passe avant la connexion. */
export function OnboardingProvider({ children, config }: ModuleProviderProps<OnboardingConfig>) {
  const done = useOnboardingDone(config.version)
  useGate('onboarding', 10, { ready: true, redirect: done ? null : ('/onboarding' as Href), allow: ['/onboarding'] })
  return children
}
