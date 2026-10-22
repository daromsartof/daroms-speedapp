import { storage } from '@daroms/lib/storage'
import { useSyncExternalStore } from 'react'

const key = (version: number) => `onboarding.done.v${version}`
const listeners = new Set<() => void>()

export function markOnboardingDone(version: number) {
  storage.setBoolean(key(version), true)
  for (const listener of listeners) listener()
}

/** Onboarding déjà vu pour cette version (lecture synchrone MMKV). */
export function useOnboardingDone(version: number): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => storage.getBoolean(key(version)),
  )
}
