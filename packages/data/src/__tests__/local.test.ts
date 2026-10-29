import { createStorage } from '@daroms/lib/storage'
import { z } from 'zod'

import { AppError } from '../errors'
import { localTable } from '../local'

const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean().default(false),
  note: z.string().nullable().default(null),
  created_at: z.string(),
  updated_at: z.string(),
})

const setup = () => {
  const store = createStorage('test-local')
  void store.remove('table.todos')
  return { store, todos: localTable('todos', TodoSchema, store) }
}

describe('localTable', () => {
  it('insère avec les valeurs par défaut du schéma et liste du plus récent au plus ancien', async () => {
    const { todos } = setup()
    const first = await todos.insert({ title: 'Lire' })
    expect(first).toMatchObject({ title: 'Lire', done: false, note: null })
    expect(first.id).toBeTruthy()
    await new Promise((r) => setTimeout(r, 2))
    await todos.insert({ title: 'Courir', done: true })
    expect((await todos.list()).map((t) => t.title)).toEqual(['Courir', 'Lire'])
  })

  it('met à jour sans écraser avec undefined, puis supprime', async () => {
    const { todos } = setup()
    const todo = await todos.insert({ title: 'Lire', note: 'chapitre 3' })
    const updated = await todos.update(todo.id, { done: true, note: undefined })
    expect(updated).toMatchObject({ title: 'Lire', done: true, note: 'chapitre 3', created_at: todo.created_at })
    await todos.remove(todo.id)
    await expect(todos.get(todo.id)).rejects.toMatchObject({ code: 'notFound' })
  })

  it('lève une erreur de validation sans effacer des données invalides', async () => {
    const { store, todos } = setup()
    store.setJSON('table.todos', [{ id: '1', title: 42 }])
    await expect(todos.list()).rejects.toBeInstanceOf(AppError)
    await expect(todos.insert({ title: 'x' })).rejects.toMatchObject({ code: 'validation' })
    expect(store.getJSON('table.todos')).toEqual([{ id: '1', title: 42 }])
  })
})
