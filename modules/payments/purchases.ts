// Accès RevenueCat. Les clés publiques du SDK viennent de .env (EXPO_PUBLIC_REVENUECAT_*).
import { Platform } from 'react-native'
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases'

let configured = false

export function configurePurchases(): boolean {
  if (configured) return true
  const apiKey = Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  })
  if (!apiKey || Platform.OS === 'web') return false
  Purchases.configure({ apiKey })
  configured = true
  return true
}

export const purchasesReady = () => configured

export function hasEntitlement(info: CustomerInfo | null, entitlement: string): boolean {
  return Boolean(info?.entitlements.active[entitlement])
}

export async function loadPackages(offering?: string): Promise<PurchasesPackage[]> {
  if (!configured) return []
  const offerings = await Purchases.getOfferings()
  const current = offering ? offerings.all[offering] : offerings.current
  return current?.availablePackages ?? []
}

/** Achète un package ; renvoie null si l'utilisateur annule. */
export async function buy(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg)
    return customerInfo
  } catch (error) {
    if (typeof error === 'object' && error && 'userCancelled' in error && error.userCancelled) return null
    throw error
  }
}

export const restore = () => Purchases.restorePurchases()
export const manageSubscriptions = () => Purchases.showManageSubscriptions()
export { Purchases }
