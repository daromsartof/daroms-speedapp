import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, YStack } from 'tamagui'

export type ScreenProps = {
  children: ReactNode
  /** Contenu défilant (défaut true). */
  scroll?: boolean
  /** Marges et espacement standard (défaut true). */
  padded?: boolean
  header?: ReactNode
  /** Zone fixe en bas (bouton principal), au-dessus de la barre système. */
  footer?: ReactNode
  /** Évite le clavier (formulaires). */
  keyboard?: boolean
  onRefresh?: () => void
  refreshing?: boolean
  /** Ajoute la marge de la zone sûre en haut (défaut true ; false sous un header natif). */
  safeTop?: boolean
}

/**
 * @catalog Screen
 * @props scroll · padded · header · footer · keyboard · onRefresh + refreshing · safeTop
 * @example <Screen header={<Header title={t('home.title')} large />} onRefresh={q.refetch} refreshing={q.isRefetching}>...</Screen>
 */
export function Screen({ children, scroll = true, padded = true, header, footer, keyboard = false, onRefresh, refreshing = false, safeTop = true }: ScreenProps) {
  const insets = useSafeAreaInsets()
  const bottom = footer ? 0 : insets.bottom
  const content = padded ? (
    <YStack px="gutter" pt="tight" pb="section" gap="stack" flex={scroll ? undefined : 1}>
      {children}
    </YStack>
  ) : (
    children
  )
  const body = scroll ? (
    <ScrollView
      flex={1}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: bottom }}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
    >
      {content}
    </ScrollView>
  ) : (
    <YStack flex={1} pb={bottom}>
      {content}
    </YStack>
  )
  return (
    <YStack flex={1} bg="background" pt={safeTop ? insets.top : 0}>
      {header}
      {keyboard ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
      {footer ? (
        <YStack px="gutter" pt="stack" pb={insets.bottom + 12} gap="inline" borderTopWidth={1} borderColor="separator" bg="background">
          {footer}
        </YStack>
      ) : null}
    </YStack>
  )
}
