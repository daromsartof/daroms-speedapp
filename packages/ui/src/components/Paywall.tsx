import { useDaromsT } from '@daroms/i18n'
import { haptic } from '@daroms/lib/haptics'
import { Linking } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { Check, Crown, X } from '../icons'
import { Badge } from './Badge'
import { Button } from './Button'
import { IconButton } from './IconButton'
import { Screen } from './Screen'
import { Body, Caption, Heading, Title } from './Text'

export type PaywallPlan = {
  id: string
  title: string
  /** Prix localisé fourni par le store (ex. « 4,99 € »). */
  price: string
  period?: 'week' | 'month' | 'year' | 'lifetime'
  badge?: string
  trialDays?: number
}

export type PaywallProps = {
  title: string
  subtitle?: string
  features: string[]
  plans: PaywallPlan[]
  selectedId: string | undefined
  onSelect: (id: string) => void
  ctaLabel: string
  onPurchase: () => void
  onRestore?: () => void
  onClose?: () => void
  purchasing?: boolean
  termsUrl?: string
  privacyUrl?: string
}

/**
 * @catalog Paywall
 * @props title · subtitle · features[] · plans[{id,title,price,period,badge,trialDays}] · selectedId · onSelect · ctaLabel · onPurchase · onRestore · onClose · purchasing · termsUrl · privacyUrl
 * @example <Paywall {...paywall} /> (branché par le module payments)
 */
export function Paywall(props: PaywallProps) {
  const t = useDaromsT()
  const { plans, selectedId, onSelect } = props
  return (
    <Screen
      header={props.onClose ? <XStack justify="flex-end" px="tight"><IconButton icon={X} label={t('a11y.close')} onPress={props.onClose} /></XStack> : undefined}
      footer={
        <>
          <Button fullWidth loading={props.purchasing} haptic="medium" onPress={props.onPurchase}>
            {props.ctaLabel}
          </Button>
          {props.onRestore ? <Button variant="ghost" size="sm" onPress={props.onRestore}>{t('actions.restore')}</Button> : null}
        </>
      }
    >
      <YStack items="center" gap="stack" pt="section">
        <YStack theme="brand" bg="background" w="16" h="16" rounded="pill" items="center" justify="center">
          <Crown size="8" color="color" />
        </YStack>
        <Title align="center">{props.title}</Title>
        {props.subtitle ? <Body tone="muted" align="center">{props.subtitle}</Body> : null}
      </YStack>
      <YStack gap="inline" py="stack">
        {props.features.map((feature) => (
          <XStack key={feature} gap="inline" items="center">
            <Check size="5" color="emerald-500" />
            <Body flex={1}>{feature}</Body>
          </XStack>
        ))}
      </YStack>
      <YStack gap="inline" role="radiogroup">
        {plans.map((plan) => {
          const selected = plan.id === selectedId
          return (
            <XStack
              key={plan.id}
              role="radio"
              aria-checked={selected}
              p="stack"
              gap="inline"
              items="center"
              rounded="card"
              bg="card"
              borderWidth={2}
              borderColor={selected ? 'brand-500' : 'separator'}
              onPress={() => { haptic('selection'); onSelect(plan.id) }}
            >
              <YStack flex={1} gap="0-5">
                <Heading level={3}>{plan.title}</Heading>
                {plan.trialDays ? <Caption tone="success">{t('paywall.trial', { days: plan.trialDays })}</Caption> : null}
              </YStack>
              {plan.badge ? <Badge tone="brand">{plan.badge}</Badge> : null}
              <Body weight="bold">{plan.period && plan.period !== 'lifetime' ? t('paywall.perPeriod', { price: plan.price, period: t(`paywall.${plan.period}`) }) : plan.price}</Body>
            </XStack>
          )
        })}
      </YStack>
      <Caption align="center">{t('paywall.legal')}</Caption>
      <XStack justify="center" gap="section">
        {props.termsUrl ? <Caption tone="brand" onPress={() => void Linking.openURL(props.termsUrl!)}>{t('paywall.terms')}</Caption> : null}
        {props.privacyUrl ? <Caption tone="brand" onPress={() => void Linking.openURL(props.privacyUrl!)}>{t('paywall.privacy')}</Caption> : null}
      </XStack>
    </Screen>
  )
}
