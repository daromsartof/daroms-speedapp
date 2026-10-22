export interface KeyValueStore {
  getString(key: string): string | undefined
  set(key: string, value: string): void
  remove(key: string): void
}

export function memoryStore(): KeyValueStore {
  const map = new Map<string, string>()
  return { getString: (k) => map.get(k), set: (k, v) => void map.set(k, v), remove: (k) => void map.delete(k) }
}
