// Backend natif : MMKV (build de dev/prod), sinon expo-sqlite/kv-store (Expo Go), sinon mémoire.
/* eslint-disable @typescript-eslint/no-require-imports */
import { memoryStore, type KeyValueStore } from './storage-memory'

export function createBackend(id: string): KeyValueStore {
  if (process.env.NODE_ENV === 'test') return memoryStore()
  try {
    const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv')
    const mmkv = createMMKV({ id })
    return { getString: (k) => mmkv.getString(k), set: (k, v) => mmkv.set(k, v), remove: (k) => void mmkv.remove(k) }
  } catch {
    try {
      const { Storage } = require('expo-sqlite/kv-store') as typeof import('expo-sqlite/kv-store')
      return {
        getString: (k) => Storage.getItemSync(`${id}:${k}`) ?? undefined,
        set: (k, v) => Storage.setItemSync(`${id}:${k}`, v),
        remove: (k) => void Storage.removeItemSync(`${id}:${k}`),
      }
    } catch {
      return memoryStore()
    }
  }
}
