import { useDaromsT } from '@daroms/i18n'
import { YStack } from 'tamagui'

import { Inbox, type IconComponent } from '../icons'
import { Button } from './Button'
import { Body, Heading } from './Text'

export type EmptyStateProps = {
  icon?: IconComponent
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

/**
 * @catalog EmptyState
 * @props icon · title · description · actionLabel + onAction (textes par défaut fournis)
 * @example <EmptyState icon={ListChecks} title={t('todos.emptyTitle')} actionLabel={t('todos.add')} onAction={openSheet} />
 */
export function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction }: EmptyStateProps) {
  const t = useDaromsT()
  return (
    <YStack flex={1} items="center" justify="center" gap="stack" p="section" role="summary">
      <YStack w="16" h="16" rounded="pill" theme="soft" bg="background" items="center" justify="center">
        <Icon size="8" color="color" />
      </YStack>
      <Heading level={3} align="center">
        {title ?? t('states.emptyTitle')}
      </Heading>
      <Body tone="muted" align="center" maxW="80">
        {description ?? t('states.emptyDescription')}
      </Body>
      {actionLabel && onAction ? (
        <Button size="md" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </YStack>
  )
}
