import { describe, expect, it } from 'bun:test'

import { defineBrand } from '../../packages/theme/src/brand'
import { directionProblems, iconFiles, logoColors, logoGradient, markDefs, placement, primitive, SAFE_RADIUS, starterDirection, type Direction } from '../lib/logo'
import { bbox, holes, iou, maxRadius, normalize, strokeWidth, type Mask } from '../lib/logo-check'
import { sheetSvg, wrap } from '../lib/logo-sheet'

const brand = { primary: '#2F6F5E', accent: '#F2A541', font: 'inter', radius: 'lg', tone: 'pro', direction: 'clean' } as const
const colors = logoColors(brand)
const disc: Direction = {
  name: 'coche',
  idea: 'Une coche creusée dans un disque.',
  kind: 'negative',
  background: 'primary',
  ink: 'white',
  mark: [
    { shape: 'circle', cx: 24, cy: 24, r: 20 },
    { op: 'cut', shape: 'polygon', points: [[13, 24], [17, 20], [22, 25], [32, 15], [36, 19], [22, 33]] },
  ],
}

/** Masque dessiné par une fonction (x, y) -> encre ou non. */
function mask(w: number, h: number, ink: (x: number, y: number) => boolean): Mask {
  const data = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) data[y * w + x] = ink(x, y) ? 1 : 0
  return { w, h, data }
}

describe('recettes de logo', () => {
  it('accepte une direction conforme', () => {
    expect(directionProblems(disc, colors)).toEqual([])
  })

  it('refuse coordonnées hors grille, texte long, contraste faible et première forme qui découpe', () => {
    const bad: Direction = {
      ...disc,
      name: 'Mauvais nom',
      background: 'light',
      ink: 'white',
      mark: [
        { op: 'cut', shape: 'rect', x: 1.3, y: 0, w: 10, h: 10 },
        { shape: 'glyph', text: 'App', cx: 24, cy: 24, size: 20 },
      ],
    }
    const problems = directionProblems(bad, colors).join('\n')
    expect(problems).toContain('name en minuscules')
    expect(problems).toContain('contraste')
    expect(problems).toContain('première forme ajoute')
    expect(problems).toContain('x en unités ou demi-unités')
    expect(problems).toContain('1 ou 2 caractères')
  })

  it('ne prend que les couleurs de la marque', () => {
    expect(colors.primary).toBe('#2F6F5E')
    expect(colors.accent).toBe('#F2A541')
    expect(colors.white).toBe('#ffffff')
  })

  it('rend arcs et anneaux en chemins, et un arc complet en anneau', () => {
    expect(primitive({ shape: 'arc', cx: 24, cy: 24, r: 20, width: 6, start: 0, end: 90 })).toContain('A20 20 0 0 1 44 24')
    expect(primitive({ shape: 'arc', cx: 24, cy: 24, r: 20, width: 6, start: 0, end: 360 })).toContain('fill-rule="evenodd"')
  })

  it('compose les opérations par masques successifs', () => {
    const { defs, id } = markDefs({ ...disc, mark: [...disc.mark, { op: 'xor', shape: 'rect', x: 20, y: 20, w: 8, h: 8 }] })
    expect(id).toBe('m2')
    expect(defs).toContain('<mask id="m1k"')
    expect(defs).toContain('mask="url(#m2a)"')
    expect(defs).toContain('mask="url(#m2b)"')
  })

  it('pose le symbole au centre, et dans le cercle sûr pour Android', () => {
    const box = { x: 4, y: 4, w: 40, h: 40 }
    const icon = placement(box, 'icon')
    expect(icon.scale * 40).toBeCloseTo(1024 * 0.6, 0)
    expect(icon.tx + 24 * icon.scale).toBeCloseTo(512, 0)
    const fg = placement(box, 'foreground')
    expect((Math.hypot(40, 40) / 2) * fg.scale).toBeLessThanOrEqual(SAFE_RADIUS)
  })

  it('écrit les quatre fichiers source ; un fond uni reste un aplat, sans relief', () => {
    const files = iconFiles(disc, { x: 4, y: 4, w: 40, h: 40 }, colors)
    expect(Object.keys(files)).toEqual(['icon.svg', 'foreground.svg', 'background.svg', 'monochrome.svg'])
    expect(Object.values(files).join('')).not.toContain('Gradient')
    expect(Object.values(files).join('')).not.toContain('filter')
    expect(files['monochrome.svg']).toContain('fill="#ffffff"')
    expect(files['background.svg']).toContain(colors.primary)
  })

  it('fond en dégradé : dégradé de la direction, reflet, ombre portée ; version à plat pour les mesures', () => {
    const soft = defineBrand({ primary: '#4F46E5', accent: '#F97316', direction: 'soft' })
    const stops = logoGradient(soft)
    expect(stops).toHaveLength(3)
    const { direction, bbox } = starterDirection('C')
    expect(directionProblems(direction, logoColors(soft), stops)).toEqual([])
    const files = iconFiles(direction, bbox, logoColors(soft), { stops })
    expect(files['icon.svg']).toContain('fill="url(#bgG)"')
    expect(files['icon.svg']).toContain('url(#hl)')
    expect(files['icon.svg']).toContain('filter="url(#sh)"')
    expect(files['monochrome.svg']).not.toContain('filter')
    const flat = iconFiles(direction, bbox, logoColors(soft), { stops, flat: true })
    expect(flat['icon.svg']).not.toContain('Gradient')
  })

  it('refuse un dégradé illisible sous l’encre, sur chacune de ses nuances', () => {
    const soft = defineBrand({ primary: '#4F46E5', accent: '#F97316', direction: 'soft' })
    const { direction } = starterDirection('A')
    expect(directionProblems({ ...direction, ink: 'primary' }, logoColors(soft), logoGradient(soft)).join(' ')).toContain('contraste')
  })
})

