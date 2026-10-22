import { supabaseAuthStorage } from '@daroms/lib/storage'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { AppState, Platform } from 'react-native'

import { AppError } from './errors'
import type { AppDatabase, AppSupabaseClient } from './register'

type SupabaseEnv = { url?: string; key?: string }

let env: SupabaseEnv = {}
let client: AppSupabaseClient | undefined

/**
 * À appeler une fois au démarrage avec les variables publiques de l'app
 * (process.env.EXPO_PUBLIC_* n'est remplacé que dans le code de l'app).
 */
export function configureSupabase(next: SupabaseEnv) {
  env = next
  client = undefined
}

/** URL et clé publique (appels HTTP directs : edge functions en streaming). */
export function getSupabaseEnv(): { url: string; key: string } {
  if (!env.url || !env.key) throw new AppError('config', 'Supabase non configuré')
  return { url: env.url, key: env.key }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(env.url && env.key)
}

/** Client Supabase typé par les types générés de l'app. */
export function getSupabase(): AppSupabaseClient {
  if (client) return client
  if (!env.url || !env.key) {
    throw new AppError('config', 'EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_KEY manquants (.env)')
  }
  client = createClient<AppDatabase>(env.url, env.key, {
    auth: {
      storage: supabaseAuthStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      // PKCE : requis pour l'OAuth (Google) ouvert dans le navigateur système
      flowType: 'pkce',
    },
  })
  if (Platform.OS !== 'web') {
    // rafraîchit le jeton seulement quand l'app est au premier plan
    AppState.addEventListener('change', (state) => {
      if (state === 'active') void client?.auth.startAutoRefresh()
      else void client?.auth.stopAutoRefresh()
    })
  }
  return client
}

/** Alias court pour features/<x>/api.ts : `db().from('todos').select()`. */
export const db = getSupabase

/**
 * Client non typé pour les modules du cœur : leurs tables (profiles, push_tokens...)
 * ne figurent pas dans les types de l'app au moment où le cœur est compilé.
 */
export function moduleDb(): SupabaseClient {
  return getSupabase() as unknown as SupabaseClient
}
