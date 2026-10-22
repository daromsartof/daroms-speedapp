// Préférences utilisateur persistées (MMKV) : thème, haptique, langue.
import { setHapticsEnabled } from '@daroms/lib/haptics'
import { zustandStorage } from '@daroms/lib/storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type ColorSchemePreference = 'system' | 'light' | 'dark'

type Preferences = {
  colorScheme: ColorSchemePreference
  haptics: boolean
  language: string | null
  setColorScheme: (value: ColorSchemePreference) => void
  setHaptics: (value: boolean) => void
  setLanguage: (value: string | null) => void
}

export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      colorScheme: 'system',
      haptics: true,
      language: null,
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setHaptics: (haptics) => {
        setHapticsEnabled(haptics)
        set({ haptics })
      },
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'daroms.preferences',
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({ colorScheme, haptics, language }) => ({ colorScheme, haptics, language }),
      onRehydrateStorage: () => (state) => setHapticsEnabled(state?.haptics ?? true),
    },
  ),
)
