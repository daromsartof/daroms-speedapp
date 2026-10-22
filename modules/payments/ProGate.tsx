import { Button, Card, Heading, YStack } from '@daroms/ui'
import { Crown } from '@daroms/ui/icons'
import { useRouter, type Href } from 'expo-router'
import type { ReactNode } from 'react'

import { usePaymentsT } from './i18n'
import { usePro } from './PaymentsProvider'

/** Affiche le contenu si Pro, sinon une carte d'invitation au paywall. */
export function ProGate({ children }: { children: ReactNode }) {
  const { isPro } = usePro()
  const t = usePaymentsT()
  const router = useRouter()
  if (isPro) return <>{children}</>
  return (
    <Card items="center" gap="stack" py="section">
      <YStack theme="brand" bg="background" w="12" h="12" rounded="pill" items="center" justify="center">
        <Crown size="6" color="color" />
      </YStack>
      <Heading level={3}>{t('locked')}</Heading>
      <Button size="md" onPress={() => router.push('/paywall' as Href)}>
        {t('unlock')}
      </Button>
    </Card>
  )
}
