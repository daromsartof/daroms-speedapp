// Mesures de goût sur le rendu : compter plutôt que juger. Un nombre ne se discute pas,
// un « rends-le plus beau » invite d'autres réglages par défaut.
import { hexToRgb, rgbToOklch, type Rgb } from '../../packages/theme/src/color'

/** Relevé brut fait dans la page (voir collectMeasures). */
export type RawMeasures = {
  colors: { css: string; count: number; sample: string }[]
  radii: { px: number; sample: string }[]
  fontSizes: { px: number; sample: string }[]
  fontFamilies: string[]
  gradients: string[]
  emoji: string[]
  actions: { label: string; aria: boolean; w: number; h: number }[]
}

/** Repères tirés de brand.ts : teintes de marque et rayons autorisés (hors pilules). */
export type BrandRef = { primary: string; accent: string; radii: number[] }

export type Metric = { key: string; label: string; value: number; max: number; detail: string[] }

/**
 * Seuils : marque + accent + un état ; échelle Title..Caption ; cible minimale WCAG 2.5.8 (24 px),
 * la cible confortable de 44 pt reste jugée par l'agent designer.
 */
export const LIMITS = { hues: 3, sizes: 6, families: 2, target: 24 } as const

/** Teintes OKLCH des états du thème (red, emerald, amber à 500). */
const SEMANTIC: Record<string, number> = { erreur: 25, succès: 163, alerte: 70 }
/** En dessous, une couleur est un neutre (fonds et textes légèrement teintés compris). */
const VIVID_CHROMA = 0.06
const HUE_TOLERANCE = 20

export function parseCssColor(css: string): { rgb: Rgb; alpha: number } | null {
  const m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/.exec(css.trim())
  if (!m) return null
  const alphaRaw = m[4]
  const alpha = alphaRaw === undefined ? 1 : alphaRaw.endsWith('%') ? Number(alphaRaw.slice(0, -1)) / 100 : Number(alphaRaw)
  return { rgb: [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255], alpha }
}

const hueDistance = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

const HUE_NAMES: [number, string][] = [
  [20, 'rouge'], [50, 'orange'], [100, 'jaune'], [150, 'vert'], [200, 'cyan'], [250, 'bleu'], [300, 'violet'], [345, 'rose'], [360, 'rouge'],
]
const hueName = (h: number) => HUE_NAMES.find(([max]) => h < max)![1]

/** Familles de teintes vives : rattachées à la marque, à l'accent, à un état, ou hors marque. */
export function hueFamilies(colors: RawMeasures['colors'], brand?: BrandRef) {
  const refs: Record<string, number> = { ...SEMANTIC }
  if (brand) {
    refs.accent = rgbToOklch(hexToRgb(brand.accent)).h
    refs.marque = rgbToOklch(hexToRgb(brand.primary)).h
  }
  const known = new Map<string, number>()
  const off = new Map<number, { count: number; sample: string }>()
  for (const color of colors) {
    const parsed = parseCssColor(color.css)
    if (!parsed || parsed.alpha < 0.5) continue
    const { c, h } = rgbToOklch(parsed.rgb)
    if (c < VIVID_CHROMA) continue
    // la marque d'abord : si primary est rouge, le rouge compte comme marque
    const match = ['marque', 'accent', ...Object.keys(SEMANTIC)].find((k) => refs[k] !== undefined && hueDistance(h, refs[k]!) <= HUE_TOLERANCE)
    if (match) known.set(match, (known.get(match) ?? 0) + color.count)
    else {
      const bucket = Math.round(h / HUE_TOLERANCE) * HUE_TOLERANCE
      const entry = off.get(bucket) ?? { count: 0, sample: color.sample }
      entry.count += color.count
      off.set(bucket, entry)
    }
  }
  return {
    known: [...known.entries()].map(([name, count]) => ({ name, count })),
    off: [...off.entries()].map(([h, e]) => ({ name: `${hueName(h)} ${h}°`, count: e.count, sample: e.sample })),
  }
}

/** Valeurs distinctes à 0,5 px près (arrondis du navigateur). */
function distinct<T extends { px: number }>(items: T[]): T[] {
  const seen = new Map<number, T>()
  for (const item of items) {
    const key = Math.round(item.px * 2) / 2
    if (!seen.has(key)) seen.set(key, item)
  }
  return [...seen.values()].sort((a, b) => a.px - b.px)
}

