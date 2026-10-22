/** Identifiant unique (données locales, clés de liste) : UUID si disponible, sinon horodatage + aléa. */
export function createId(): string {
  const crypto = globalThis.crypto as { randomUUID?: () => string } | undefined
  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
