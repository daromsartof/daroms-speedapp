import { createNamespaceT } from '@daroms/i18n'

import type fr from './locales/fr.json'

export const useAiChatT = createNamespaceT<typeof fr>('aiChat')