/** Transforme le relevé en mesures avec seuils ; une mesure est en défaut si value > max. */
export function scoreMeasures(raw: RawMeasures, brand?: BrandRef): Metric[] {
  const families = hueFamilies(raw.colors, brand)
  const metrics: Metric[] = [
    {
      key: 'hues',
      label: 'teintes vives',
      value: families.known.length + families.off.length,
      max: LIMITS.hues,
      detail: [...families.known.map((f) => `${f.name} (${f.count})`), ...families.off.map((f) => `${f.name} (${f.count})`)],
    },
  ]
  if (brand) {
    metrics.push({ key: 'offBrand', label: 'teintes hors marque', value: families.off.length, max: 0, detail: families.off.map((f) => `${f.name} : ${f.sample}`) })
    const allowed = [0, ...brand.radii]
    const off = distinct(raw.radii).filter((r) => !allowed.some((a) => Math.abs(a - r.px) <= 1))
    metrics.push({ key: 'radii', label: 'rayons hors échelle', value: off.length, max: 0, detail: off.map((r) => `${r.px}px : ${r.sample}`) })
  }
  const sizes = distinct(raw.fontSizes)
  metrics.push({ key: 'sizes', label: 'tailles de texte', value: sizes.length, max: LIMITS.sizes, detail: sizes.map((s) => `${s.px}px`) })
  metrics.push({ key: 'families', label: 'polices', value: raw.fontFamilies.length, max: LIMITS.families, detail: raw.fontFamilies })
  metrics.push({ key: 'gradients', label: 'dégradés', value: raw.gradients.length, max: 0, detail: raw.gradients })
  metrics.push({ key: 'emoji', label: 'emoji', value: raw.emoji.length, max: 0, detail: raw.emoji })
  const named = raw.actions.filter((a) => a.label)
  const counts = new Map<string, number>()
  for (const a of named) counts.set(a.label.toLowerCase(), (counts.get(a.label.toLowerCase()) ?? 0) + 1)
  const dupes = [...counts.entries()].filter(([, n]) => n > 1)
  metrics.push({ key: 'duplicates', label: 'libellés d’action en double', value: dupes.length, max: 0, detail: dupes.map(([l, n]) => `« ${l} » x${n}`) })
  const unnamed = raw.actions.filter((a) => !a.label)
  metrics.push({ key: 'unnamed', label: 'actions sans nom', value: unnamed.length, max: 0, detail: unnamed.map((a) => `${a.w}x${a.h}px`) })
  const small = raw.actions.filter((a) => Math.min(a.w, a.h) < LIMITS.target)
  metrics.push({ key: 'targets', label: `cibles < ${LIMITS.target} px`, value: small.length, max: 0, detail: small.map((a) => `${a.label || '(sans nom)'} ${a.w}x${a.h}`) })
  return metrics
}

export const failing = (metrics: Metric[]) => metrics.filter((m) => m.value > m.max)

/**
 * Relevé dans la page. Fonction autonome : sérialisée par Playwright, elle ne doit rien capturer.
 * Ne garde que les éléments visibles ; les rayons « pilule » (>= moitié du petit côté) sont ignorés.
 */
export function collectMeasures(): RawMeasures {
  const label = (el: Element) => (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40)
  const colors = new Map<string, { css: string; count: number; sample: string }>()
  const addColor = (css: string, el: Element) => {
    if (!css || css === 'none' || css.startsWith('url')) return
    const entry = colors.get(css) ?? { css, count: 0, sample: label(el) || el.tagName.toLowerCase() }
    entry.count += 1
    colors.set(css, entry)
  }
  const radii: { px: number; sample: string }[] = []
  const fontSizes: { px: number; sample: string }[] = []
  const families = new Set<string>()
  const gradients: string[] = []
  const emoji: string[] = []
  const pictograph = /\p{Extended_Pictographic}/u
  for (const el of Array.from(document.body.querySelectorAll('*'))) {
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) continue
    const style = getComputedStyle(el)
    if (style.visibility === 'hidden' || Number(style.opacity) === 0) continue
    addColor(style.backgroundColor, el)
    if (parseFloat(style.borderTopWidth) > 0) addColor(style.borderTopColor, el)
    if (el instanceof SVGElement) {
      addColor(style.stroke, el)
      addColor(style.fill, el)
    }
    if (style.backgroundImage.includes('gradient')) gradients.push(label(el) || el.tagName.toLowerCase())
    // barres, lignes de squelette, points : rayon à peine visible sous 24 px de haut
    const radius = parseFloat(style.borderTopLeftRadius)
    const side = Math.min(rect.width, rect.height)
    if (side >= 24 && radius > 0 && radius < side / 2 - 1) radii.push({ px: radius, sample: label(el) || el.tagName.toLowerCase() })
    const text = el.children.length === 0 ? (el.textContent ?? '').trim() : ''
    if (text) {
      addColor(style.color, el)
      fontSizes.push({ px: parseFloat(style.fontSize), sample: text.slice(0, 30) })
      families.add(style.fontFamily.split(',')[0]!.trim().replace(/["']/g, ''))
      if (pictograph.test(text.replace(/[©®™]/g, ''))) emoji.push(text.slice(0, 30))
    }
  }
  const actions = Array.from(document.body.querySelectorAll('button, a[href], [role="button"], [role="link"], [role="tab"], [role="switch"], [role="checkbox"], [role="radio"]'))
    .map((el) => ({ el, rect: el.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 0 && rect.height > 0)
    .map(({ el, rect }) => ({ label: label(el), aria: el.hasAttribute('aria-label'), w: Math.round(rect.width), h: Math.round(rect.height) }))
  return { colors: [...colors.values()], radii, fontSizes, fontFamilies: [...families].filter(Boolean), gradients: [...new Set(gradients)], emoji: [...new Set(emoji)], actions }
}
