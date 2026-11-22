// Vérifications chiffrées d'une icône, sur des masques de pixels (1 = encre) : trait, contreformes, présence,
// zone sûre Android, directions trop proches. Fonctions pures, testées.

export type Mask = { w: number; h: number; data: Uint8Array }

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))

/** Masque d'encre : alpha (fond transparent) ou couleur plus proche de l'encre que du fond (fond plein). */
export function toMask(rgba: Uint8Array | Buffer, w: number, h: number, colors?: { bg: string; ink: string }): Mask {
  const data = new Uint8Array(w * h)
  const [bg, ink] = colors ? [hex(colors.bg), hex(colors.ink)] : [[0, 0, 0], [0, 0, 0]]
  const span = Math.hypot(ink[0]! - bg[0]!, ink[1]! - bg[1]!, ink[2]! - bg[2]!) || 1
  for (let i = 0; i < w * h; i++) {
    const [r, g, b, a] = [rgba[i * 4]!, rgba[i * 4 + 1]!, rgba[i * 4 + 2]!, rgba[i * 4 + 3]!]
    data[i] = colors ? (Math.hypot(r - bg[0]!, g - bg[1]!, b - bg[2]!) / span > 0.5 ? 1 : 0) : a > 127 ? 1 : 0
  }
  return { w, h, data }
}

export function bbox({ w, h, data }: Mask): { x: number; y: number; w: number; h: number } | undefined {
  let [x0, y0, x1, y1] = [w, h, -1, -1]
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (data[y * w + x]) {
        x0 = Math.min(x0, x)
        y0 = Math.min(y0, y)
        x1 = Math.max(x1, x)
        y1 = Math.max(y1, y)
      }
  return x1 < 0 ? undefined : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }
}

export const coverage = (m: Mask) => m.data.reduce((s, v) => s + v, 0) / (m.w * m.h)

/** Épaisseur typique du trait (px) : double de la médiane des maxima locaux de la distance au bord (chanfrein 3-4). */
export function strokeWidth({ w, h, data }: Mask): number {
  const INF = 1e9
  const d = new Float64Array(w * h).map((_, i) => (data[i] ? INF : 0))
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[y * w + x]!)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) if (d[y * w + x]) d[y * w + x] = Math.min(d[y * w + x]!, at(x - 1, y) + 3, at(x, y - 1) + 3, at(x - 1, y - 1) + 4, at(x + 1, y - 1) + 4)
  for (let y = h - 1; y >= 0; y--)
    for (let x = w - 1; x >= 0; x--) if (d[y * w + x]) d[y * w + x] = Math.min(d[y * w + x]!, at(x + 1, y) + 3, at(x, y + 1) + 3, at(x + 1, y + 1) + 4, at(x - 1, y + 1) + 4)
  const ridge: number[] = []
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const v = d[y * w + x]!
      if (v && v >= at(x - 1, y) && v >= at(x + 1, y) && v >= at(x, y - 1) && v >= at(x, y + 1)) ridge.push(v / 3)
    }
  if (!ridge.length) return 0
  ridge.sort((a, b) => a - b)
  return ridge[Math.floor(ridge.length / 2)]! * 2
}

/** Contreformes : zones de fond fermées (non reliées au bord) d'au moins `minArea` pixels. */
export function holes({ w, h, data }: Mask, minArea = 1): number {
  const seen = new Uint8Array(w * h)
  const fill = (start: number) => {
    const stack = [start]
    let area = 0
    let border = false
    seen[start] = 1
    while (stack.length) {
      const i = stack.pop()!
      area++
      const x = i % w
      const y = (i - x) / w
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) border = true
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1])
        if (j >= 0 && !seen[j] && !data[j]) {
          seen[j] = 1
          stack.push(j)
        }
    }
    return { area, border }
  }
  let count = 0
  for (let i = 0; i < w * h; i++)
    if (!data[i] && !seen[i]) {
      const { area, border } = fill(i)
      if (!border && area >= minArea) count++
    }
  return count
}

/** Distance maximale de l'encre au centre (px), pour la zone sûre circulaire d'Android. */
export function maxRadius({ w, h, data }: Mask): number {
  let r = 0
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[y * w + x]) r = Math.max(r, Math.hypot(x + 0.5 - w / 2, y + 0.5 - h / 2))
  return r
}

/** Silhouette recadrée sur sa boîte et posée au centre d'un carré `size` (pour comparer deux directions). */
export function normalize(m: Mask, size = 64): Mask {
  const box = bbox(m)
  const out = new Uint8Array(size * size)
  if (!box) return { w: size, h: size, data: out }
  const scale = Math.max(box.w, box.h) / size
  const [ox, oy] = [(size - box.w / scale) / 2, (size - box.h / scale) / 2]
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const sx = Math.floor(box.x + (x - ox) * scale)
      const sy = Math.floor(box.y + (y - oy) * scale)
      if (sx >= box.x && sy >= box.y && sx < box.x + box.w && sy < box.y + box.h) out[y * size + x] = m.data[sy * m.w + sx]!
    }
  return { w: size, h: size, data: out }
}

/** Recouvrement de deux silhouettes de même taille (intersection sur union). */
export function iou(a: Mask, b: Mask): number {
  let inter = 0
  let union = 0
  for (let i = 0; i < a.data.length; i++) {
    inter += a.data[i]! & b.data[i]!
    union += a.data[i]! | b.data[i]!
  }
  return union ? inter / union : 0
}

/** Seuils : trait lisible à 48 px (écran d'accueil), présence minimale, deux directions pas des variantes. */
export const LOGO_LIMITS = { stroke48: 2, presence: 0.05, similar: 0.8 } as const
