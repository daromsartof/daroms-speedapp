import { describe, expect, it } from 'bun:test'

import { defineBrand } from '../../packages/theme/src/brand'
import { contrastRatio } from '../../packages/theme/src/color'
import { brandGradients, DIRECTIONS, displayFontFile, mixOklch } from '../../packages/theme/src/direction'
import { createBrandPalettes } from '../../packages/theme/src/themes'
import { ILLUSTRATIONS, illustrationColors, illustrationSvg } from '../../packages/ui/src/illustrations/scenes'
import { fontsModule } from '../lib/fonts'
import { FIRST_IMPRESSION_KEYS, firstImpressionDefaults, unchangedTexts } from '../lib/placeholders'

const BRANDS = [
  ['#4F46E5', '#F97316'],
  ['#0F766E', '#F59E0B'],
  ['#FFD84D', '#2F3A8F'],
  ['#E11D48', '#7C3AED'],
  ['#2F6F5E', '#F2A541'],
] as const

describe('directions artistiques', () => {
  it('garde le texte posé sur le dégradé lisible (3:1 sur chaque arrêt), pour toute marque et direction', () => {
    for (const [primary, accent] of BRANDS)
      for (const direction of Object.keys(DIRECTIONS) as (keyof typeof DIRECTIONS)[]) {
        const g = brandGradients(direction, createBrandPalettes(defineBrand({ primary, accent, direction })))
        for (const mode of ['light', 'dark'] as const) for (const stop of g.brand[mode]) expect(contrastRatio(stop, g.on[mode])).toBeGreaterThanOrEqual(3)
      }
  })

  it('mélange en OKLCH : le milieu indigo vers orange garde sa saturation (pas de gris)', () => {
    const mid = mixOklch('#4F46E5', '#F97316', 0.5)
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(mid.slice(i, i + 2), 16))
    expect(Math.max(r!, g!, b!) - Math.min(r!, g!, b!)).toBeGreaterThan(90)
  })

  it('choisit la police des titres de la direction, à la graisse du ton, et rien pour clean', () => {
    expect(displayFontFile(defineBrand({ primary: '#4F46E5', accent: '#F97316', direction: 'soft' }), '700')).toBe('@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf')
    expect(fontsModule(defineBrand({ primary: '#4F46E5', accent: '#F97316', direction: 'editorial', tone: 'minimal' }))).toContain("require('@expo-google-fonts/fraunces/600SemiBold/Fraunces_600SemiBold.ttf')")
    expect(fontsModule(defineBrand({ primary: '#4F46E5', accent: '#F97316' }))).toContain('= {}')
  })

  it('les fichiers de police existent dans les paquets installés', () => {
    for (const direction of ['editorial', 'soft', 'vivid'] as const)
      for (const weight of ['600', '700', '800'] as const) {
        const file = displayFontFile(defineBrand({ primary: '#4F46E5', accent: '#F97316', direction }), weight)!
        expect(Bun.file(`${import.meta.dir}/../../node_modules/${file}`).size).toBeGreaterThan(10_000)
      }
  })
})

describe('illustrations', () => {
  it('rend chaque scène en SVG autonome, aux seules couleurs de la marque, sans filtre', () => {
    const brand = defineBrand({ primary: '#4F46E5', accent: '#F97316', direction: 'soft' })
    const p = createBrandPalettes(brand)
    const colors = illustrationColors(p, brandGradients('soft', p).brand.light)
    const allowed = new Set([...Object.values(colors).map((c) => c.toLowerCase()), 'none'])
    for (const name of ILLUSTRATIONS) {
      const svg = illustrationSvg(name, colors, `t-${name}`)
      expect(svg.startsWith('<svg')).toBe(true)
      expect(svg).not.toContain('filter')
      expect(svg).not.toContain('undefined')
      for (const [, color] of svg.matchAll(/(?:fill|stroke|stop-color)="([^"]+)"/g)) if (!color!.startsWith('url(')) expect(allowed.has(color!.toLowerCase())).toBe(true)
    }
  })
})

describe('textes de première impression', () => {
  it('repère les textes restés ceux du gabarit, dans au moins une langue', () => {
    const defaults = firstImpressionDefaults()
    for (const key of FIRST_IMPRESSION_KEYS) expect(defaults[key]?.fr).toBeTruthy()
    const app = { fr: { home: { welcome: 'Vos lectures, en un regard' }, onboarding: { page1Title: defaults['onboarding.page1Title']!.fr } }, en: {} }
    const left = unchangedTexts(app, defaults)
    expect(left).toContain('onboarding.page1Title')
    expect(left).not.toContain('home.welcome')
  })
})
