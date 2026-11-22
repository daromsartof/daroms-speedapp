// Logo de l'app : recettes sur une grille (assets/source/logo.json) rendues en SVG. Les agents placent bien
// des formes et dessinent mal les courbes : une direction = des formes simples, combinées, en unités de grille.
// Méthode inspirée de make-logo (design.how, MIT) ; ni calque, ni logo de marque en entrée.
import { contrastRatio } from '../../packages/theme/src/color'
import { createBrandPalettes } from '../../packages/theme/src/themes'
import type { Brand } from '../../packages/theme/src/brand'

type Common = {
  op?: 'add' | 'cut' | 'keep' | 'xor'
  rotate?: number
  pivot?: [number, number]
  mirror?: 'x' | 'y'
  repeat?: { count: number; rotate?: number; step?: [number, number] }
}
export type Shape = Common &
  (
    | { shape: 'rect'; x: number; y: number; w: number; h: number; r?: number }
    | { shape: 'circle'; cx: number; cy: number; r: number }
    | { shape: 'ring'; cx: number; cy: number; r: number; width: number }
    | { shape: 'arc'; cx: number; cy: number; r: number; width: number; start: number; end: number }
    | { shape: 'polygon'; points: [number, number][] }
    | { shape: 'glyph'; text: string; cx: number; cy: number; size: number; weight?: 500 | 600 | 700 | 800 }
  )

export const KINDS = ['monogram', 'negative', 'stencil', 'symbol', 'wordmark', 'construction'] as const
export const COLORS = ['primary', 'accent', 'light', 'dark', 'white'] as const
export type ColorRef = (typeof COLORS)[number]
export type Direction = { name: string; idea: string; kind: (typeof KINDS)[number]; grid?: number; background: ColorRef; ink: ColorRef; mark: Shape[] }

/** Couleurs autorisées : celles de brand.ts et ses neutres, jamais une couleur inventée. */
export function logoColors(brand: Brand): Record<ColorRef, string> {
  const { surface } = createBrandPalettes(brand)
  return { primary: brand.primary, accent: brand.accent, light: surface[1]!, dark: surface[10]!, white: '#ffffff' }
}

const half = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && Math.abs(v * 2 - Math.round(v * 2)) < 1e-9

/** Problèmes d'une direction (vide = conforme). */
export function directionProblems(d: Direction, colors: Record<ColorRef, string>): string[] {
  const at = `« ${d.name ?? '?'} »`
  const p: string[] = []
  if (!/^[a-z0-9-]{2,24}$/.test(d.name ?? '')) p.push(`${at} : name en minuscules, chiffres, tirets (2 à 24)`)
  if (!d.idea || d.idea.length > 120) p.push(`${at} : idea, une phrase de 120 caractères au plus`)
  if (!KINDS.includes(d.kind)) p.push(`${at} : kind parmi ${KINDS.join(', ')}`)
  if (!COLORS.includes(d.background) || !COLORS.includes(d.ink)) p.push(`${at} : background et ink parmi ${COLORS.join(', ')}`)
  else if (contrastRatio(colors[d.background], colors[d.ink]) < 3) p.push(`${at} : contraste ink/background ${contrastRatio(colors[d.background], colors[d.ink]).toFixed(1)}:1 (min 3:1)`)
  const grid = d.grid ?? 48
  if (!Array.isArray(d.mark) || d.mark.length < 1 || d.mark.length > 12) p.push(`${at} : mark, 1 à 12 formes`)
  ;(d.mark ?? []).forEach((s, i) => {
    const where = `${at} mark[${i}]`
    if (i === 0 && s.op && s.op !== 'add') p.push(`${where} : la première forme ajoute (op add)`)
    const nums = Object.entries(s).filter(([k]) => !['shape', 'op', 'text', 'weight', 'mirror', 'repeat', 'rotate', 'start', 'end'].includes(k))
    for (const [k, v] of nums) {
      const values = (k === 'points' ? (v as number[][]).flat() : Array.isArray(v) ? v : [v]) as unknown[]
      if (!values.every(half)) p.push(`${where} : ${k} en unités ou demi-unités de grille`)
      else if (values.some((n) => (n as number) < -grid || (n as number) > grid * 2)) p.push(`${where} : ${k} hors de la grille`)
    }
    if (s.shape === 'glyph' && (!s.text || [...s.text].length > 2)) p.push(`${where} : glyph, 1 ou 2 caractères (pas de texte long dans une icône)`)
    if (s.repeat && (s.repeat.count < 2 || s.repeat.count > 12)) p.push(`${where} : repeat.count de 2 à 12`)
  })
  return p
}

