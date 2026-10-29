// Toute la documentation en un fichier Markdown, dans l'ordre du plan.
import type { APIRoute } from 'astro'

import { entryToMarkdown, orderedEntries } from '../lib/agent-markdown'
import { SITE_DESCRIPTION, SITE_TITLE } from '../site'

export const GET: APIRoute = async ({ site }) => {
  const sections = await orderedEntries()
  const pages = sections.flatMap(({ entries }) => entries.map((entry) => entryToMarkdown(entry, site!)))
  const text = [`# ${SITE_TITLE} : documentation complète`, `> ${SITE_DESCRIPTION}`, ...pages].join('\n\n\n')
  return new Response(text + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
