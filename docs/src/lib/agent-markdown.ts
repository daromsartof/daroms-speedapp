// Versions Markdown des pages pour les agents : même contenu que le HTML, liens absolus vers les `.md`.
import { getCollection, type CollectionEntry } from 'astro:content'

import { SECTIONS } from '../navigation'

export type DocEntry = CollectionEntry<'docs'>

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Chemin du site (avec base) d'une page HTML et de sa version Markdown. */
export const pagePath = (id: string) => `${BASE}/${id}/`
export const markdownPath = (id: string) => `${BASE}/${id}.md`

/** Toutes les pages dans l'ordre du plan (sections, puis `sidebar.order` pour les dossiers générés). */
export async function orderedEntries(): Promise<{ section: (typeof SECTIONS)[number]; entries: DocEntry[] }[]> {
  const all = await getCollection('docs')
  const byId = new Map(all.map((e) => [e.id, e]))
  return SECTIONS.map((section) => ({
    section,
    entries: section.items.flatMap((item) => {
      if (typeof item === 'string') return byId.get(item) ?? []
      return all
        .filter((e) => e.id.startsWith(`${item.autogenerate}/`))
        .sort((a, b) => (a.data.sidebar.order ?? 0) - (b.data.sidebar.order ?? 0) || a.id.localeCompare(b.id))
    }),
  }))
}

/** `[x](/guides/y/#z)` -> `[x](https://site/base/guides/y.md#z)` : un agent reste en Markdown en suivant les liens. */
function absolutizeLinks(body: string, site: URL) {
  return body.replace(/\]\((\/[^)\s]*)\)/g, (match, href: string) => {
    if (href.startsWith('//')) return match
    const [path, hash] = href.split('#') as [string, string | undefined]
    const clean = path.replace(/\/$/, '')
    const target = clean === '' ? `${BASE}/llms.txt` : /\.[a-z]+$/.test(clean) ? `${BASE}${clean}` : markdownPath(clean.slice(1))
    return `](${new URL(target, site).href}${hash ? `#${hash}` : ''})`
  })
}

export function entryToMarkdown(entry: DocEntry, site: URL) {
  const { title, description } = entry.data
  const html = new URL(pagePath(entry.id), site).href
  return [
    `# ${title}`,
    description ? `> ${description}` : '',
    absolutizeLinks((entry.body ?? '').trim(), site),
    `---\n\nPage HTML : ${html}\nIndex de la documentation : ${new URL(`${BASE}/llms.txt`, site).href}`,
  ]
    .filter(Boolean)
    .join('\n\n')
}
