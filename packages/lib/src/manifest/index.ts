import Constants from 'expo-constants'

import { ManifestSchema, type Manifest } from './schema'

let cached: Manifest | undefined

/** Manifest de l'app, injecté par app.config.ts dans `extra.manifest`. */
export function getManifest(): Manifest {
  if (cached) return cached
  const raw: unknown = Constants.expoConfig?.extra?.manifest
  cached = ManifestSchema.parse(raw)
  return cached
}

/** Pour les tests : force un manifest. */
export function setManifestForTests(manifest: Manifest | undefined) {
  cached = manifest
}

export { defineManifest, ManifestSchema, type Manifest, type ManifestInput, type ManifestTab } from './schema'
