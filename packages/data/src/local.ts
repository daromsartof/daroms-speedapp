// Table locale (appareil : MMKV, sinon kv-store) aux lignes identiques à Supabase (id, created_at,
// updated_at). Passer à Supabase = régénérer api.ts sans --local : hooks et écrans ne changent pas.
import { createId } from '@daroms/lib/id'
import { storage as appStorage, type Storage } from '@daroms/lib/storage'
import type { ZodType } from 'zod'

import { AppError } from './errors'
import { parseOrThrow } from './helpers'

export type LocalRow = { id: string; created_at: string; updated_at: string }

type LocalStore = Pick<Storage, 'getJSON' | 'setJSON' | 'remove'>

const defined = <T extends object>(values: T) => Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined))

/**
 * Collection locale validée par zod. Les valeurs par défaut viennent du schéma de ligne
 * (`.default()`), comme le ferait Postgres. Une ligne invalide lève une AppError `validation`
 * au lieu d'être perdue en silence (rien n'est réécrit tant que la lecture échoue).
 */
export function localTable<Row extends LocalRow, Input = Row>(name: string, schema: ZodType<Row, Input>, store: LocalStore = appStorage) {
  type Values = Omit<Input, keyof LocalRow>
  const key = `table.${name}`
  const read = (): Row[] => parseOrThrow(schema.array(), store.getJSON<unknown>(key) ?? [])
  const write = (rows: Row[]) => store.setJSON(key, rows)
  const find = (rows: Row[], id: string): Row => {
    const row = rows.find((r) => r.id === id)
    if (!row) throw new AppError('notFound')
    return row
  }

  return {
    /** Toutes les lignes, plus récentes d'abord. */
    async list(): Promise<Row[]> {
      return read().sort((a, b) => b.created_at.localeCompare(a.created_at))
    },
    async get(id: string): Promise<Row> {
      return find(read(), id)
    },
    async insert(values: Values): Promise<Row> {
      const now = new Date().toISOString()
      const row = parseOrThrow(schema, { ...defined(values), id: createId(), created_at: now, updated_at: now })
      write([...read(), row])
      return row
    },
    async update(id: string, values: Partial<Values>): Promise<Row> {
      const rows = read()
      const row = parseOrThrow(schema, { ...find(rows, id), ...defined(values), id, updated_at: new Date().toISOString() })
      write(rows.map((r) => (r.id === id ? row : r)))
      return row
    },
    async remove(id: string): Promise<void> {
      const rows = read()
      find(rows, id)
      write(rows.filter((r) => r.id !== id))
    },
    /** Vide la table (réinitialisation, déconnexion). */
    async clear(): Promise<void> {
      store.remove(key)
    },
  }
}

export type LocalTable<Row extends LocalRow, Input = Row> = ReturnType<typeof localTable<Row, Input>>
