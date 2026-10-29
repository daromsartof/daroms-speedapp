import { mapsConfig, type MapsConfig } from './config'

let current: MapsConfig = mapsConfig.parse({})

/** Appelé par le module au démarrage (manifest.modules.maps). */
export function configureMaps(next: MapsConfig) {
  current = next
}

export function mapsDefaults(): MapsConfig {
  return current
}
