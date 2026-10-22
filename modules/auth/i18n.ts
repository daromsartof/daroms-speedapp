import { createNamespaceT } from '@daroms/i18n'

import type fr from './locales/fr.json'

export const useAuthT = createNamespaceT<typeof fr>('auth')