const n = (v: number) => Number(v.toFixed(3))
const polar = (cx: number, cy: number, r: number, deg: number) => [n(cx + r * Math.sin((deg * Math.PI) / 180)), n(cy - r * Math.cos((deg * Math.PI) / 180))]
const circlePath = (cx: number, cy: number, r: number) => `M${n(cx - r)} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`

/** Une forme seule, sans couleur (la couleur vient du groupe qui l'utilise). */
export function primitive(s: Shape): string {
  switch (s.shape) {
    case 'rect':
      return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}"${s.r ? ` rx="${s.r}"` : ''}/>`
    case 'circle':
      return `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}"/>`
    case 'ring':
      return `<path fill-rule="evenodd" d="${circlePath(s.cx, s.cy, s.r)}${circlePath(s.cx, s.cy, s.r - s.width)}"/>`
    case 'arc': {
      const sweep = (((s.end - s.start) % 360) + 360) % 360 || 360
      if (sweep >= 360) return primitive({ shape: 'ring', cx: s.cx, cy: s.cy, r: s.r, width: s.width })
      const large = sweep > 180 ? 1 : 0
      const inner = s.r - s.width
      const [a, b] = polar(s.cx, s.cy, s.r, s.start)
      const [c, d] = polar(s.cx, s.cy, s.r, s.start + sweep)
      const [e, f] = polar(s.cx, s.cy, inner, s.start + sweep)
      const [g, h] = polar(s.cx, s.cy, inner, s.start)
      return `<path d="M${a} ${b}A${s.r} ${s.r} 0 ${large} 1 ${c} ${d}L${e} ${f}A${inner} ${inner} 0 ${large} 0 ${g} ${h}Z"/>`
    }
    case 'polygon':
      return `<polygon points="${s.points.map((pt) => pt.join(',')).join(' ')}"/>`
    case 'glyph': {
      // centre de la capitale : ligne de base à cy + moitié de la hauteur de capitale d'Inter (0,727 em)
      const text = s.text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)
      return `<text x="${s.cx}" y="${n(s.cy + s.size * 0.3635)}" font-family="Inter" font-weight="${s.weight ?? 700}" font-size="${s.size}" text-anchor="middle">${text}</text>`
    }
  }
}

/** Les exemplaires d'une forme : rotation, miroir, répétition (autour du centre de la grille par défaut). */
export function instances(s: Shape, grid: number): string {
  const [px, py] = s.pivot ?? [grid / 2, grid / 2]
  const mirror = s.mirror === 'x' ? `translate(${grid} 0) scale(-1 1)` : s.mirror === 'y' ? `translate(0 ${grid}) scale(1 -1)` : ''
  const count = s.repeat?.count ?? 1
  const out: string[] = []
  for (let k = 0; k < count; k++) {
    const t = [
      s.repeat?.step ? `translate(${s.repeat.step[0] * k} ${s.repeat.step[1] * k})` : '',
      (s.rotate ?? 0) + (s.repeat?.rotate ?? 0) * k ? `rotate(${(s.rotate ?? 0) + (s.repeat?.rotate ?? 0) * k} ${px} ${py})` : '',
      mirror,
    ].filter(Boolean)
    out.push(t.length ? `<g transform="${t.join(' ')}">${primitive(s)}</g>` : primitive(s))
  }
  return out.join('')
}

/**
 * Le symbole en SVG : chaque forme ajoute, découpe, garde (intersection) ou inverse (ou exclusif) ce qui précède,
 * par masques successifs. Renvoie les définitions et l'id du résultat, sans couleur.
 */
