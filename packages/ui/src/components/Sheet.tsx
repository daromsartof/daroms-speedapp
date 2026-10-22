import type { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Sheet as TSheet, YStack } from 'tamagui'

import { Heading } from './Text'

export type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children: ReactNode
  /** Hauteurs en % de l'écran, du plus haut au plus bas (défaut [60]). */
  snapPoints?: number[]
  /** Contenu défilant (listes longues). */
  scroll?: boolean
}

/**
 * @catalog Sheet
 * @props open · onOpenChange · title · snapPoints (défaut [60]) · scroll
 * @example <Sheet open={open} onOpenChange={setOpen} title={t('todos.new')}><TodoForm onDone={() => setOpen(false)} /></Sheet>
 */
export function Sheet({ open, onOpenChange, title, children, snapPoints = [60], scroll = false }: SheetProps) {
  const insets = useSafeAreaInsets()
  const body = (
    <YStack px="gutter" pt="tight" pb={insets.bottom + 16} gap="stack">
      {title ? <Heading level={3}>{title}</Heading> : null}
      {children}
    </YStack>
  )
  return (
    <TSheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      snapPointsMode="percent"
      dismissOnSnapToBottom
      moveOnKeyboardChange
      transition="medium"
    >
      <TSheet.Overlay bg="overlay" transition="fast" opacity="1 enter:0 exit:0" />
      <TSheet.Handle bg="color-5" opacity={0.8} />
      <TSheet.Container>
        <TSheet.Background bg="card" borderTopLeftRadius="sheet" borderTopRightRadius="sheet" />
        {scroll ? <TSheet.ScrollView>{body}</TSheet.ScrollView> : body}
      </TSheet.Container>
    </TSheet>
  )
}
