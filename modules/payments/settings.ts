import { useDaromsT } from '@daroms/i18n'
import type { SettingsSection } from '@daroms/ui'
import { notify } from '@daroms/ui'
import { Crown, CreditCard, RefreshCw } from '@daroms/ui/icons'
import { useRouter, type Href } from 'expo-router'

import { usePaymentsT } from './i18n'
import { usePro } from './PaymentsProvider'
import { manageSubscriptions, purchasesReady, restore } from './purchases'

export function usePaymentsSettings(): SettingsSection[] {
  const t = usePaymentsT()
  const core = useDaromsT()
  const router = useRouter()
  const { isPro, setCustomerInfo } = usePro()
  if (!purchasesReady()) return []
  return [
    {
      key: 'payments',
      title: t('section'),
      items: [
        { key: 'status', label: t('status'), icon: Crown, value: isPro ? t('pro') : t('free') },
        isPro
          ? { key: 'manage', label: t('manage'), icon: CreditCard, type: 'link', onPress: () => void manageSubscriptions() }
          : { key: 'upgrade', label: t('upgrade'), icon: CreditCard, type: 'link', onPress: () => router.push('/paywall' as Href) },
        {
          key: 'restore',
          label: core('actions.restore'),
          icon: RefreshCw,
          type: 'action',
          onPress: () =>
            void restore().then((info) => {
              setCustomerInfo(info)
              notify.success(Object.keys(info.entitlements.active).length ? t('restored') : t('nothingToRestore'))
            }),
        },
      ],
    },
  ]
}
