import { parseOrThrow, queryKeys } from '@daroms/data'
import { useQuery } from '@tanstack/react-query'

import { {{Name}}ItemSchema } from './schema'

export const {{camel}}Keys = queryKeys('{{slug}}')

/** Données de l'écran. Remplacer par un appel Supabase : db().from('<table>').select('*'). */
export function use{{Name}}Query() {
  return useQuery({
    queryKey: {{camel}}Keys.list(),
    queryFn: async () => parseOrThrow({{Name}}ItemSchema.array(), []),
  })
}
