// Données du chat : historique (Supabase) et envoi en streaming vers l'edge function ai-chat.
import { getSupabase, getSupabaseEnv, moduleDb, unwrap } from '@daroms/data'
import { storage } from '@daroms/lib/storage'
import { useQuery } from '@tanstack/react-query'
import { fetch } from 'expo/fetch'
import { z } from 'zod'

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
})
export type ChatMessage = z.infer<typeof ChatMessageSchema>

const CURRENT = 'aiChat.conversationId'
export const currentConversation = () => storage.getString(CURRENT)
export const setCurrentConversation = (id: string | undefined) => (id ? storage.setString(CURRENT, id) : storage.remove(CURRENT))

export const chatKey = (conversationId: string | undefined) => ['aiChat', 'messages', conversationId] as const

export async function fetchHistory(conversationId: string): Promise<ChatMessage[]> {
  const result = await moduleDb()
    .from('ai_messages')
    .select('id, role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  return ChatMessageSchema.array().parse(unwrap(result))
}

export function useChatHistory(conversationId: string | undefined) {
  return useQuery({
    queryKey: chatKey(conversationId),
    enabled: Boolean(conversationId),
    queryFn: () => fetchHistory(conversationId!),
  })
}

type StreamEvent =
  | { type: 'start'; conversation_id: string }
  | { type: 'delta'; text: string }
  | { type: 'done'; message_id: string | null }
  | { type: 'error'; code: string }

/** Envoie un message et appelle onEvent à chaque fragment SSE reçu. */
export async function streamReply(message: string, conversationId: string | undefined, onEvent: (event: StreamEvent) => void) {
  const { url, key } = getSupabaseEnv()
  const { data } = await getSupabase().auth.getSession()
  const response = await fetch(`${url}/functions/v1/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${data.session?.access_token ?? key}` },
    body: JSON.stringify({ message, conversation_id: conversationId }),
  })
  if (response.status === 429) return onEvent({ type: 'error', code: 'rateLimit' })
  if (!response.ok || !response.body) return onEvent({ type: 'error', code: response.status === 401 ? 'unauthorized' : 'unknown' })
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''
    for (const frame of frames) {
      const line = frame.split('\n').find((l) => l.startsWith('data: '))
      if (line) onEvent(JSON.parse(line.slice(6)) as StreamEvent)
    }
  }
}
