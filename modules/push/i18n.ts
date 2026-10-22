import { createNamespaceT } from '@daroms/i18n'

import type fr from './locales/fr.json'

export const usePushT = createNamespaceT<typeof fr>('push')
