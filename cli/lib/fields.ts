// Champs de table : « title:text, done:bool=false, due_at:timestamptz? »
import { fail } from './log'

type TypeSpec = { sql: string; ts: string; zod: string }

const TYPES: Record<string, TypeSpec> = {
  text: { sql: 'text', ts: 'string', zod: 'z.string()' },
  int: { sql: 'integer', ts: 'number', zod: 'z.number().int()' },
  bigint: { sql: 'bigint', ts: 'number', zod: 'z.number().int()' },
  numeric: { sql: 'numeric', ts: 'number', zod: 'z.number()' },
  float: { sql: 'double precision', ts: 'number', zod: 'z.number()' },
  bool: { sql: 'boolean', ts: 'boolean', zod: 'z.boolean()' },
  date: { sql: 'date', ts: 'string', zod: 'z.string()' },
  timestamptz: { sql: 'timestamptz', ts: 'string', zod: 'z.string()' },
  uuid: { sql: 'uuid', ts: 'string', zod: 'z.string().uuid()' },
  jsonb: { sql: 'jsonb', ts: 'Json', zod: 'z.unknown()' },
  'text[]': { sql: 'text[]', ts: 'string[]', zod: 'z.array(z.string())' },
}

export type Field = { name: string; type: string; nullable: boolean; defaultValue?: string; spec: TypeSpec }

export function parseFields(input: string): Field[] {
  return input
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = /^([a-z][a-z0-9_]*):([a-z[\]]+?)(\?)?(?:=(.+))?$/.exec(part)
      if (!match) fail(`champ invalide « ${part} » (format nom:type[?][=défaut])`)
      const [, name, type, optional, defaultValue] = match
      const spec = TYPES[type!] ?? fail(`type inconnu « ${type} » (${Object.keys(TYPES).join(', ')})`)
      return { name: name!, type: type!, nullable: Boolean(optional), defaultValue, spec }
    })
}

const sqlDefault = (field: Field) => {
  if (field.defaultValue === undefined) return ''
  const raw = field.defaultValue
  const literal = field.spec.ts === 'string' && !/\(\)$/.test(raw) ? `'${raw.replace(/'/g, "''")}'` : raw
  return ` default ${literal}`
}

export const sqlColumn = (f: Field) => `  ${f.name} ${f.spec.sql}${f.nullable ? '' : ' not null'}${sqlDefault(f)},`

export const zodRow = (f: Field) => `  ${f.name}: ${f.spec.zod}${f.nullable ? '.nullable()' : ''},`

export function zodInput(f: Field): string {
  let schema = f.spec.zod
  if (f.type === 'text' && !f.nullable) schema = "z.string().trim().min(1, 'daroms:validation.required')"
  if (f.nullable) schema += '.nullable().optional()'
  else if (f.defaultValue !== undefined) schema += '.optional()'
  return `  ${f.name}: ${schema},`
}
