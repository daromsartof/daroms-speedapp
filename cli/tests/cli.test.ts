import { describe, expect, it } from 'bun:test'

import { bumpVersion, changelogSection } from '../commands/core'
import { parseArgs } from '../lib/args'
import { renderDbTypes } from '../lib/dbtypes'
import { localRowImports, parseFields, sqlColumn, zodInput, zodLocalRow } from '../lib/fields'
import { camel, pascal, render } from '../lib/fsx'
import { toTs } from '../lib/manifest'

describe('args', () => {
  it('lit positionnels, valeurs et drapeaux', () => {
    const args = parseArgs(['screen', 'profile', '--tab', '--icon', 'User', '--title=Profil'])
    expect(args._).toEqual(['screen', 'profile'])
    expect(args.flags).toEqual({ tab: true, icon: 'User', title: 'Profil' })
  })
})

describe('champs de table', () => {
  const fields = parseFields('title:text, done:bool=false, due_at:timestamptz?, note:text=vide')
  it('produit le SQL attendu', () => {
    expect(fields.map(sqlColumn)).toEqual([
      '  title text not null,',
      '  done boolean not null default false,',
      '  due_at timestamptz,',
      "  note text not null default 'vide',",
    ])
  })
  it('produit la validation de saisie', () => {
    expect(zodInput(fields[0]!)).toContain("min(1, 'daroms:validation.required')")
    expect(zodInput(fields[1]!)).toBe('  done: z.boolean().optional(),')
    expect(zodInput(fields[2]!)).toBe('  due_at: z.string().nullable().optional(),')
  })
  it('traduit les défauts SQL pour une table locale', () => {
    const local = parseFields("title:text, done:bool=false, due_at:timestamptz?, status:text=l'un, owner:uuid, at:timestamptz=now(), on:date=now()")
    expect(local.map(zodLocalRow)).toEqual([
      '  title: z.string(),',
      '  done: z.boolean().default(false),',
      '  due_at: z.string().nullable().default(null),',
      "  status: z.string().default('l\\'un'),",
      '  owner: z.string(),',
      '  at: z.string().default(() => new Date().toISOString()),',
      '  on: z.string().default(() => dayKey()),',
    ])
    expect(localRowImports(local)).toBe("import { dayKey } from '@daroms/lib/dates'\n")
    expect(localRowImports(parseFields('title:text'))).toBe('')
  })
  it('refuse un type inconnu', () => {
    expect(() => parseFields('x:money')).toThrow()
  })
})

describe('gabarits et manifest', () => {
  it('remplit les variables', () => {
    expect(render('use{{Name}} {{key}}', { Name: 'TodoDetail', key: 'todoDetail' })).toBe('useTodoDetail todoDetail')
    expect(pascal('todo-detail')).toBe('TodoDetail')
    expect(camel('todo-detail')).toBe('todoDetail')
  })
  it('sérialise le manifest en TypeScript lisible', () => {
    expect(toTs({ name: "L'app", tabs: [{ name: 'index' }], locales: ['fr', 'en'] })).toBe(
      "{\n  name: 'L\\'app',\n  tabs: [\n    {\n      name: 'index',\n    },\n  ],\n  locales: ['fr', 'en'],\n}",
    )
  })
})

describe('types db hors ligne', () => {
  it('suit le format supabase gen types', () => {
    const out = renderDbTypes({ tables: { todos: { fields: [{ name: 'title', type: 'text', nullable: false }] } } })
    expect(out).toContain('todos: {')
    expect(out).toContain('title: string')
    expect(out).toContain('id?: string')
    expect(out).toContain('Relationships: []')
  })
  it('ignore les tables locales', () => {
    const out = renderDbTypes({ tables: { books: { local: true, fields: [{ name: 'title', type: 'text', nullable: false }] } } })
    expect(out).not.toContain('books')
  })
})

describe('release-core', () => {
  it('incrémente la version', () => {
    expect(bumpVersion('0.1.9', 'patch')).toBe('0.1.10')
    expect(bumpVersion('0.1.9', 'minor')).toBe('0.2.0')
    expect(bumpVersion('0.1.9', 'major')).toBe('1.0.0')
  })
  it('regroupe le changelog', () => {
    const section = changelogSection('0.2.0', '2026-10-22', ['feat(ui): ajoute Chip', 'fix: corrige Sheet', 'chore: deps'])
    expect(section).toContain('### Nouveautés\n- ajoute Chip')
    expect(section).toContain('### Corrections\n- corrige Sheet')
    expect(section).toContain('### Divers\n- deps')
  })
})
