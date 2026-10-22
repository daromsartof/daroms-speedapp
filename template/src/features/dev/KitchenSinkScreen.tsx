import { useAppColorScheme } from '@daroms/app'
import { useT } from '@daroms/i18n'
import { Header, Heading, Screen, SegmentedControl, Theme, YStack } from '@daroms/ui'
import { Redirect } from 'expo-router'
import { useState, type ReactNode } from 'react'

import { ActionsSection, DisplaySection, FeedbackSection, StatesSection } from './sections'

type Scheme = 'light' | 'dark'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <YStack gap="inline">
      <Heading level={3}>{title}</Heading>
      {children}
    </YStack>
  )
}

/** Vitrine de tous les composants pour vérifier le thème d'un coup d'œil (dev uniquement). */
export default function KitchenSinkScreen() {
  const t = useT()
  const [scheme, setScheme] = useState<Scheme>(useAppColorScheme())
  if (!__DEV__) return <Redirect href="/" />
  return (
    <Theme name={scheme}>
      <Screen header={<Header title={t('dev.kitchenSink')} back />}>
        <SegmentedControl
          options={[
            { value: 'light', label: t('dev.light') },
            { value: 'dark', label: t('dev.dark') },
          ]}
          value={scheme}
          onChange={setScheme}
        />
        <Section title={t('dev.actions')}>
          <ActionsSection />
        </Section>
        <Section title={t('dev.display')}>
          <DisplaySection />
        </Section>
        <Section title={t('dev.feedback')}>
          <FeedbackSection />
        </Section>
        <Section title={t('dev.states')}>
          <StatesSection />
        </Section>
      </Screen>
    </Theme>
  )
}
