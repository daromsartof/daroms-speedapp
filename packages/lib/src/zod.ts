// Schémas zod partagés. Les messages sont des clés i18n du namespace daroms.
import { z } from 'zod'

export const zEmail = z.string().trim().toLowerCase().email('daroms:validation.email')
export const zPassword = z.string().min(8, 'daroms:validation.passwordMin')
export const zRequired = z.string().trim().min(1, 'daroms:validation.required')
export const zUuid = z.string().uuid('daroms:validation.invalid')
export const zUrl = z.string().url('daroms:validation.url')
export const zIsoDate = z.string().datetime({ offset: true, message: 'daroms:validation.date' })
export const zMoney = z.number().nonnegative('daroms:validation.positive').multipleOf(0.01)
export const zPositiveInt = z.number().int().positive('daroms:validation.positive')

/** Champs communs des lignes Supabase. */
export const zRow = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
})

export { z }
