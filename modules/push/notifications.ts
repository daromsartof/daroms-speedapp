import { moduleDb } from '@daroms/data'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

export function configureNotifications(channelName: string) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  })
  if (Platform.OS === 'android') {
    void Notifications.setNotificationChannelAsync('default', { name: channelName, importance: Notifications.AndroidImportance.DEFAULT })
  }
}

export async function permissionGranted(): Promise<boolean> {
  if (Platform.OS === 'web') return false
  return (await Notifications.getPermissionsAsync()).granted
}

/** Demande la permission puis enregistre le jeton Expo pour l'utilisateur connecté. */
export async function registerForPush(): Promise<boolean> {
  if (Platform.OS === 'web' || !Device.isDevice) return false
  let granted = await permissionGranted()
  if (!granted) granted = (await Notifications.requestPermissionsAsync()).granted
  if (!granted) return false
  const projectId = (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId
  const { data: token } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)
  const { error } = await moduleDb()
    .from('push_tokens')
    .upsert({ token, platform: Platform.OS, updated_at: new Date().toISOString() })
  if (error) throw error
  return true
}
