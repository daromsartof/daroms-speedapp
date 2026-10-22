// Stockage clé/valeur synchrone. Backend choisi par plateforme (storage-backend.ts / .web.ts).
import type { ZodType } from 'zod'

import { createBackend } from './storage-backend'

export type { KeyValueStore } from './storage-memory'

export function createStorage(id = 'daroms') {
  const backend = createBackend(id)
  return {
    getString: (key: string) => backend.getString(key),
    setString: (key: string, value: string) => backend.set(key, value),
    remove: (key: string) => backend.remove(key),
    has: (key: string) => backend.getString(key) !== undefined,
    getBoolean: (key: string) => backend.getString(key) === 'true',
    setBoolean: (key: string, value: boolean) => backend.set(key, String(value)),
    /** Lit un JSON ; renvoie undefined si absent ou invalide (validation zod optionnelle). */
    getJSON<T>(key: string, schema?: ZodType<T>): T | undefined {
      const raw = backend.getString(key)
      if (raw === undefined) return undefined
      try {
        const value: unknown = JSON.parse(raw)
        if (!schema) return value as T
        const parsed = schema.safeParse(value)
        return parsed.success ? parsed.data : undefined
      } catch {
        return undefined
      }
    },
    setJSON: (key: string, value: unknown) => backend.set(key, JSON.stringify(value)),
  }
}

export type Storage = ReturnType<typeof createStorage>

/** Instance partagée de l'app. */
export const storage = createStorage()

/** Adaptateur pour `persist` de Zustand. */
export const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.setString(name, value),
  removeItem: (name: string) => storage.remove(name),
}

/** Adaptateur pour la session Supabase (auth.storage). */
export const supabaseAuthStorage = {
  getItem: async (key: string) => storage.getString(key) ?? null,
  setItem: async (key: string, value: string) => storage.setString(key, value),
  removeItem: async (key: string) => storage.remove(key),
}
