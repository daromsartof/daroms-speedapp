// Régénère .expo/types/router.d.ts (routes typées) sans démarrer Metro,
// après l'ajout d'écrans ou de modules : évite des erreurs tsc sur des routes « inconnues ».
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

import { log } from './log'

type TypedRoutesModule = { regenerateDeclarations: (dir: string, plugin?: Record<string, unknown>) => void }

/** La génération d'Expo est différée (debounce 1 s) : on attend l'écriture du fichier. */
export async function regenerateRouteTypes(root: string) {
  try {
    process.env.EXPO_ROUTER_APP_ROOT = join(root, 'app')
    const dir = join(root, '.expo', 'types')
    mkdirSync(dir, { recursive: true })
    const require = createRequire(join(root, 'package.json'))
    const typed = require(require.resolve('@expo/router-server/build/typed-routes')) as TypedRoutesModule
    typed.regenerateDeclarations(dir, {})
    await Bun.sleep(1300)
  } catch (error) {
    log.warn(`types de routes non régénérés : ${String(error).split('\n')[0]}`)
  }
}
