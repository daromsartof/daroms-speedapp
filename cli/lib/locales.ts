import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { readJson, writeJson } from './fsx'

export type LocalizedText = { fr: string; en: string }

type Tree = { [key: string]: string | Tree }

function setIfMissing(tree: Tree, path: string[], value: string): boolean {
  const [head, ...rest] = path
  if (!head) return false
  if (rest.length === 0) {
    if (tree[head] !== undefined) return false
    tree[head] = value
    return true
  }
  const child = tree[head]
  const next: Tree = typeof child === 'object' ? child : {}
  tree[head] = next
  return setIfMissing(next, rest, value)
}

/** Ajoute des clés (pointées) dans toutes les langues, sans écraser l'existant. */
export function addLocaleKeys(root: string, entries: Record<string, LocalizedText>) {
  const dir = join(root, 'locales')
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const lang = file.replace('.json', '')
    const tree = readJson<Tree>(join(dir, file))
    let changed = false
    for (const [key, text] of Object.entries(entries)) {
      changed = setIfMissing(tree, key.split('.'), lang === 'fr' ? text.fr : text.en) || changed
    }
    if (changed) writeJson(join(dir, file), tree)
  }
}
