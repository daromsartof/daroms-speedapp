// Site de documentation et vitrine de Daroms Speed App.
// SITE_URL et BASE_PATH : adresse publique (GitHub Pages par défaut, domaine propre possible).
import { satteri } from '@astrojs/markdown-satteri'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

import { sidebar } from './src/navigation.ts'
import { REPO_URL, SITE_DESCRIPTION, SITE_TITLE } from './src/site.ts'

const site = process.env.SITE_URL ?? 'https://daromsartof.github.io'
const base = (process.env.BASE_PATH ?? '/daroms-speedapp').replace(/\/$/, '')

/** Préfixe `base` aux liens absolus du contenu (`/guides/x/`) : le contenu reste lisible et portable. */
function baseLinks() {
  return {
    name: 'daroms-base-links',
    element: [
      {
        filter: ['a'],
        visit(node, ctx) {
          const href = node.properties?.href
          if (typeof href !== 'string' || !href.startsWith('/') || href.startsWith('//')) return
          if (base && (href === base || href.startsWith(`${base}/`))) return
          ctx.setProperty(node, 'href', `${base}${href}`)
        },
      },
    ],
  }
}

export default defineConfig({
  site,
  base: base || '/',
  trailingSlash: 'always',
  markdown: { processor: satteri({ hastPlugins: [baseLinks()] }) },
  vite: {
    // la vitrine importe l'algorithme de palettes du cœur (packages/theme)
    server: { fs: { allow: ['..'] } },
  },
  integrations: [
    starlight({
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      defaultLocale: 'root',
      locales: { root: { label: 'Français', lang: 'fr' } },
      logo: { src: './src/assets/logo.svg', alt: SITE_TITLE },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'Dépôt GitHub', href: REPO_URL }],
      editLink: { baseUrl: `${REPO_URL}/edit/main/docs/` },
      lastUpdated: true,
      customCss: [
        '@fontsource-variable/archivo/wdth.css',
        '@fontsource-variable/jetbrains-mono',
        './src/styles/tokens.css',
        './src/styles/starlight.css',
      ],
      components: {
        Head: './src/components/Head.astro',
        PageTitle: './src/components/PageTitle.astro',
      },
      routeMiddleware: './src/starlightRouteData.ts',
      head: [
        { tag: 'meta', attrs: { name: 'theme-color', content: '#f5f7fb', media: '(prefers-color-scheme: light)' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#0d1430', media: '(prefers-color-scheme: dark)' } },
        { tag: 'link', attrs: { rel: 'alternate', type: 'text/plain', title: 'llms.txt', href: `${base}/llms.txt` } },
      ],
      sidebar: sidebar(),
    }),
  ],
})
