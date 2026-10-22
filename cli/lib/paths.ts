import { existsSync, realpathSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { fail } from './log'

/** Racine du cœur (dossier contenant cli/). */
export const CORE_DIR = resolve(import.meta.dir, '..', '..')

/** Remonte jusqu'au dossier contenant app.manifest.ts. */
export function findAppRoot(from = process.cwd()): string | undefined {
  let dir = resolve(from)
  while (true) {
    if (existsSync(join(dir, 'app.manifest.ts')) && existsSync(join(dir, 'core'))) return dir
    const parent = dirname(dir)
    if (parent === dir) return undefined
    dir = parent
  }
}

export function appRoot(): string {
  return findAppRoot() ?? fail("pas d'app daroms ici (app.manifest.ts introuvable) : lancer depuis le dossier de l'app")
}

export function isCoreRepo(dir = process.cwd()): boolean {
  return realpathSync(resolve(dir)) === realpathSync(CORE_DIR)
}
