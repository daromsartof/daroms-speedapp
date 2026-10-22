import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

export type HapticKind = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error'

let enabled = true

/** Active ou coupe le retour haptique (réglage utilisateur). */
export function setHapticsEnabled(value: boolean) {
  enabled = value
}

export function hapticsEnabled() {
  return enabled
}

/** Retour haptique sans jamais lever d'erreur (web, simulateur, réglage coupé). */
export function haptic(kind: HapticKind = 'light'): void {
  if (!enabled || Platform.OS === 'web') return
  const run = () => {
    switch (kind) {
      case 'selection':
        return Haptics.selectionAsync()
      case 'success':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      case 'warning':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      case 'error':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      case 'medium':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      case 'heavy':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      default:
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }
  run().catch(() => undefined)
}
