// Erreurs applicatives : chaque erreur porte un code et une clé i18n affichable.
export type AppErrorCode =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'conflict'
  | 'validation'
  | 'rateLimit'
  | 'config'
  | 'unknown'

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly messageKey: string
  override readonly cause?: unknown

  constructor(code: AppErrorCode, detail?: string, cause?: unknown) {
    super(detail ?? code)
    this.name = 'AppError'
    this.code = code
    this.messageKey = `daroms:errors.${code === 'config' ? 'unknown' : code}`
    this.cause = cause
  }

  get retryable() {
    return this.code === 'network' || this.code === 'rateLimit' || this.code === 'unknown'
  }
}

type ErrorLike = { code?: unknown; status?: unknown; message?: unknown; name?: unknown }

const PG_CODES: Record<string, AppErrorCode> = {
  PGRST116: 'notFound',
  PGRST301: 'unauthorized',
  '23505': 'conflict',
  '23503': 'conflict',
  '23502': 'validation',
  '23514': 'validation',
  '22P02': 'validation',
  '42501': 'forbidden',
}

function fromStatus(status: number): AppErrorCode {
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'notFound'
  if (status === 409) return 'conflict'
  if (status === 400 || status === 422) return 'validation'
  if (status === 429) return 'rateLimit'
  return 'unknown'
}

/** Normalise n'importe quelle erreur (Postgrest, Auth, réseau, zod) en AppError. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error
  const e = (typeof error === 'object' && error !== null ? error : {}) as ErrorLike
  const message = typeof e.message === 'string' ? e.message : String(error)
  if (e.name === 'ZodError') return new AppError('validation', message, error)
  if (typeof e.code === 'string' && PG_CODES[e.code]) return new AppError(PG_CODES[e.code]!, message, error)
  if (typeof e.status === 'number') return new AppError(fromStatus(e.status), message, error)
  if (/network request failed|failed to fetch|network error|timeout/i.test(message)) {
    return new AppError('network', message, error)
  }
  return new AppError('unknown', message, error)
}

/** Renvoie `data` ou lève l'erreur Supabase normalisée. */
export function unwrap<T>(result: { data: T; error: unknown }): NonNullable<T> {
  if (result.error) throw toAppError(result.error)
  if (result.data === null || result.data === undefined) throw new AppError('notFound')
  return result.data as NonNullable<T>
}
