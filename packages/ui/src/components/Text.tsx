import { SizableText, styled } from 'tamagui'

const toneVariant = {
  default: { color: 'color' },
  muted: { color: 'color-8' },
  subtle: { color: 'color-7' },
  brand: { color: 'brand-600 dark:brand-300' },
  accent: { color: 'accent-600 dark:accent-300' },
  danger: { color: 'red-600 dark:red-400' },
  success: { color: 'emerald-600 dark:emerald-400' },
} as const

const variants = {
  tone: toneVariant,
  align: { start: { text: 'left' }, center: { text: 'center' }, end: { text: 'right' } },
  weight: { regular: { fontWeight: '400' }, medium: { fontWeight: '500' }, bold: { fontWeight: '700' } },
} as const

/**
 * @catalog Title
 * @props tone: default|muted|brand|accent|danger|success · align: start|center|end
 * @example <Title>{t('home.title')}</Title>
 */
export const Title = styled(SizableText, {
  name: 'Title',
  role: 'heading',
  fontFamily: 'heading',
  size: '9',
  color: 'color',
  variants,
})

/**
 * @catalog Heading
 * @props tone · align · level: 1|2|3 (taille 7, 6, 5)
 * @example <Heading level={2}>{t('section.title')}</Heading>
 */
export const Heading = styled(SizableText, {
  name: 'Heading',
  role: 'heading',
  fontFamily: 'heading',
  size: '7',
  color: 'color',
  variants: {
    ...variants,
    level: { 1: { size: '7' }, 2: { size: '6' }, 3: { size: '5' } },
  } as const,
})

/**
 * @catalog Body
 * @props tone · align · weight: regular|medium|bold · size: '3'..'5'
 * @example <Body tone="muted">{t('item.description')}</Body>
 */
export const Body = styled(SizableText, {
  name: 'Body',
  fontFamily: 'body',
  size: '4',
  color: 'color',
  variants,
})

/**
 * @catalog Caption
 * @props tone (défaut muted) · align · weight
 * @example <Caption>{formatRelative(item.created_at)}</Caption>
 */
export const Caption = styled(SizableText, {
  name: 'Caption',
  fontFamily: 'body',
  size: '2',
  color: 'color-8',
  variants,
})
