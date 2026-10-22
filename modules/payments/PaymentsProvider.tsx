import { useGate, type ModuleProviderProps } from '@daroms/app'
import { useUser } from '@daroms/data'
import type { Href } from 'expo-router'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { CustomerInfo } from 'react-native-purchases'

import type { PaymentsConfig } from './config'
import { configurePurchases, hasEntitlement, Purchases } from './purchases'

type PaymentsState = { ready: boolean; isPro: boolean; customerInfo: CustomerInfo | null; setCustomerInfo: (info: CustomerInfo) => void }

const PaymentsContext = createContext<PaymentsState>({ ready: false, isPro: false, customerInfo: null, setCustomerInfo: () => undefined })

/** Statut Pro (entitlement RevenueCat actif). */
export function usePro() {
  return useContext(PaymentsContext)
}

/** Gate (30) : en mode hard, paywall obligatoire une fois connecté. */
export function PaymentsProvider({ children, config }: ModuleProviderProps<PaymentsConfig>) {
  const user = useUser()
  const [enabled] = useState(configurePurchases)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [ready, setReady] = useState(!enabled)

  useEffect(() => {
    if (!enabled) return undefined
    const listener = (info: CustomerInfo) => setCustomerInfo(info)
    Purchases.addCustomerInfoUpdateListener(listener)
    void Purchases.getCustomerInfo()
      .then(setCustomerInfo)
      .finally(() => setReady(true))
    return () => void Purchases.removeCustomerInfoUpdateListener(listener)
  }, [enabled])

  useEffect(() => {
    if (!enabled || !user) return
    void Purchases.logIn(user.id).then(({ customerInfo: info }) => setCustomerInfo(info))
  }, [enabled, user])

  const isPro = hasEntitlement(customerInfo, config.entitlement)
  useGate('payments', 30, {
    ready,
    redirect: config.mode === 'hard' && enabled && !isPro ? ('/paywall' as Href) : null,
    allow: ['/paywall', '/sign-in', '/sign-up', '/forgot-password', '/onboarding'],
  })
  const value = useMemo(() => ({ ready, isPro, customerInfo, setCustomerInfo }), [ready, isPro, customerInfo])
  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>
}