describe('vérifications de logo', () => {
  it('mesure l’épaisseur d’un trait', () => {
    const bar = mask(100, 100, (x) => x >= 40 && x < 60)
    expect(strokeWidth(bar)).toBeGreaterThan(17)
    expect(strokeWidth(bar)).toBeLessThan(23)
  })

  it('compte les contreformes et ignore le fond ouvert', () => {
    const ring = mask(100, 100, (x, y) => {
      const d = Math.hypot(x - 50, y - 50)
      return d < 40 && d > 20
    })
    expect(holes(ring)).toBe(1)
    const c = mask(100, 100, (x, y) => {
      const d = Math.hypot(x - 50, y - 50)
      return d < 40 && d > 20 && x < 70
    })
    expect(holes(c)).toBe(0)
  })

  it('compare deux silhouettes recadrées', () => {
    const big = mask(100, 100, (x, y) => x > 10 && x < 90 && y > 10 && y < 90)
    const small = mask(100, 100, (x, y) => x > 40 && x < 60 && y > 40 && y < 60)
    expect(iou(normalize(big), normalize(small))).toBeGreaterThan(0.9)
    const bar = mask(100, 100, (x) => x > 45 && x < 55)
    expect(iou(normalize(big), normalize(bar))).toBeLessThan(0.3)
  })

  it('trouve la boîte et le rayon de l’encre', () => {
    const dot = mask(100, 100, (x, y) => Math.hypot(x - 50, y - 50) < 10)
    expect(bbox(dot)).toEqual({ x: 41, y: 41, w: 19, h: 19 })
    expect(maxRadius(dot)).toBeLessThan(11)
  })
})

describe('planche', () => {
  it('coupe les idées longues et échappe les textes', () => {
    expect(wrap('un deux trois quatre cinq six', 10, 2)).toEqual(['un deux', 'trois…'])
    const svg = sheetSvg([{ d: { ...disc, idea: '<b>' }, ok: true, failing: [], images: { 220: 'a', 120: 'a', 60: 'a', 48: 'a', 16: 'a' }, themed: 'a' }], 'A&B')
    expect(svg).not.toContain('<b>')
    expect(svg).toContain('A&#38;B')
  })
})
