// Système de modules : une fonctionnalité optionnelle = un module dans core/modules/<slug>.
// Le registre `src/generated/modules.ts` de l'app n'importe que les modules activés.
import type { Resources } from '@daroms/i18n'
import type { SettingsSection } from '@daroms/ui'
import type { ReactNode } from 'react'
import type { ZodType } from 'zod'

// méthode (bivariante) : un module typé reste assignable au registre générique
type Bivariant<Args extends unknown[], R> = { fn(...args: Args): R }['fn']

export type ModuleProviderProps<Config> = { children: ReactNode; config: Config }

export type DaromsModule<Config = unknown> = {
  slug: string
  /** Schéma zod de la configuration lue dans `manifest.modules[slug]`. */
  config: ZodType<Config>
  /** Contexte racine (SDK, état global du module). */
  Provider?: Bivariant<[ModuleProviderProps<Config>], ReactNode>
  /** Initialisation au démarrage, hors rendu. */
  init?: Bivariant<[Config], void | Promise<void>>
  /** Textes du module : { fr: { <slug>: {...} }, en: {...} } */
  locales?: Resources
  /** Hook renvoyant des sections ajoutées à l'écran Réglages. */
  useSettings?: () => SettingsSection[]
  /** Le module déclare une gate (useGate dans son Provider) : le splash attend son état. */
  gate?: boolean
  /** Routes présentées en modale (ex. paywall). */
  modals?: string[]
}

export function defineModule<Config>(module: DaromsModule<Config>): DaromsModule<Config> {
  return module
}

export type ModuleRegistry = readonly DaromsModule<unknown>[]

export type ResolvedModule = { module: DaromsModule<unknown>; config: unknown }

/** Valide la configuration de chaque module activé (erreur explicite au démarrage). */
export function resolveModules(registry: ModuleRegistry, configs: Record<string, unknown>): ResolvedModule[] {
  return registry.map((module) => {
    const parsed = module.config.safeParse(configs[module.slug] ?? {})
    if (!parsed.success) {
      throw new Error(`Configuration invalide du module ${module.slug} : ${parsed.error.message}`)
    }
    return { module, config: parsed.data }
  })
}
