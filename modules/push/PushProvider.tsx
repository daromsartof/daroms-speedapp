import type { ModuleProviderProps } from '@daroms/app'
import { useUser } from '@daroms/data'
import * as Notifications from 'expo-notifications'
import { useRouter, type Href } from 'expo-router'
import { useEffect } from 'react'
import { Platform } from 'react-native'

import type { PushConfig } from './config'
import { usePushT } from './i18n'
import { configureNotifications, permissionGranted, registerForPush } from './notifications'

export function PushProvider(props: ModuleProviderProps<PushConfig>) {
  // pas de notifications push sur le web (aperçu, captures)
  return Platform.OS === 'web' ? props.children : <NativePush {...props} />
}

function NativePush({ children, config }: ModuleProviderProps<PushConfig>) {
  const t = usePushT()
  const user = useUser()
  const router = useRouter()

  useEffect(() => configureNotifications(t('channel')), [t])

  useEffect(() => {
    if (!user) return
    void permissionGranted().then((granted) => {
      if (granted || config.askOnLaunch) void registerForPush().catch(() => undefined)
    })
  }, [user, config.askOnLaunch])

  // toucher une notification ouvre data.url (lien interne de l'app)
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url
      if (typeof url === 'string' && url.startsWith('/')) router.push(url as Href)
    })
    return () => sub.remove()
  }, [router])

  return children
}
