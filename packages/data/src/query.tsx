import { focusManager, onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { addNetworkStateListener } from 'expo-network'
import { useEffect, useState, type ReactNode } from 'react'
import { AppState, Platform } from 'react-native'

import { toAppError } from './errors'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failures, error) => failures < 2 && toAppError(error).retryable,
      },
      mutations: { retry: 0 },
    },
  })
}

function useNativeManagers() {
  useEffect(() => {
    if (Platform.OS === 'web') return undefined
    const appState = AppState.addEventListener('change', (state) => focusManager.setFocused(state === 'active'))
    onlineManager.setEventListener((setOnline) => {
      const sub = addNetworkStateListener((state) => setOnline(state.isConnected !== false))
      return () => sub.remove()
    })
    return () => appState.remove()
  }, [])
}

export function QueryProvider({ children, client }: { children: ReactNode; client?: QueryClient }) {
  const [queryClient] = useState(() => client ?? createQueryClient())
  useNativeManagers()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
