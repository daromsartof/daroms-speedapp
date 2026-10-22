import { useDaromsT } from '@daroms/i18n'
import { useRouter } from 'expo-router'
import type { ReactNode } from 'react'
import { XStack, YStack } from 'tamagui'

import { ChevronLeft } from '../icons'
import { IconButton } from './IconButton'
import { Caption, Heading, Title } from './Text'

export type HeaderProps = {
  title: string
  subtitle?: string
  /** Bouton retour : true (router.back) ou fonction. */
  back?: boolean | (() => void)
  /** Actions à droite (IconButton). */
  right?: ReactNode
  /** Grand titre (écrans racine d'onglet). */
  large?: boolean
}

/**
 * @catalog Header
 * @props title · subtitle · back (true | fn) · right · large
 * @example <Header title={t('todo.title')} back right={<IconButton icon={Trash2} label={t('actions.delete')} onPress={remove} />} />
 */
export function Header({ title, subtitle, back, right, large = false }: HeaderProps) {
  const router = useRouter()
  const t = useDaromsT()
  const goBack = typeof back === 'function' ? back : () => router.back()
  return (
    <XStack items="center" gap="tight" px={back ? 'tight' : 'gutter'} pr="gutter" py="tight" minH="14">
      {back ? <IconButton icon={ChevronLeft} label={t('a11y.back')} onPress={goBack} /> : null}
      <YStack flex={1}>
        {large ? (
          <Title numberOfLines={1}>{title}</Title>
        ) : (
          <Heading level={3} numberOfLines={1}>
            {title}
          </Heading>
        )}
        {subtitle ? <Caption numberOfLines={1}>{subtitle}</Caption> : null}
      </YStack>
      {right ? (
        <XStack gap="tight" items="center">
          {right}
        </XStack>
      ) : null}
    </XStack>
  )
}
