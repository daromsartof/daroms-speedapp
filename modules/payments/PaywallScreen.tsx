import { useModuleConfig } from '@daroms/app'
import { useT, useTranslateKey } from '@daroms/i18n'
import { getManifest } from '@daroms/lib/manifest'
import { ErrorState, notify, Paywall, Screen, SkeletonList, type PaywallPlan } from '@daroms/ui'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import type { PurchasesPackage } from 'react-native-purchases'

import type { PaymentsConfig } from './config'
import { usePaymentsT } from './i18n'
import { usePro } from './PaymentsProvider'
import { buy, loadPackages, restore } from './purchases'

const PERIOD: Record<string, PaywallPlan['period']> = { WEEKLY: 'week', MONTHLY: 'month', ANNUAL: 'year', LIFETIME: 'lifetime' }

function toPlan(pkg: PurchasesPackage): PaywallPlan {
  const intro = pkg.product.introPrice
  return {
    id: pkg.identifier,
    title: pkg.product.title,
    price: pkg.product.priceString,
    period: PERIOD[pkg.packageType],
    trialDays: intro && intro.price === 0 ? intro.periodNumberOfUnits * (intro.periodUnit === 'WEEK' ? 7 : intro.periodUnit === 'MONTH' ? 30 : 1) : undefined,
  }
}

export function PaywallScreen() {
  const config = useModuleConfig<PaymentsConfig>('payments')
  const t = useT() as unknown as (key: string) => string
  const tp = usePaymentsT()
  const translate = useTranslateKey()
  const router = useRouter()
  const { setCustomerInfo } = usePro()
  const packages = useQuery({ queryKey: ['payments', 'packages', config.offering], queryFn: () => loadPackages(config.offering) })
  const [selected, setSelected] = useState<string>()
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'))
  const purchase = useMutation({
    mutationFn: (pkg: PurchasesPackage) => buy(pkg),
    onSuccess: (info) => {
      if (!info) return
      setCustomerInfo(info)
      close()
    },
    onError: (error) => notify.error(translate((error as { messageKey?: string }).messageKey ?? 'daroms:errors.unknown')),
  })
  const restoreMutation = useMutation({
    mutationFn: restore,
    onSuccess: (info) => {
      setCustomerInfo(info)
      notify.success(Object.keys(info.entitlements.active).length ? tp('restored') : tp('nothingToRestore'))
    },
  })
  if (packages.isPending) return <Screen><SkeletonList rows={3} /></Screen>
  const list = packages.data ?? []
  if (packages.error || list.length === 0) return <Screen><ErrorState description={tp('unavailable')} onRetry={() => void packages.refetch()} /></Screen>
  const current = list.find((p) => p.identifier === selected) ?? list[0]!
  const { store } = getManifest()
  return (
    <Paywall
      title={t('paywall.title')}
      subtitle={t('paywall.subtitle')}
      features={config.features.map((key) => t(key))}
      plans={list.map(toPlan)}
      selectedId={current.identifier}
      onSelect={setSelected}
      ctaLabel={t('paywall.cta')}
      purchasing={purchase.isPending}
      onPurchase={() => purchase.mutate(current)}
      onRestore={() => restoreMutation.mutate()}
      onClose={config.mode === 'soft' ? close : undefined}
      termsUrl={store.termsUrl}
      privacyUrl={store.privacyUrl}
    />
  )
}
