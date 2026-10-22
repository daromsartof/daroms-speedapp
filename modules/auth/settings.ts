import { useTranslateKey } from '@daroms/i18n'
import type { SettingsSection } from '@daroms/ui'
import { notify } from '@daroms/ui'
import { LogOut, Trash2 } from '@daroms/ui/icons'
import { useSession } from '@daroms/data'
import { Alert } from 'react-native'

import { authErrorKey, deleteAccount, signOut } from './api'
import { useAuthT } from './i18n'

/** Section Compte de l'écran Réglages : déconnexion et suppression (obligatoire App Store). */
export function useAuthSettings(): SettingsSection[] {
  const t = useAuthT()
  const translate = useTranslateKey()
  const { session } = useSession()
  if (!session) return []
  const confirmDelete = () =>
    Alert.alert(t('account.deleteTitle'), t('account.deleteDescription'), [
      { text: translate('daroms:actions.cancel'), style: 'cancel' },
      {
        text: translate('daroms:actions.delete'),
        style: 'destructive',
        onPress: () =>
          void deleteAccount()
            .then(() => notify.success(t('account.deleted')))
            .catch((error: unknown) => notify.error(translate(authErrorKey(error)))),
      },
    ])
  return [
    {
      key: 'account',
      title: t('account.section'),
      items: [
        { key: 'email', label: session.user.email ?? '', type: 'action' },
        { key: 'sign-out', label: t('account.signOut'), icon: LogOut, type: 'action', onPress: () => void signOut() },
        { key: 'delete', label: t('account.delete'), icon: Trash2, type: 'action', destructive: true, onPress: confirmDelete },
      ],
    },
  ]
}
