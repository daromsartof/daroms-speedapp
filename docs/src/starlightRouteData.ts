// Annonce la version Markdown de chaque page (<link rel="alternate" type="text/markdown">).
import { defineRouteMiddleware } from '@astrojs/starlight/route-data'

import { markdownPath } from './lib/agent-markdown'

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute
  if (route.entry.id === '404') return
  route.head.push({ tag: 'link', attrs: { rel: 'alternate', type: 'text/markdown', href: markdownPath(route.entry.id) } })
})
