import { storage } from '@daroms/lib/storage'
import * as Sentry from '@sentry/react-native'
import { isRunningInExpoGo } from 'expo'

import type { CrashConfig } from './config'

const OPT_OUT = 'crash.enabled'

/** L'utilisateur peut couper l'envoi dans les réglages (actif par défaut). */
export function crashReportsEnabled(): boolean {
  return !storage.has(OPT_OUT) || storage.getBoolean(OPT_OUT)
}

export function setCrashReportsEnabled(enabled: boolean) {
  storage.setBoolean(OPT_OUT, enabled)
}

let started = false

/** Démarre Sentry au lancement ; sans EXPO_PUBLIC_SENTRY_DSN, le module ne fait rien. */
export function initCrash(config: CrashConfig) {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN
  if (!dsn) {
    if (__DEV__) console.warn('[crash] EXPO_PUBLIC_SENTRY_DSN absent : suivi des plantages désactivé')
    return
  }
  const expoGo = isRunningInExpoGo()
  Sentry.init({
    dsn,
    enabled: !__DEV__ || config.enableInDev,
    environment: __DEV__ ? 'development' : 'production',
    sendDefaultPii: config.sendDefaultPii,
    tracesSampleRate: config.tracesSampleRate,
    integrations: [Sentry.expoRouterIntegration({ enableTimeToInitialDisplay: !expoGo })],
    enableNativeFramesTracking: !expoGo,
    beforeSend: (event) => (crashReportsEnabled() ? event : null),
  })
  started = true
}

/** Signale une erreur attrapée par l'app (bloc catch) avec un contexte court ; sans effet si Sentry est inactif. */
export function reportError(error: unknown, context?: Record<string, string | number | boolean>) {
  if (!started) return
  Sentry.captureException(error, context ? { extra: context } : undefined)
}

/** Identifiant de l'utilisateur connecté sur les rapports (jamais l'e-mail sans sendDefaultPii). */
export function setCrashUser(id: string | undefined) {
  if (started) Sentry.setUser(id ? { id } : null)
}
