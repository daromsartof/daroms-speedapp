import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

const TEXT = /\.(ts|tsx|js|json|md|yaml|yml|toml|sql|svg|txt|example)$|^(gitignore|\.env\.example)$/

export function copyDir(from: string, to: string, skip: (rel: string) => boolean = () => false) {
  cpSync(from, to, { recursive: true, filter: (src) => !skip(relative(from, src)) })
}

export function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (name === 'node_modules' || name === '.git') continue
    if (statSync(path).isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

/** Remplace les variables `__NOM__` dans tous les fichiers texte d'un dossier. */
export function substitute(dir: string, vars: Record<string, string>, skip: (rel: string) => boolean = () => false) {
  for (const file of walk(dir)) {
    const rel = relative(dir, file)
    if (skip(rel) || !TEXT.test(file.split('/').pop()!)) continue
    const before = readFileSync(file, 'utf8')
    const after = before.replace(/__([A-Z_]+)__/g, (match, key: string) => vars[key] ?? match)
    if (after !== before) writeFileSync(file, after)
  }
}

/** Gabarits des générateurs : {{Name}}, {{name}}, {{slug}}... */
export function render(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => vars[key] ?? match)
}

export function writeFile(path: string, content: string | Uint8Array) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

export function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

export function writeJson(path: string, value: unknown) {
  writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
}

export const pascal = (s: string) => s.replace(/(^|[-_ ])(\w)/g, (_, __, c: string) => c.toUpperCase())
export const camel = (s: string) => pascal(s).replace(/^\w/, (c) => c.toLowerCase())
