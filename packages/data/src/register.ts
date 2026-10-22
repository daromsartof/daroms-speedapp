import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * L'app enregistre ses types générés (`supabase gen types`) :
 *   declare module '@daroms/data' { interface Register { database: Database } }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Register {}

type EmptySchema = {
  Tables: Record<never, never>
  Views: Record<never, never>
  Functions: Record<never, never>
  Enums: Record<never, never>
  CompositeTypes: Record<never, never>
}

export type FallbackDatabase = { public: EmptySchema }

export type AppDatabase = Register extends { database: infer D } ? D : FallbackDatabase

export type AppSupabaseClient = SupabaseClient<AppDatabase>
