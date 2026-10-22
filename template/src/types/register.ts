// Types de l'app enregistrés auprès du cœur.
import type fr from '~/locales/fr.json'

import type { Database } from './db'

declare module '@daroms/data' {
  interface Register {
    database: Database
  }
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'app'
    resources: { app: typeof fr }
  }
}

export {}
