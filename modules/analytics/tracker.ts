// File d'attente d'événements, envoyée par lots (peu de requêtes, pas de perte en arrière-plan).
import { getSupabase, isSupabaseConfigured, moduleDb } from '@daroms/data'
import { storage } from '@daroms/lib/storage'
import { Platform } from 'react-native'

import type { AnalyticsConfig } from './config'

type Props = Record<string, string | number | boolean | null>
type Event = { name: string; props: Props; created_at: string }

const queue: Event[] = []
let sink: AnalyticsConfig['sink'] = 'console'

function anonymousId(): string {
  const existing = storage.getString('analytics.anonymousId')
  if (existing) return existing
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  storage.setString('analytics.anonymousId', id)
  return id
}

export function setSink(value: AnalyticsConfig['sink']) {
  sink = value
}

/** Enregistre un événement (nom court en snake_case, propriétés simples). */
export function track(name: string, props: Props = {}) {
  queue.push({ name, props, created_at: new Date().toISOString() })
  if (queue.length >= 20) void flush()
}

export function trackScreen(path: string) {
  track('screen_view', { path })
}

export async function flush() {
  if (queue.length === 0) return
  const batch = queue.splice(0, queue.length)
  if (sink === 'console' || !isSupabaseConfigured()) {
    if (__DEV__) console.log('[analytics]', batch.map((e) => e.name).join(', '))
    return
  }
  const { data } = await getSupabase().auth.getSession()
  const rows = batch.map((e) => ({ ...e, user_id: data.session?.user.id ?? null, anonymous_id: anonymousId(), platform: Platform.OS }))
  const { error } = await moduleDb().from('analytics_events').insert(rows)
  if (error) queue.unshift(...batch.slice(-100))
}
