// Edge function ai-chat : relaie une réponse de Claude en SSE vers l'app.
// Secrets (supabase secrets set) : ANTHROPIC_API_KEY (requis), AI_CHAT_MODEL, AI_CHAT_SYSTEM,
// AI_CHAT_DAILY_LIMIT. La clé API ne quitte jamais le serveur.
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'

const MODEL = Deno.env.get('AI_CHAT_MODEL') ?? 'claude-opus-5-5'
const SYSTEM =
  Deno.env.get('AI_CHAT_SYSTEM') ??
  "Tu es l'assistant de cette application mobile. Réponds dans la langue de l'utilisateur, de façon brève et concrète (quelques phrases), sans emoji."
const DAILY_LIMIT = Number(Deno.env.get('AI_CHAT_DAILY_LIMIT') ?? 50)
const HISTORY = 30

const anthropic = new Anthropic() // lit ANTHROPIC_API_KEY
const encoder = new TextEncoder()
const sse = (payload: unknown) => encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  const authorization = req.headers.get('Authorization')
  if (!authorization) return new Response('Unauthorized', { status: 401, headers: cors })
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authorization } },
  })
  const { data: auth } = await db.auth.getUser()
  if (!auth.user) return new Response('Unauthorized', { status: 401, headers: cors })

  const { message, conversation_id } = (await req.json()) as { message?: string; conversation_id?: string }
  const text = (message ?? '').trim().slice(0, 4000)
  if (!text) return new Response('message requis', { status: 400, headers: cors })

  const since = new Date(Date.now() - 86_400_000).toISOString()
  const { count } = await db.from('ai_messages').select('id', { count: 'exact', head: true }).eq('role', 'user').gte('created_at', since)
  if ((count ?? 0) >= DAILY_LIMIT) return Response.json({ code: 'rateLimit' }, { status: 429, headers: cors })

  let conversationId = conversation_id
  if (!conversationId) {
    const created = await db.from('ai_conversations').insert({ title: text.slice(0, 60) }).select('id').single()
    if (created.error) return new Response(created.error.message, { status: 500, headers: cors })
    conversationId = created.data.id as string
  }
  await db.from('ai_messages').insert({ conversation_id: conversationId, role: 'user', content: text })
  const { data: rows } = await db
    .from('ai_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(HISTORY)
  const messages = (rows ?? []).reverse().map((r) => ({ role: r.role as 'user' | 'assistant', content: r.content as string }))

  const body = new ReadableStream({
    async start(controller) {
      controller.enqueue(sse({ type: 'start', conversation_id: conversationId }))
      try {
        const stream = anthropic.beta.messages.stream({
          model: MODEL,
          max_tokens: 16000,
          // chat : effort bas = réponses rapides et concises ; la réflexion reste adaptative
          output_config: { effort: 'low' },
          system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
          messages,
          // repli automatique si le modèle décline (refus de sécurité)
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
        })
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(sse({ type: 'delta', text: event.delta.text }))
          }
        }
        const final = await stream.finalMessage()
        if (final.stop_reason === 'refusal') {
          controller.enqueue(sse({ type: 'error', code: 'refusal' }))
        } else {
          const answer = final.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('')
          const saved = await db.from('ai_messages').insert({ conversation_id: conversationId, role: 'assistant', content: answer }).select('id').single()
          controller.enqueue(sse({ type: 'done', message_id: saved.data?.id ?? null }))
        }
      } catch (error) {
        const code = error instanceof Anthropic.RateLimitError ? 'rateLimit' : error instanceof Anthropic.APIError ? 'unknown' : 'network'
        console.error('ai-chat', error)
        controller.enqueue(sse({ type: 'error', code }))
      } finally {
        controller.close()
      }
    },
  })
  return new Response(body, { headers: { ...cors, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } })
})
