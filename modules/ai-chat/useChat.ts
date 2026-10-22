import { haptic } from '@daroms/lib/haptics'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'

import { chatKey, currentConversation, fetchHistory, setCurrentConversation, streamReply, useChatHistory, type ChatMessage } from './api'

/** État du chat : historique + réponse en cours de streaming. */
export function useChat() {
  const client = useQueryClient()
  const [conversationId, setConversationId] = useState(currentConversation)
  const history = useChatHistory(conversationId)
  const [pending, setPending] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(
    async (text: string) => {
      const message = text.trim()
      if (!message || streaming) return
      haptic('light')
      setError(null)
      setStreaming(true)
      const reply: ChatMessage = { id: `reply-${Date.now()}`, role: 'assistant', content: '' }
      setPending([{ id: `user-${Date.now()}`, role: 'user', content: message }, reply])
      let id = conversationId
      await streamReply(message, conversationId, (event) => {
        if (event.type === 'start') {
          id = event.conversation_id
          setCurrentConversation(id)
        } else if (event.type === 'delta') {
          reply.content += event.text
          setPending((items) => [items[0]!, { ...reply }])
        } else if (event.type === 'error') setError(event.code)
      }).catch(() => setError('network'))
      // l'historique à jour remplace les messages provisoires sans clignotement
      if (id) await client.fetchQuery({ queryKey: chatKey(id), queryFn: () => fetchHistory(id!) }).catch(() => undefined)
      setConversationId(id)
      setPending([])
      setStreaming(false)
    },
    [client, conversationId, streaming],
  )

  const reset = useCallback(() => {
    setCurrentConversation(undefined)
    setConversationId(undefined)
    setPending([])
    setError(null)
  }, [])

  const messages = useMemo(() => [...(history.data ?? []), ...pending], [history.data, pending])
  return { messages, send, reset, streaming, error, loading: history.isPending && Boolean(conversationId) }
}
