import { defineManifest } from '@daroms/lib/manifest-schema'

// Configuration de l'app : lue par app.config.ts (build) et getManifest() (runtime).
export default defineManifest({
  name: '__APP_NAME__',
  slug: '__APP_SLUG__',
  bundleId: '__BUNDLE_ID__',
  version: '1.0.0',
  variant: '__VARIANT__',
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  screens: ['home'],
  tabs: [{ name: 'index', icon: 'House', titleKey: 'tabs.home' }],
  modules: {},
  monetization: { model: 'free' },
})
