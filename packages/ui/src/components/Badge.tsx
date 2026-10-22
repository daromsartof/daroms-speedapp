import { SizableText, XStack, type ThemeName } from 'tamagui'

export type BadgeTone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger'

const THEMES: Record<BadgeTone, ThemeName | undefined> = {
  neutral: 'level2',
  brand: 'soft',
  accent: 'accent',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
}

/**
 * @catalog Badge
 * @props tone: neutral|brand|accent|success|warning|danger · children (texte court)
 * @example <Badge tone="success">{t('order.paid')}</Badge>
 */
export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: string | number }) {
  return (
    <XStack theme={THEMES[tone]} bg="background" rounded="badge" px="2" py="0-5" self="flex-start">
      <SizableText size="1" fontWeight="600" color="color">
        {children}
      </SizableText>
    </XStack>
  )
}
