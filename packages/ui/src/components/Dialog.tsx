import { useDaromsT } from '@daroms/i18n'
import { Dialog as TDialog, XStack } from 'tamagui'

import { Button } from './Button'
import { Body, Heading } from './Text'

export type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Bouton de confirmation rouge (suppression...). */
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
}

/**
 * @catalog Dialog
 * @props open · onOpenChange · title · description · confirmLabel · cancelLabel · destructive · loading · onConfirm
 * @example <Dialog open={confirm} onOpenChange={setConfirm} title={t('todo.deleteTitle')} destructive onConfirm={remove} />
 */
export function Dialog({ open, onOpenChange, title, description, confirmLabel, cancelLabel, destructive = false, loading = false, onConfirm }: DialogProps) {
  const t = useDaromsT()
  return (
    <TDialog modal open={open} onOpenChange={onOpenChange}>
      <TDialog.Portal>
        <TDialog.Overlay key="overlay" bg="overlay" transition="fast" opacity="1 enter:0 exit:0" />
        <TDialog.Content
          key="content"
          bg="card"
          rounded="card"
          p="section"
          gap="stack"
          w="90%"
          maxW="96"
          transition="medium"
          opacity="1 enter:0 exit:0"
          scale="1 enter:0.95 exit:0.95"
        >
          <TDialog.Title asChild>
            <Heading level={3}>{title}</Heading>
          </TDialog.Title>
          {description ? (
            <TDialog.Description asChild>
              <Body tone="muted">{description}</Body>
            </TDialog.Description>
          ) : null}
          <XStack gap="inline" justify="flex-end">
            <Button size="md" variant="ghost" onPress={() => onOpenChange(false)}>
              {cancelLabel ?? t('actions.cancel')}
            </Button>
            <Button
              size="md"
              variant={destructive ? 'danger' : 'primary'}
              haptic={destructive ? 'warning' : 'light'}
              loading={loading}
              onPress={onConfirm}
            >
              {confirmLabel ?? (destructive ? t('actions.delete') : t('actions.confirm'))}
            </Button>
          </XStack>
        </TDialog.Content>
      </TDialog.Portal>
    </TDialog>
  )
}
