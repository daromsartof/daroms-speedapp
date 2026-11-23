import { getDirection } from '@daroms/theme'
import type { ReactNode } from 'react'
import { Theme, YStack } from 'tamagui'

import type { IllustrationName } from '../illustrations/scenes'
import { Gradient } from './Gradient'
import { Illustration } from './Illustration'
import { Reveal } from './Reveal'
import { Body, Title } from './Text'
import type { StyleProps } from './style-props'

/**
 * @catalog Hero
 * @props title · subtitle · illustration (nom de scène) · tone: halo (fond clair à lueurs, défaut) | brand (dégradé plein, texte clair) · children (actions) · + props de style
 * @example <Hero illustration="growth" title={t('home.title')} subtitle={t('home.subtitle')}><Button>{t('home.start')}</Button></Hero>
 */
export function Hero({ title, subtitle, illustration, tone = 'halo', children, ...style }: StyleProps & { title: string; subtitle?: string; illustration?: IllustrationName; tone?: 'halo' | 'brand'; children?: ReactNode }) {
  const halo = tone === 'brand' || getDirection().halo
  const body = (
    <YStack position="relative" z="base" px="gutter" pt="section" pb="section" gap="stack" items="center" rounded="sheet" overflow="hidden" {...style}>
      {halo ? <Gradient kind={tone === 'brand' ? 'brand' : 'halo'} rounded="sheet" /> : null}
      {illustration ? <Illustration name={illustration} size="lg" /> : null}
      <Reveal delay={120}>
        <Title align="center" color={tone === 'brand' ? 'on-gradient' : undefined}>
          {title}
        </Title>
        {subtitle ? (
          <Body align="center" size="5" tone={tone === 'brand' ? undefined : 'muted'} color={tone === 'brand' ? 'on-gradient' : undefined} opacity={tone === 'brand' ? 0.9 : 1}>
            {subtitle}
          </Body>
        ) : null}
      </Reveal>
      {children ? <YStack w="100%" gap="inline" pt="tight">{children}</YStack> : null}
    </YStack>
  )
  return tone === 'brand' ? <Theme name="dark">{body}</Theme> : body
}
