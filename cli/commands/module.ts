import { bool, type Args } from '../lib/args'
import { run } from '../lib/exec'
import { color, fail } from '../lib/log'
import { loadManifest } from '../lib/manifest'
import { addModule, installModules, listModules, removeModule } from '../lib/modules'
import { appRoot, findAppRoot } from '../lib/paths'

/** module add|remove|list [slug] */
export async function moduleCommand(args: Args) {
  const [action, slug] = args._
  if (action === 'list' || !action) {
    const root = findAppRoot()
    const active = root ? Object.keys((await loadManifest(root)).modules) : []
    for (const spec of listModules()) {
      const mark = active.includes(spec.slug) ? color.green('●') : color.dim('○')
      console.log(`${mark} ${spec.slug.padEnd(12)} ${spec.description}${spec.requires.length ? color.dim(` (requiert ${spec.requires.join(', ')})`) : ''}`)
    }
    return
  }
  if (!slug) fail('usage : daroms module add|remove <slug>')
  const root = appRoot()
  if (action === 'add') {
    await addModule(root, slug)
    if (bool(args, 'no-install')) return run(['bun', 'install'], { cwd: root, quiet: true }).then(() => undefined)
    return installModules(root)
  }
  if (action === 'remove') return removeModule(root, slug)
  fail(`action inconnue : ${action}`)
}
