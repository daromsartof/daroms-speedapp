// Vérifie le site construit (dist/) : liens internes et ancres, version Markdown de chaque page,
// llms.txt au format llmstxt.org, liens des fichiers pour agents. Code de sortie 1 si un problème.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const DIST = resolve(import.meta.dir, '../dist')
const SITE = process.env.SITE_URL ?? 'https://daromsartof.github.io'
const BASE = (process.env.BASE_PATH ?? '/daroms-speedapp').replace(/\/$/, '')
const problems: string[] = []

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
const all = files(DIST)
const html = all.filter((f) => f.endsWith('.html'))
const idCache = new Map<string, Set<string>>()

/** Chemin du site (/base/x/#y) -> fichier de dist, ou undefined s'il n'existe pas. */
function resolveSitePath(pathname: string): string | undefined {
  if (!pathname.startsWith(`${BASE}/`) && pathname !== BASE) return undefined
  const rel = decodeURIComponent(pathname.slice(BASE.length)).replace(/^\//, '')
  const candidates = [join(DIST, rel), join(DIST, rel, 'index.html')]
  return candidates.find((c) => existsSync(c) && statSync(c).isFile())
}

function ids(file: string) {
  if (!idCache.has(file)) idCache.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!)))
  return idCache.get(file)!
}

function checkTarget(from: string, href: string) {
  const url = new URL(href, `${SITE}${BASE}/${relative(DIST, from)}`)
  if (url.origin !== new URL(SITE).origin) return
  const target = resolveSitePath(url.pathname)
  if (!target) return problems.push(`${relative(DIST, from)} : lien cassé ${href}`)
  if (url.hash && target.endsWith('.html') && !ids(target).has(decodeURIComponent(url.hash.slice(1)))) {
    problems.push(`${relative(DIST, from)} : ancre absente ${href}`)
  }
}

/** Pages 404 (racine et anglaise) : sans adresse propre. */
const is404 = (file: string) => /^(en\/404\/index|404)\.html$/.test(relative(DIST, file))

// 1. Liens internes des pages HTML (hors ressources générées par Pagefind)
for (const file of html) {
  const source = readFileSync(file, 'utf8')
  // la 404 n'a pas d'adresse propre : ses balises canonical et hreflang sont ignorées
  const checked = is404(file) ? source.replace(/<link rel="canonical"[^>]*>/, '').replace(/<link rel="alternate" hreflang[^>]*>/g, '') : source
  for (const [, attr, href] of checked.matchAll(/\s(href|src)="([^"]+)"/g)) {
    if (!href || /^(https?:)?\/\//.test(href) && !href.startsWith(SITE)) continue
    if (/^(mailto:|tel:|data:|javascript:)/.test(href) || (attr === 'href' && href.startsWith('#'))) continue
    if (href.includes('/pagefind/')) continue
    checkTarget(file, href)
  }
}

// 2. Chaque page de doc a sa version Markdown et l'annonce ; une page anglaise non traduite
//    (repli Starlight, contenu français) annonce le Markdown de la page française
const docPages = html.filter((f) => !is404(f) && f !== join(DIST, 'index.html'))
let withMarkdown = 0
for (const file of docPages) {
  const page = relative(DIST, file).replace(/\/index\.html$/, '')
  const own = existsSync(join(DIST, `${page}.md`))
  const mdPage = own || !page.startsWith('en/') ? page : page.slice(3)
  if (own) withMarkdown++
  if (!existsSync(join(DIST, `${mdPage}.md`))) problems.push(`${page} : pas de ${mdPage}.md`)
  if (!readFileSync(file, 'utf8').includes(`rel="alternate" type="text/markdown" href="${BASE}/${mdPage}.md"`)) {
    problems.push(`${page} : <link rel="alternate" type="text/markdown"> absent`)
  }
}

// 3. Fichiers pour agents : liens absolus vers des fichiers existants
const agentFiles = all.filter((f) => f.endsWith('.md') || f.endsWith('/llms.txt') || f.endsWith('/llms-full.txt'))
for (const file of agentFiles) {
  const text = readFileSync(file, 'utf8')
  for (const [, href] of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
    if (href!.startsWith(SITE)) checkTarget(file, href!)
  }
  if (/\]\(\/[^/]/.test(text)) problems.push(`${relative(DIST, file)} : lien relatif à la racine (attendu : absolu)`)
}

// 4. llms.txt : titre H1, résumé, sections de liens (llmstxt.org)
const llms = readFileSync(join(DIST, 'llms.txt'), 'utf8')
if (!llms.startsWith('# ')) problems.push('llms.txt : doit commencer par un titre H1')
if (!/^> .{20,}/m.test(llms)) problems.push('llms.txt : résumé en citation (> ...) absent')
const listed = [...llms.matchAll(/^- \[[^\]]+\]\(([^)]+\.md)\)/gm)].filter((m) => m[1]!.startsWith(`${SITE}${BASE}/`)).length
if (listed !== withMarkdown) problems.push(`llms.txt : ${listed} pages listées pour ${withMarkdown} pages avec leur Markdown`)

// 5. Découverte
for (const name of ['robots.txt', 'sitemap-index.xml', '404.html']) {
  if (!existsSync(join(DIST, name))) problems.push(`${name} absent`)
}

if (problems.length) {
  console.error(`check-agents : ${problems.length} problème(s)\n- ${problems.join('\n- ')}`)
  process.exit(1)
}
console.log(`check-agents : ${html.length} pages HTML, ${agentFiles.length} fichiers pour agents, ${listed} pages dans llms.txt, aucun lien cassé`)
