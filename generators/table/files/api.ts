import { db, parseOrThrow, queryKeys, toAppError, unwrap } from '@daroms/data'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { {{Singular}}InputSchema, {{Singular}}Schema, type {{Singular}}Input } from './schema'

export const {{camelPlural}}Keys = queryKeys('{{table}}')

export function use{{Plural}}() {
  return useQuery({
    queryKey: {{camelPlural}}Keys.list(),
    queryFn: async () =>
      parseOrThrow({{Singular}}Schema.array(), unwrap(await db().from('{{table}}').select('*').order('created_at', { ascending: false }))),
  })
}

export function use{{Singular}}(id: string) {
  return useQuery({
    queryKey: {{camelPlural}}Keys.detail(id),
    queryFn: async () => parseOrThrow({{Singular}}Schema, unwrap(await db().from('{{table}}').select('*').eq('id', id).single())),
  })
}

export function useCreate{{Singular}}() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: {{Singular}}Input) => {
      const values = {{Singular}}InputSchema.parse(input)
      return parseOrThrow({{Singular}}Schema, unwrap(await db().from('{{table}}').insert(values).select().single()))
    },
    onSuccess: () => client.invalidateQueries({ queryKey: {{camelPlural}}Keys.all }),
  })
}

export function useUpdate{{Singular}}() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<{{Singular}}Input> & { id: string }) => {
      const values = {{Singular}}InputSchema.partial().parse(input)
      return parseOrThrow({{Singular}}Schema, unwrap(await db().from('{{table}}').update(values).eq('id', id).select().single()))
    },
    onSuccess: () => client.invalidateQueries({ queryKey: {{camelPlural}}Keys.all }),
  })
}

export function useDelete{{Singular}}() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db().from('{{table}}').delete().eq('id', id)
      if (error) throw toAppError(error)
    },
    onSuccess: () => client.invalidateQueries({ queryKey: {{camelPlural}}Keys.all }),
  })
}
