import { useGate, type ModuleProviderProps } from '@daroms/app'
import { useSession } from '@daroms/data'
import type { Href } from 'expo-router'

import type { AuthConfig } from './config'

export const AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password']

/** Gate de connexion (priorité 20 : après l'onboarding, avant le paywall). */
export function AuthProvider({ children, config }: ModuleProviderProps<AuthConfig>) {
  const { session, loading } = useSession()
  useGate('auth', 20, {
    ready: !loading,
    redirect: config.requireAuth && !session ? ('/sign-in' as Href) : null,
    allow: AUTH_ROUTES,
  })
  return children
}
