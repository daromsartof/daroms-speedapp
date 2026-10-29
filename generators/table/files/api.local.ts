// Données sur l'appareil (table locale). Passer à Supabase : relancer `bun daroms g table {{table}}`
// sans --local (mêmes hooks : les écrans ne changent pas ; données locales non migrées).
import { localTable, queryKeys } from '@daroms/data'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { {{Singular}}InputSchema, {{Singular}}Schema, type {{Singular}}Input } from './schema'

const table = localTable('{{table}}', {{Singular}}Schema)

export const {{camelPlural}}Keys = queryKeys('{{table}}')

export function use{{Plural}}() {
  return useQuery({ queryKey: {{camelPlural}}Keys.list(), queryFn: () => table.list() })
}

export function use{{Singular}}(id: string) {
  return useQuery({ queryKey: {{camelPlural}}Keys.detail(id), queryFn: () => table.get(id) })
}

export function useCreate{{Singular}}() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: {{Singular}}Input) => table.insert({{Singular}}InputSchema.parse(input)),
    onSuccess: () => client.invalidateQueries({ queryKey: {{camelPlural}}Keys.all }),
  })
}

export function useUpdate{{Singular}}() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<{{Singular}}Input> & { id: string }) =>
      table.update(id, {{Singular}}InputSchema.partial().parse(input)),
    onSuccess: () => client.invalidateQueries({ queryKey: {{camelPlural}}Keys.all }),
  })
}

export function useDelete{{Singular}}() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => table.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: {{camelPlural}}Keys.all }),
  })
}
