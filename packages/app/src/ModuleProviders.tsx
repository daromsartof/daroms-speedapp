import { createContext, useContext, type ReactNode } from 'react'

import type { ResolvedModule } from './module'

const ModulesContext = createContext<ResolvedModule[]>([])

/** Modules actifs (pour l'écran Réglages, le debug...). */
export function useModules() {
  return useContext(ModulesContext)
}

export function ModuleProviders({ modules, children }: { modules: ResolvedModule[]; children: ReactNode }) {
  const tree = modules.reduceRight<ReactNode>((inner, { module, config }) => {
    const Provider = module.Provider
    return Provider ? <Provider config={config}>{inner}</Provider> : inner
  }, children)
  return <ModulesContext.Provider value={modules}>{tree}</ModulesContext.Provider>
}
