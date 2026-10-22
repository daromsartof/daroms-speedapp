// Edge function : envoie une notification à un utilisateur via l'API push d'Expo.
// Appel serveur uniquement (clé service_role) : { user_id, title, body, url? }.
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  if (req.headers.get('Authorization') !== `Bearer ${secret}`) return new Response('Forbidden', { status: 403 })
  const { user_id, title, body, url } = await req.json()
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, secret)
  const { data: tokens, error } = await admin.from('push_tokens').select('token').eq('user_id', user_id)
  if (error) return new Response(error.message, { status: 500 })
  const messages = (tokens ?? []).map(({ token }) => ({ to: token, title, body, data: { url }, sound: 'default' }))
  if (messages.length === 0) return Response.json({ sent: 0 })
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  })
  return Response.json({ sent: messages.length, expo: await res.json() })
})
