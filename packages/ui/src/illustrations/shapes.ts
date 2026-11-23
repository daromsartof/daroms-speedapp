// Illustrations : formes de base et couleurs. Sans filtre SVG (rendu identique sur iOS, Android et web).

export type IllustrationColors = {
  /** brand-100 .. brand-700 */
  b1: string
  b2: string
  b3: string
  b4: string
  b5: string
  b6: string
  b7: string
  /** accent-200 .. accent-500 */
  a2: string
  a3: string
  a4: string
  a5: string
  /** dégradé de la direction (3 arrêts) */
  g1: string
  g2: string
  g3: string
  /** texte et formes posés sur le dégradé (toujours clair) */
  on: string
  /** surface des cartes, trait discret, ombre */
  card: string
  line: string
  shadow: string
}

export const ILLUSTRATIONS = ['welcome', 'growth', 'chat', 'secure', 'empty', 'success', 'calendar', 'focus', 'community', 'spark'] as const
export type IllustrationName = (typeof ILLUSTRATIONS)[number]

/** Format commun : 320 x 240. */
export const VIEWBOX = { w: 320, h: 240 } as const

export const n = (v: number) => Math.round(v * 10) / 10

/** Dégradé linéaire de la direction, en diagonale. */
export const brandGrad = (id: string, c: IllustrationColors) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.g1}"/><stop offset="0.55" stop-color="${c.g2}"/><stop offset="1" stop-color="${c.g3}"/></linearGradient>`
export const softGrad = (id: string, from: string, to: string) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>`

/** Carte posée : deux ombres décalées (sans filtre, rendu identique sur iOS, Android et web) puis la surface. */
export function card(x: number, y: number, w: number, h: number, r: number, c: IllustrationColors, fill = c.card) {
  return (
    `<rect x="${x + 2}" y="${y + 10}" width="${w - 4}" height="${h}" rx="${r}" fill="${c.shadow}" opacity="0.06"/>` +
    `<rect x="${x}" y="${y + 4}" width="${w}" height="${h}" rx="${r}" fill="${c.shadow}" opacity="0.07"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`
  )
}
export const bar = (x: number, y: number, w: number, h: number, fill: string, opacity = 1) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"${opacity < 1 ? ` opacity="${opacity}"` : ''}/>`
/** Étincelle à 4 branches. */
export function star(cx: number, cy: number, s: number, fill: string) {
  const k = s * 0.28
  return `<path d="M${n(cx)} ${n(cy - s)} Q${n(cx + k)} ${n(cy - k)} ${n(cx + s)} ${n(cy)} Q${n(cx + k)} ${n(cy + k)} ${n(cx)} ${n(cy + s)} Q${n(cx - k)} ${n(cy + k)} ${n(cx - s)} ${n(cy)} Q${n(cx - k)} ${n(cy - k)} ${n(cx)} ${n(cy - s)}Z" fill="${fill}"/>`
}
export const dot = (cx: number, cy: number, r: number, fill: string, opacity = 1) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${opacity < 1 ? ` opacity="${opacity}"` : ''}/>`
export const ground = (c: IllustrationColors, cx = 160, w = 210) => `<ellipse cx="${cx}" cy="222" rx="${w / 2}" ry="9" fill="${c.shadow}" opacity="0.07"/>`
export const check = (cx: number, cy: number, s: number, stroke: string, width = 5) =>
  `<path d="M${n(cx - s)} ${n(cy)} L${n(cx - s * 0.3)} ${n(cy + s * 0.7)} L${n(cx + s)} ${n(cy - s * 0.65)}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`

export type Scene = (c: IllustrationColors, id: string) => string
