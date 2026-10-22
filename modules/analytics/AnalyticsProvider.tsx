import type { ModuleProviderProps } from '@daroms/app'
import { usePathname } from 'expo-router'
import { useEffect } from 'react'
import { AppState } from 'react-native'

import type { AnalyticsConfig } from './config'
import { flush, setSink, trackScreen } from './tracker'

export function AnalyticsProvider({ children, config }: ModuleProviderProps<AnalyticsConfig>) {
  const pathname = usePathname()

  useEffect(() => {
    setSink(config.sink)
    const timer = setInterval(() => void flush(), config.flushIntervalMs)
    const sub = AppState.addEventListener('change', (state) => state !== 'active' && void flush())
    return () => {
      clearInterval(timer)
      sub.remove()
    }
  }, [config.sink, config.flushIntervalMs])

  useEffect(() => {
    if (config.screens) trackScreen(pathname)
  }, [config.screens, pathname])

  return children
}
