// Aides pour features/<x>/api.ts : validation zod et clés de requêtes.
import type { ZodType } from 'zod'

import { AppError } from './errors'

/** Valide une réponse ; une donnée inattendue devient une AppError `validation`. */
export function parseOrThrow<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) throw new AppError('validation', result.error.message, result.error)
  return result.data
}

/** Clés de requêtes homogènes par feature. */
export function queryKeys<const Feature extends string>(feature: Feature) {
  return {
    all: [feature] as const,
    list: (params: Record<string, unknown> = {}) => [feature, 'list', params] as const,
    detail: (id: string) => [feature, 'detail', id] as const,
  }
}
