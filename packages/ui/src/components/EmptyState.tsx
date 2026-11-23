import { useDaromsT } from '@daroms/i18n'
import { YStack } from 'tamagui'

import type { IconComponent } from '../icons'
import type { IllustrationName } from '../illustrations/scenes'
import { Button } from './Button'
import { Illustration } from './Illustration'
import { Body, Heading } from './Text'
import type { StyleProps } from './style-props'

export type EmptyStateProps = StyleProps & {
  /** Scène affichée (défaut empty) ; ignorée si `icon` est donné. */
  illustration?: IllustrationName
  icon?: IconComponent
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

/**
 * @catalog EmptyState
 * @props illustration (défaut empty) ou icon · title · description · actionLabel + onAction (textes par défaut fournis) · + props de style
 * @example <EmptyState illustration="calendar" title={t('todos.emptyTitle')} actionLabel={t('todos.add')} onAction={openSheet} />
 */
export function EmptyState({ illustration = 'empty', icon: Icon, title, description, actionLabel, onAction, ...style }: EmptyStateProps) {
  const t = useDaromsT()
  return (
    <YStack flex={1} items="center" justify="center" gap="stack" p="section" {...style} role="summary">
      {Icon ? (
        <YStack w="16" h="16" rounded="pill" theme="soft" bg="background" items="center" justify="center">
          <Icon size="8" color="color" />
        </YStack>
      ) : (
        <Illustration name={illustration} size="sm" />
      )}
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
