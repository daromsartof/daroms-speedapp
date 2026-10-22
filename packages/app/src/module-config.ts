import { useModules } from './ModuleProviders'

/** Configuration validée d'un module actif (manifest.modules[slug]). */
export function useModuleConfig<Config>(slug: string): Config {
  const entry = useModules().find(({ module }) => module.slug === slug)
  if (!entry) throw new Error(`module ${slug} inactif`)
  return entry.config as Config
}
