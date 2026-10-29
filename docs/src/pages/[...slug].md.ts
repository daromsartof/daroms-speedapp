// Version Markdown de chaque page de la doc : /guides/ajouter-un-ecran/ -> /guides/ajouter-un-ecran.md
import type { APIRoute, GetStaticPaths } from 'astro'
import { getCollection } from 'astro:content'

import { entryToMarkdown, type DocEntry } from '../lib/agent-markdown'

export const getStaticPaths = (async () => {
  const entries = await getCollection('docs')
  return entries.filter((entry) => entry.id !== '404').map((entry) => ({ params: { slug: entry.id }, props: { entry } }))
}) satisfies GetStaticPaths

export const GET: APIRoute<{ entry: DocEntry }> = ({ props, site }) =>
  new Response(entryToMarkdown(props.entry, site!) + '\n', {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
