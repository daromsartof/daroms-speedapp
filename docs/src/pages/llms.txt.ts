// Index pour agents (format llmstxt.org) : chaque lien pointe vers la version Markdown de la page.
import type { APIRoute } from 'astro'

import core from '../generated/core.json'
import { markdownPath, orderedEntries } from '../lib/agent-markdown'
import { REPO_URL, SITE_DESCRIPTION, SITE_TITLE } from '../site'

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site).href
  const sections = await orderedEntries()
  const lines = [
    `# ${SITE_TITLE}`,
    `> ${SITE_DESCRIPTION}`,
    [
      `Version du cœur : ${core.version}. Pile : Expo SDK 58 (Expo Router, React Native 0.88, New Architecture), Tamagui v3, Supabase, EAS, Bun. Documentation en français.`,
      '',
      'À savoir avant de lire ou d’écrire du code daroms :',
      '',
      '- Une app contient un sous-module `core/` (ce dépôt) ; on ne modifie jamais `core/` depuis une app.',
      '- Générer avant d’écrire : `bun daroms g screen|table`, `bun daroms module add`. Claude ne remplit que le spécifique.',
      '- Tamagui v3 n’est pas Tamagui v2 : valeurs plates sans `$` (`p="gutter"`, `bg="card press:background-press"`), plus de `hoverStyle`/`pressStyle`.',
      '- UI : uniquement `@daroms/ui` (catalogue : `core/packages/ui/CATALOG.md`) ; Supabase uniquement dans `src/features/<x>/api.ts` ; textes via `t()` en FR et EN.',
      `- Chaque page existe en HTML et en Markdown (même adresse, suffixe \`.md\`). Tout le contenu en un fichier : ${url(`${BASE}/llms-full.txt`)}`,
    ].join('\n'),
    ...sections.map(({ section, entries }) =>
      [
        `## ${section.label}`,
        '',
        section.summary,
        '',
        ...entries.map((e) => `- [${e.data.title}](${url(markdownPath(e.id))})${e.data.description ? `: ${e.data.description}` : ''}`),
      ].join('\n'),
    ),
    [
      '## Optional',
      '',
      `- [Documentation complète](${url(`${BASE}/llms-full.txt`)}): toutes les pages ci-dessus en un seul fichier Markdown`,
      `- [Dépôt du cœur](${REPO_URL}): sources (packages, modules, CLI, couche IA)`,
      `- [Changelog](${REPO_URL}/blob/main/CHANGELOG.md): nouveautés et ruptures par version`,
    ].join('\n'),
  ]
  return new Response(lines.join('\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
