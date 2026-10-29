// Types `src/types/db.ts` hors ligne, au format de `supabase gen types`, depuis
// supabase/daroms-schema.json (tables créées par `daroms g table`). `daroms db types`
// les remplace par les types réels dès qu'un projet Supabase est lié.
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import type { Field } from './fields'
import { readJson, writeFile, writeJson } from './fsx'

/** `local: true` : table sur l'appareil (g table --local), absente de Postgres et des types db.ts. */
export type SchemaFile = { tables: Record<string, { local?: boolean; fields: Pick<Field, 'name' | 'type' | 'nullable' | 'defaultValue'>[] }> }

const TS: Record<string, string> = {
  text: 'string', int: 'number', bigint: 'number', numeric: 'number', float: 'number', bool: 'boolean',
  date: 'string', timestamptz: 'string', uuid: 'string', jsonb: 'Json', 'text[]': 'string[]',
}

export function schemaPath(root: string) {
  return join(root, 'supabase', 'daroms-schema.json')
}

export function readSchema(root: string): SchemaFile {
  return existsSync(schemaPath(root)) ? readJson<SchemaFile>(schemaPath(root)) : { tables: {} }
}

export function saveSchema(root: string, schema: SchemaFile) {
  writeJson(schemaPath(root), schema)
}

const never = '{ [_ in never]: never }'

export function renderDbTypes(schema: SchemaFile): string {
  const tables = Object.entries(schema.tables).filter(([, t]) => !t.local).map(([name, { fields }]) => {
    const base = [
      { name: 'id', ts: 'string', optional: true, nullable: false },
      { name: 'user_id', ts: 'string', optional: true, nullable: false },
      ...fields.map((f) => ({ name: f.name, ts: TS[f.type] ?? 'unknown', optional: f.nullable || f.defaultValue !== undefined, nullable: f.nullable })),
      { name: 'created_at', ts: 'string', optional: true, nullable: false },
      { name: 'updated_at', ts: 'string', optional: true, nullable: false },
    ]
    const type = (c: (typeof base)[number]) => `${c.ts}${c.nullable ? ' | null' : ''}`
    const row = base.map((c) => `          ${c.name}: ${type(c)}`).join('\n')
    const insert = base.map((c) => `          ${c.name}${c.optional ? '?' : ''}: ${type(c)}`).join('\n')
    const update = base.map((c) => `          ${c.name}?: ${type(c)}`).join('\n')
    return `      ${name}: {\n        Row: {\n${row}\n        }\n        Insert: {\n${insert}\n        }\n        Update: {\n${update}\n        }\n        Relationships: []\n      }`
  })
  return [
    '// généré par daroms (g table / db types) : ne pas modifier à la main',
    'export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]',
    '',
    'export type Database = {',
    '  public: {',
    `    Tables: ${tables.length ? `{\n${tables.join('\n')}\n    }` : never}`,
    `    Views: ${never}`,
    `    Functions: ${never}`,
    `    Enums: ${never}`,
    `    CompositeTypes: ${never}`,
    '  }',
    '}',
    '',
  ].join('\n')
}

export function writeDbTypes(root: string) {
  writeFile(join(root, 'src', 'types', 'db.ts'), renderDbTypes(readSchema(root)))
}
