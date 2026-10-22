import { useModuleConfig } from '@daroms/app'
import { createNamespaceT, useTranslateKey } from '@daroms/i18n'
import { OnboardingPager, type OnboardingPage } from '@daroms/ui'
import { getIcon } from '@daroms/ui/icons'
import { useRouter } from 'expo-router'

import type { OnboardingConfig } from './config'
import type fr from './locales/fr.json'
import { markOnboardingDone } from './store'

const useOnboardingT = createNamespaceT<typeof fr>('onboarding')

export function OnboardingScreen() {
  const config = useModuleConfig<OnboardingConfig>('onboarding')
  const translate = useTranslateKey()
  const t = useOnboardingT()
  const router = useRouter()
  const pages: OnboardingPage[] = config.pages.map((page, i) => ({
    key: String(i),
    icon: getIcon(page.icon),
    title: translate(page.titleKey),
    description: translate(page.descriptionKey),
  }))
  return (
    <OnboardingPager
      pages={pages}
      doneLabel={t('start')}
      onDone={() => {
        markOnboardingDone(config.version)
        router.replace('/')
      }}
    />
  )
}
