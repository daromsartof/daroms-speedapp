import { useDaromsT, useTranslateKey } from '@daroms/i18n'
import { YStack } from 'tamagui'

import { CircleAlert, RefreshCw } from '../icons'
import { Button } from './Button'
import { Body, Heading } from './Text'

export type ErrorStateProps = {
  /** Erreur (AppError de @daroms/data : son messageKey est traduit). */
  error?: unknown
  title?: string
  description?: string
  onRetry?: () => void
}

function messageKeyOf(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'messageKey' in error) {
    const key = (error as { messageKey: unknown }).messageKey
    return typeof key === 'string' ? key : undefined
  }
  return undefined
}

/**
 * @catalog ErrorState
 * @props error (AppError traduite automatiquement) · title · description · onRetry (bouton Réessayer)
 * @example <ErrorState error={query.error} onRetry={() => query.refetch()} />
 */
export function ErrorState({ error, title, description, onRetry }: ErrorStateProps) {
  const t = useDaromsT()
  const translate = useTranslateKey()
  const key = messageKeyOf(error)
  return (
    <YStack flex={1} items="center" justify="center" gap="stack" p="section" role="alert">
      <YStack w="16" h="16" rounded="pill" theme="danger" bg="background" items="center" justify="center">
        <CircleAlert size="8" color="color" />
      </YStack>
      <Heading level={3} align="center">
        {title ?? t('states.errorTitle')}
      </Heading>
      <Body tone="muted" align="center" maxW="80">
        {description ?? (key ? translate(key) : t('states.errorDescription'))}
      </Body>
      {onRetry ? (
        <Button size="md" variant="secondary" icon={RefreshCw} onPress={onRetry}>
          {t('actions.retry')}
        </Button>
      ) : null}
    </YStack>
  )
}
