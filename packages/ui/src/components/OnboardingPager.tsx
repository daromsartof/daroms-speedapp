import { useDaromsT } from '@daroms/i18n'
import { useRef, useState } from 'react'
import { useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, XStack, YStack, type ScrollViewRef } from 'tamagui'

import type { IconComponent } from '../icons'
import { Button } from './Button'
import { Body, Title } from './Text'

export type OnboardingPage = { key: string; icon?: IconComponent; title: string; description: string }

/**
 * @catalog OnboardingPager
 * @props pages[{ key, icon, title, description }] · onDone · doneLabel
 * @example <OnboardingPager pages={pages} onDone={finish} />
 */
export function OnboardingPager({ pages, onDone, doneLabel }: { pages: OnboardingPage[]; onDone: () => void; doneLabel?: string }) {
  const t = useDaromsT()
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const scroller = useRef<ScrollViewRef>(null)
  const [index, setIndex] = useState(0)
  const last = index === pages.length - 1

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
  }
  const next = () => {
    if (last) return onDone()
    scroller.current?.scrollTo({ x: (index + 1) * width, animated: true })
    setIndex(index + 1)
  }

  return (
    <YStack flex={1} bg="background" pt={insets.top} pb={insets.bottom + 16}>
      <XStack justify="flex-end" px="gutter" minH="12">
        {last ? null : <Button variant="ghost" size="sm" onPress={onDone}>{t('actions.skip')}</Button>}
      </XStack>
      <ScrollView ref={scroller} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onScrollEnd} flex={1} contentContainerStyle={{ flexGrow: 1 }}>
        {pages.map(({ key, icon: Icon, title, description }) => (
          <YStack key={key} w={width} h="100%" px="section" items="center" justify="center" gap="stack">
            {Icon ? (
              <YStack theme="soft" bg="background" w="24" h="24" rounded="pill" items="center" justify="center" mb="stack">
                <Icon size="10" color="color" />
              </YStack>
            ) : null}
            <Title align="center">{title}</Title>
            <Body tone="muted" align="center" size="5">{description}</Body>
          </YStack>
        ))}
      </ScrollView>
      <XStack justify="center" gap="tight" py="section" aria-hidden>
        {pages.map((page, i) => (
          <YStack key={page.key} h="2" w={i === index ? '6' : '2'} rounded="pill" bg={i === index ? 'brand-500' : 'color-4'} transition="fast" />
        ))}
      </XStack>
      <YStack px="gutter">
        <Button fullWidth onPress={next}>{last ? (doneLabel ?? t('actions.continue')) : t('actions.next')}</Button>
      </YStack>
    </YStack>
  )
}
