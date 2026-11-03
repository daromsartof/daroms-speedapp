// Aperçus d'inspiration : télécharge des images publiques dans .daroms/inspiration/ pour que Claude les regarde.
// Identité honnête, aucun contournement : une page fermée aux robots (403, défi) est signalée puis sautée.
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

import { bool, type Args } from '../lib/args'
import { readJson, writeFile, writeJson } from '../lib/fsx'
import { fail, log } from '../lib/log'
import { findAppRoot } from '../lib/paths'

const USER_AGENT = 'daroms-inspire/1.0 (+https://github.com/daromsartof/daroms-speedapp)'
const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,text/html;q=0.8'
const MAX_BYTES = 8 * 1024 * 1024
const MAX_URLS = 12
const TIMEOUT_MS = 15_000
const PREVIEW_KEYS = ['og:image:secure_url', 'og:image', 'og:image:url', 'twitter:image', 'twitter:image:src']

export type ImageKind = 'png' | 'jpg' | 'webp' | 'gif'
export type InspirationEntry = { file: string; source: string; image: string; at: string }

/** Format réel d'une image d'après ses premiers octets (le content-type des CDN n'est pas fiable). */
export function imageKind(bytes: Uint8Array): ImageKind | undefined {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to))
  if (bytes[0] === 0x89 && ascii(1, 4) === 'PNG') return 'png'
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg'
  if (ascii(0, 4) === 'GIF8') return 'gif'
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'webp'
  return undefined
}

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&#x2F;/gi, '/').replace(/&#47;/g, '/').replace(/&quot;/g, '"')

/** Image d'aperçu d'une page HTML (og:image, puis twitter:image), en URL absolue. */
export function previewImage(html: string, pageUrl: string): string | undefined {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0])
  for (const key of PREVIEW_KEYS) {
    const tag = tags.find((t) => new RegExp(`\\b(property|name)=["']${key.replace(/:/g, '\\:')}["']`, 'i').test(t))
    const content = tag && /\bcontent=["']([^"']+)["']/i.exec(tag)?.[1]
    if (!content) continue
    try {
      return new URL(decode(content.trim()), pageUrl).href
    } catch {
      continue
    }
  }
  return undefined
}

/** Nom suivant dans le dossier : 01-dribbble-com.png, 02-pinterest-com.webp... (hôte de la page source). */
export function nextFileName(existing: string[], source: string, kind: ImageKind): string {
  const last = Math.max(0, ...existing.map((f) => Number(/^(\d+)-/.exec(f)?.[1] ?? 0)))
  const host = new URL(source).hostname.replace(/^www\./, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  return `${String(last + 1).padStart(2, '0')}-${host}.${kind}`
}

async function get(url: string): Promise<Response> {
  if (!/^https?:\/\//i.test(url)) throw new Error('adresse http(s) attendue')
  const res = await fetch(url, { headers: { 'user-agent': USER_AGENT, accept: ACCEPT }, redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) })
  // 202 sans contenu, 403, 429 : défi anti-robot ou refus ; on ne force pas
  if (res.status !== 200) throw new Error(`HTTP ${res.status}, site fermé à la lecture automatique : garder le lien et l'extrait de recherche`)
  const length = Number(res.headers.get('content-length') ?? 0)
  if (length > MAX_BYTES) throw new Error(`trop lourd (${Math.round(length / 1e6)} Mo)`)
  return res
}

async function readImage(res: Response): Promise<{ bytes: Uint8Array; kind: ImageKind }> {
  const bytes = new Uint8Array(await res.arrayBuffer())
  if (bytes.byteLength > MAX_BYTES) throw new Error(`trop lourd (${Math.round(bytes.byteLength / 1e6)} Mo)`)
  const kind = imageKind(bytes)
  if (!kind) throw new Error('pas une image png, jpg, webp ou gif')
  return { bytes, kind }
}

/** URL d'image directe, ou page dont on prend l'image d'aperçu. */
async function download(url: string): Promise<{ image: string; bytes: Uint8Array; kind: ImageKind }> {
  const res = await get(url)
  if (!(res.headers.get('content-type') ?? '').includes('text/html')) return { image: url, ...(await readImage(res)) }
  const image = previewImage(await res.text(), res.url || url)
  if (!image) throw new Error("page sans image d'aperçu (og:image) : chercher l'URL d'une capture sur la page")
  return { image, ...(await readImage(await get(image))) }
}

export async function inspire(args: Args) {
  const root = findAppRoot() ?? process.cwd()
  const dir = join(root, '.daroms', 'inspiration')
  const indexPath = join(dir, 'index.json')
  if (bool(args, 'clear') && existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true })
    log.ok('.daroms/inspiration/ vidé')
  }
  const urls = [...new Set(args._)]
  const entries = existsSync(indexPath) ? readJson<InspirationEntry[]>(indexPath) : []
  if (!urls.length) {
    if (bool(args, 'clear')) return
    if (!entries.length) return fail("aucun aperçu : bun daroms inspire <url d'image ou de page...> [--clear]")
    for (const e of entries) log.info(`.daroms/inspiration/${e.file}  <- ${e.source}`)
    return
  }
  if (urls.length > MAX_URLS) fail(`${MAX_URLS} adresses au plus par appel (ici ${urls.length})`)

  const results = await Promise.allSettled(urls.map(download))
  let saved = 0
  results.forEach((result, i) => {
    const source = urls[i]!
    if (result.status === 'rejected') {
      log.warn(`${source} : ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`)
      return
    }
    const existing = existsSync(dir) ? readdirSync(dir) : []
    const file = nextFileName(existing, source, result.value.kind)
    writeFile(join(dir, file), result.value.bytes)
    entries.push({ file, source, image: result.value.image, at: new Date().toISOString() })
    log.ok(`.daroms/inspiration/${file}  <- ${source}`)
    saved++
  })
  if (!saved) fail('aucun aperçu téléchargé')
  writeJson(indexPath, entries)
  log.info("Regarder chaque fichier (Read), puis noter les références dans app.spec.md > Inspiration. S'inspirer, ne rien copier dans l'app.")
}
