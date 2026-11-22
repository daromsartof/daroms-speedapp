import type { ModuleProviderProps } from '@daroms/app'
import { useUser } from '@daroms/data'
import { ErrorState } from '@daroms/ui'
import * as Sentry from '@sentry/react-native'
import { useEffect } from 'react'

import type { CrashConfig } from './config'
import { setCrashUser } from './sentry'

/** Rattache l'utilisateur aux rapports, enregistre les appuis et remplace un écran qui plante par un état d'erreur. */
export function CrashProvider({ children }: ModuleProviderProps<CrashConfig>) {
  const user = useUser()
  useEffect(() => setCrashUser(user?.id), [user?.id])
  return (
    <Sentry.TouchEventBoundary>
      <Sentry.ErrorBoundary fallback={({ resetError }) => <ErrorState onRetry={resetError} />}>{children}</Sentry.ErrorBoundary>
    </Sentry.TouchEventBoundary>
  )
}
