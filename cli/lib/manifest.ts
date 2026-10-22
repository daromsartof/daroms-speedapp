import { join } from 'node:path'

import type { Manifest } from '../../packages/lib/src/manifest/schema.ts'
import { capture } from './exec'
import { writeFile } from './fsx'
import { fail } from './log'

export type { Manifest }

/** Charge app.manifest.ts dans un processus Bun neuf (valeur à jour, validée par zod). */
export async function loadManifest(root: string): Promise<Manifest> {
  const file = join(root, 'app.manifest.ts')
  const { code, out } = await capture(['bun', '-e', `const m = await import(${JSON.stringify(file)}); console.log(JSON.stringify(m.default))`], { cwd: root })
  if (code !== 0) fail(`manifest invalide :\n${out.trim().split('\n').slice(-12).join('\n')}`)
  return JSON.parse(out.trim().split('\n').pop()!) as Manifest
}

const IDENT = /^[A-Za-z_$][\w$]*$/

/** Sérialise en littéral TypeScript lisible (clés sans guillemets, chaînes entre apostrophes). */
export function toTs(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent + 1)
  const end = '  '.repeat(indent)
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  if (typeof value !== 'object' || value === null) return String(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const flat = value.every((v) => typeof v !== 'object' || v === null)
    if (flat) return `[${value.map((v) => toTs(v)).join(', ')}]`
    return `[\n${value.map((v) => `${pad}${toTs(v, indent + 1)},`).join('\n')}\n${end}]`
  }
  const entries = Object.entries(value).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return '{}'
  const body = entries.map(([k, v]) => `${pad}${IDENT.test(k) ? k : `'${k}'`}: ${toTs(v, indent + 1)},`)
  return `{\n${body.join('\n')}\n${end}}`
}

export function renderManifest(manifest: Manifest): string {
  return [
    "import { defineManifest } from '@daroms/lib/manifest-schema'",
    '',
    "// Configuration de l'app : lue par app.config.ts (build) et getManifest() (runtime).",
    '// Réécrit par la CLI daroms (module add, g screen...) : garder des valeurs littérales.',
    `export default defineManifest(${toTs(manifest)})`,
    '',
  ].join('\n')
}

export function saveManifest(root: string, manifest: Manifest) {
  writeFile(join(root, 'app.manifest.ts'), renderManifest(manifest))
}
