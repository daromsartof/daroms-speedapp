// robots.txt : documentation ouverte à l'indexation et aux réponses d'IA (ai-train laissé sans préférence).
import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sitemap-index.xml`, site).href
  const body = ['User-agent: *', 'Allow: /', 'Content-Signal: search=yes, ai-input=yes', '', `Sitemap: ${sitemap}`].join('\n')
  return new Response(body + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