export function markDefs(d: Direction, prefix = 'm'): { defs: string; id: string } {
  const grid = d.grid ?? 48
  const box = `x="${-grid}" y="${-grid}" width="${grid * 3}" height="${grid * 3}"`
  const area = `<rect ${box} fill="white"/>`
  let defs = ''
  let cur = ''
  d.mark.forEach((s, i) => {
    const el = instances(s, grid)
    const id = `${prefix}${i}`
    const prev = cur ? `<use href="#${cur}"/>` : ''
    const mask = (name: string, body: string) => `<mask id="${name}" maskUnits="userSpaceOnUse" ${box}>${body}</mask>`
    const op = i === 0 ? 'add' : (s.op ?? 'add')
    if (op === 'add') defs += `<g id="${id}">${prev}${el}</g>`
    else if (op === 'cut') defs += `${mask(`${id}k`, `${area}<g fill="black">${el}</g>`)}<g id="${id}" mask="url(#${id}k)">${prev}</g>`
    else if (op === 'keep') defs += `${mask(`${id}k`, `<g fill="white">${el}</g>`)}<g id="${id}" mask="url(#${id}k)">${prev}</g>`
    else
      defs +=
        mask(`${id}a`, `${area}<g fill="black">${el}</g>`) +
        mask(`${id}b`, `<g fill="white">${el}</g><g fill="black">${prev}</g>`) +
        `<g id="${id}"><g mask="url(#${id}a)">${prev}</g><g mask="url(#${id}b)">${el}</g></g>`
    cur = id
  })
  return { defs, id: cur }
}

export type Box = { x: number; y: number; w: number; h: number }
export const ICON = 1024
/** Le symbole tient dans 60 % de l'icône ; sur Android, dans le cercle sûr de 66 dp sur 108 (61 %). */
export const MARK_SHARE = 0.6
export const SAFE_RADIUS = (ICON * 0.61) / 2

/**
 * Groupe qui dessine le symbole : un contour de la même couleur, très fin, comble le liseré d'anticrénelage
 * entre deux formes jointives (les masques de découpe s'appliquent après, les découpes restent nettes).
 */
export const inkGroup = (fill: string, grid: number) => `fill="${fill}" stroke="${fill}" stroke-width="${n(grid / 800)}" stroke-linejoin="round"`

/** Échelle et translation qui posent la boîte du symbole (unités de grille) au centre, selon la cible. */
export function placement(bbox: Box, target: 'icon' | 'foreground'): { scale: number; tx: number; ty: number } {
  let scale = (ICON * MARK_SHARE) / Math.max(bbox.w, bbox.h)
  if (target === 'foreground') scale = Math.min(scale, (SAFE_RADIUS * 0.96) / (Math.hypot(bbox.w, bbox.h) / 2))
  return { scale: n(scale), tx: n(ICON / 2 - (bbox.x + bbox.w / 2) * scale), ty: n(ICON / 2 - (bbox.y + bbox.h / 2) * scale) }
}

/** Les quatre fichiers source d'une direction : icône, premier plan et fond Android, couche monochrome. */
export function iconFiles(d: Direction, bbox: Box, colors: Record<ColorRef, string>) {
  const { defs, id } = markDefs(d)
  const svg = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON}" height="${ICON}" viewBox="0 0 ${ICON} ${ICON}">${body}</svg>`
  const place = (target: 'icon' | 'foreground', fill: string) => {
    const { scale, tx, ty } = placement(bbox, target)
    return `<defs>${defs}</defs><g transform="translate(${tx} ${ty}) scale(${scale})" ${inkGroup(fill, d.grid ?? 48)}><use href="#${id}"/></g>`
  }
  const bg = `<rect width="${ICON}" height="${ICON}" fill="${colors[d.background]}"/>`
  return {
    'icon.svg': svg(bg + place('icon', colors[d.ink])),
    'foreground.svg': svg(place('foreground', colors[d.ink])),
    'background.svg': svg(bg),
    'monochrome.svg': svg(place('foreground', '#ffffff')),
  }
}

/** Le symbole seul, noir sur transparent, cadré large (pour mesurer sa boîte). */
export function markOnly(d: Direction, size: number): string {
  const grid = d.grid ?? 48
  const { defs, id } = markDefs(d)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-grid / 2} ${-grid / 2} ${grid * 2} ${grid * 2}"><defs>${defs}</defs><g ${inkGroup('black', grid)}><use href="#${id}"/></g></svg>`
}
