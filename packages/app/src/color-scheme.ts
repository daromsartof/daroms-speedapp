import { useColorScheme } from 'react-native'

import { usePreferences } from './preferences'

/**
 * Mode clair/sombre : préférence utilisateur, sinon système.
 * Sur le web en dev, `?theme=dark` force le mode (captures `daroms shot`).
 */
export function useAppColorScheme(): 'light' | 'dark' {
  const system = useColorScheme()
  const preference = usePreferences((s) => s.colorScheme)
  if (typeof window !== 'undefined' && typeof window.location?.search === 'string') {
    const forced = new URLSearchParams(window.location.search).get('theme')
    if (forced === 'dark' || forced === 'light') return forced
  }
  if (preference !== 'system') return preference
  return system === 'dark' ? 'dark' : 'light'
}
