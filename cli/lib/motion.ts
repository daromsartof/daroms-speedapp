// Références de mouvement : une vidéo ou un GIF d'interaction devient une planche d'images horodatées,
// avec la quantité de mouvement entre deux images. L'agent y lit le timing (départ, arrêt, rebonds)
// sans abonnement : c'est la décomposition que les bibliothèques payantes vendent toute faite.

export type VideoKind = 'mp4' | 'webm' | 'gif'

/** Format d'une vidéo d'après ses premiers octets. */
export function videoKind(bytes: Uint8Array): VideoKind | undefined {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to))
  if (ascii(4, 8) === 'ftyp') return 'mp4'
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return 'webm'
  if (ascii(0, 4) === 'GIF8') return 'gif'
  return undefined
}

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&#x2F;/gi, '/').replace(/&#47;/g, '/').replace(/&quot;/g, '"')

/** Vidéo d'une page : og:video, twitter:player:stream, puis <video src> ou <source src>, en URL absolue. */
export function previewVideo(html: string, pageUrl: string): string | undefined {
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0])
  const candidates: string[] = []
  for (const key of ['og:video:secure_url', 'og:video:url', 'og:video', 'twitter:player:stream']) {
    const tag = metas.find((t) => new RegExp(`\\b(property|name)=["']${key.replace(/:/g, '\\:')}["']`, 'i').test(t))
    const content = tag && /\bcontent=["']([^"']+)["']/i.exec(tag)?.[1]
    if (content) candidates.push(content)
  }
  for (const m of html.matchAll(/<(?:video|source)\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    if (!/\btype=["'](?!video)/i.test(m[0])) candidates.push(m[1]!)
  }
  for (const candidate of candidates) {
    try {
      const url = new URL(decode(candidate.trim()), pageUrl)
      if (/^https?:$/.test(url.protocol)) return url.href
    } catch {
      continue
    }
  }
  return undefined
}

/** Quantité de mouvement entre images successives (0 à 1), d'après des images en niveaux de gris de même taille. */
export function frameDiffs(raw: Uint8Array, frameSize: number): number[] {
  const count = Math.floor(raw.length / frameSize)
  const diffs = [0]
  for (let f = 1; f < count; f++) {
    let sum = 0
    for (let i = 0; i < frameSize; i++) sum += Math.abs(raw[f * frameSize + i]! - raw[(f - 1) * frameSize + i]!)
    diffs.push(sum / frameSize / 255)
  }
  return diffs
}

export type MotionPhase = { startMs: number; endMs: number; durationMs: number }
export type MotionWindow = { startMs: number; endMs: number; durationMs: number; peakMs: number; phases: number; parts: MotionPhase[] }

/**
 * Fenêtre de mouvement : première et dernière image qui bougent nettement (au-dessus de 8 % du pic),
 * découpée en phases séparées par un arrêt d'au moins 3 images (2 phases ou plus : rebond, décalage ou enchaînement).
 * Un creux d'une ou deux images (sommet d'un aller-retour) ne coupe pas une phase.
 */
export function motionWindow(diffs: number[], fps: number): MotionWindow | undefined {
  const peak = Math.max(0, ...diffs)
  if (peak < 0.002) return undefined
  const threshold = Math.max(0.002, peak * 0.08)
  const ms = (i: number) => Math.round((i * 1000) / fps)
  const runs: [number, number][] = []
  diffs.forEach((d, i) => {
    if (d <= threshold) return
    const last = runs.at(-1)
    if (last && i - last[1] <= 3) last[1] = i
    else runs.push([i, i])
  })
  // l'image i bouge par rapport à l'image i - 1 : le mouvement commence à i - 1
  const parts = runs.map(([a, b]) => ({ startMs: ms(a - 1), endMs: ms(b), durationMs: ms(b) - ms(a - 1) }))
  const startMs = parts[0]!.startMs
  const endMs = parts.at(-1)!.endMs
  return { startMs, endMs, durationMs: endMs - startMs, peakMs: ms(diffs.indexOf(peak)), phases: parts.length, parts }
}

/** Planche en SVG : images horodatées en grille, barre de mouvement sous chacune, images des phases de mouvement surlignées. */
export function framesSheet(frames: { href: string; ms: number; diff: number }[], tile: { w: number; h: number }, cols: number, window?: MotionWindow): string {
  const pad = 8
  const label = 30
  const rows = Math.ceil(frames.length / cols)
  const peak = Math.max(0.0001, ...frames.map((f) => f.diff))
  const W = cols * (tile.w + pad) + pad
  const H = rows * (tile.h + label + pad) + pad
  const cells = frames
    .map((f, i) => {
      const x = pad + (i % cols) * (tile.w + pad)
      const y = pad + Math.floor(i / cols) * (tile.h + label + pad)
      const inside = window?.parts.some((p) => f.ms >= p.startMs && f.ms <= p.endMs)
      const bar = Math.round((f.diff / peak) * tile.w)
      return (
        `<rect x="${x - 3}" y="${y - 3}" width="${tile.w + 6}" height="${tile.h + label + 3}" rx="6" fill="${inside ? '#FFF3D6' : '#FFFFFF'}"/>` +
        `<image href="${f.href}" x="${x}" y="${y}" width="${tile.w}" height="${tile.h}"/>` +
        `<rect x="${x}" y="${y + tile.h + 4}" width="${bar}" height="5" rx="2" fill="${inside ? '#D97706' : '#9CA3AF'}"/>` +
        `<text x="${x}" y="${y + tile.h + 24}" font-size="13" font-weight="700" fill="#111827">${f.ms} ms</text>`
      )
    })
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Inter"><rect width="${W}" height="${H}" fill="#F3F4F6"/>${cells}</svg>`
}

/** Préréglage de marque le plus proche d'une durée mesurée (les références se traduisent, elles ne se recopient pas). */
export function nearestPreset<K extends string>(ms: number, durations: Record<K, number>): K {
  const keys = Object.keys(durations) as K[]
  return keys.reduce((best, k) => (Math.abs(durations[k] - ms) < Math.abs(durations[best] - ms) ? k : best), keys[0]!)
}

/** Images à montrer sur la planche : la fenêtre de mouvement et deux images autour, au plus `max` (pas régulier). */
export function sheetIndices(count: number, fps: number, max: number, window?: MotionWindow): number[] {
  const toIndex = (ms: number) => Math.round((ms * fps) / 1000)
  const from = window ? Math.max(0, toIndex(window.startMs) - 2) : 0
  const to = window ? Math.min(count - 1, toIndex(window.endMs) + 2) : count - 1
  const stride = Math.max(1, Math.ceil((to - from + 1) / max))
  const out: number[] = []
  for (let i = from; i <= to; i += stride) out.push(i)
  return out
}
