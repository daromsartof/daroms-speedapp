import { defineModule } from '@daroms/app'

import { aiChatConfig } from './config'
import en from './locales/en.json'
import fr from './locales/fr.json'

export default defineModule({
  slug: 'ai-chat',
  config: aiChatConfig,
  locales: { fr: { aiChat: fr }, en: { aiChat: en } },
})

export { ChatScreen } from './ChatScreen'
export { streamReply, type ChatMessage } from './api'
