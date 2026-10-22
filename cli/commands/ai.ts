import { join } from 'node:path'

import { bool, type Args } from '../lib/args'
import { run } from '../lib/exec'
import { log } from '../lib/log'
import { CORE_DIR, findAppRoot } from '../lib/paths'

/** Copie core/_ai vers .claude/ (règles, skills, agents, hooks, contexte) et fusionne settings.json. */
export async function syncAi(root: string, force = false) {
  const script = join(root, 'core', '_ai', 'hooks', 'daroms-sync.py')
  await run(['python3', script, ...(force ? ['--force'] : [])], { cwd: root, env: { CLAUDE_PROJECT_DIR: root } })
}

export async function syncAiCommand(args: Args) {
  const root = findAppRoot() ?? process.cwd()
  await syncAi(root, bool(args, 'force') || true)
  log.ok('.claude/ synchronisé avec core/_ai')
}

/** Régénère CATALOG.md (et digest.md) depuis les sources du cœur. */
export async function catalog(_args: Args) {
  await run(['python3', join(CORE_DIR, '_ai', 'hooks', 'daroms-sync.py'), '--generate-only', '--force'], { env: { CLAUDE_PROJECT_DIR: CORE_DIR } })
  log.ok('packages/ui/CATALOG.md et _ai/digest.md à jour')
}
