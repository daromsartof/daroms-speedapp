// Backend web (aperçu, captures) : localStorage, sinon mémoire.
import { memoryStore, type KeyValueStore } from './storage-memory'

export function createBackend(id: string): KeyValueStore {
  try {
    const local = globalThis.localStorage
    if (!local) return memoryStore()
    return {
      getString: (k) => local.getItem(`${id}:${k}`) ?? undefined,
      set: (k, v) => local.setItem(`${id}:${k}`, v),
      remove: (k) => local.removeItem(`${id}:${k}`),
    }
  } catch {
    return memoryStore()
  }
}
