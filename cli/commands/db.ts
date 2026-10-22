import { existsSync } from 'node:fs'
import { join } from 'node:path'

import type { Args } from '../lib/args'
import { writeDbTypes } from '../lib/dbtypes'
import { capture, run } from '../lib/exec'
import { writeFile } from '../lib/fsx'
import { fail, log } from '../lib/log'
import { loadManifest } from '../lib/manifest'
import { appRoot } from '../lib/paths'

const supabase = (...cmd: string[]) => ['bunx', 'supabase@latest', ...cmd]

async function ensureLinked(root: string) {
  if (!existsSync(join(root, 'supabase', 'config.toml'))) await run(supabase('init', '--force'), { cwd: root })
  const ref = (await loadManifest(root)).supabase.projectRef
  if (!ref) fail('manifest.supabase.projectRef manquant (référence du projet Supabase)')
  if (!existsSync(join(root, 'supabase', '.temp', 'project-ref'))) await run(supabase('link', '--project-ref', ref), { cwd: root })
}

/** db new <nom> | push | types | reset */
export async function db(args: Args) {
  const root = appRoot()
  const [action, name] = args._
  switch (action) {
    case 'new': {
      if (!name) fail('usage : daroms db new <nom_snake>')
      const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
      const file = join(root, 'supabase', 'migrations', `${stamp}_${name}.sql`)
      writeFile(file, `-- ${name}\n-- RLS obligatoire sur toute nouvelle table.\n`)
      return log.ok(`migration créée : ${file}`)
    }
    case 'push':
      await ensureLinked(root)
      await run(supabase('db', 'push'), { cwd: root })
      return db({ ...args, _: ['types'] })
    case 'types': {
      const ref = (await loadManifest(root)).supabase.projectRef
      if (!ref) {
        writeDbTypes(root)
        return log.warn('pas de projet Supabase lié : types générés hors ligne depuis supabase/daroms-schema.json')
      }
      const { code, out } = await capture(supabase('gen', 'types', 'typescript', '--project-id', ref, '--schema', 'public'), { cwd: root })
      if (code !== 0) fail(`supabase gen types a échoué :\n${out.slice(-800)}`)
      writeFile(join(root, 'src', 'types', 'db.ts'), `// généré par daroms db types (supabase gen types) : ne pas modifier à la main\n${out.slice(out.indexOf('export type'))}`)
      return log.ok('src/types/db.ts mis à jour depuis Supabase')
    }
    case 'reset':
      return void (await run(supabase('db', 'reset'), { cwd: root }))
    default:
      fail('usage : daroms db new <nom> | push | types | reset')
  }
}
