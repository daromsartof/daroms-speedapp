import { describe, expect, it } from 'bun:test'

import { failing, hueFamilies, parseCssColor, scoreMeasures, type RawMeasures } from '../lib/taste'

const empty: RawMeasures = { colors: [], radii: [], fontSizes: [], fontFamilies: ['Inter'], gradients: [], emoji: [], actions: [] }
const brand = { primary: '#2F6F5E', accent: '#F2A541', radii: [12, 18, 26] }
const metric = (raw: RawMeasures, key: string) => scoreMeasures(raw, brand).find((m) => m.key === key)!

describe('mesures de goût', () => {
  it('lit rgb et rgba', () => {
    expect(parseCssColor('rgb(255, 0, 0)')).toEqual({ rgb: [1, 0, 0], alpha: 1 })
    expect(parseCssColor('rgba(0, 0, 0, 0)')?.alpha).toBe(0)
    expect(parseCssColor('transparent')).toBeNull()
  })

  it('rattache les teintes à la marque et isole le reste', () => {
    const colors = [
      { css: 'rgb(47, 111, 94)', count: 5, sample: 'Ajouter' },
      { css: 'rgb(242, 165, 65)', count: 2, sample: 'Badge' },
      { css: 'rgb(124, 58, 237)', count: 1, sample: 'Promo' },
      { css: 'rgb(250, 250, 249)', count: 40, sample: 'fond' },
      { css: 'rgba(124, 58, 237, 0.1)', count: 3, sample: 'voile' },
    ]
    const families = hueFamilies(colors, brand)
    expect(families.known.map((f) => f.name).sort()).toEqual(['accent', 'marque'])
    expect(families.off).toHaveLength(1)
    expect(families.off[0]!.sample).toBe('Promo')
    expect(metric({ ...empty, colors }, 'offBrand').value).toBe(1)
  })

  it('signale les rayons hors échelle de brand.ts', () => {
    const radii = [
      { px: 12, sample: 'Button' },
      { px: 18.4, sample: 'Card' },
      { px: 6, sample: 'Badge maison' },
    ]
    const m = metric({ ...empty, radii }, 'radii')
    expect(m.value).toBe(1)
    expect(m.detail[0]).toContain('Badge maison')
  })

  it('compte libellés en double, actions sans nom et petites cibles', () => {
    const actions = [
      { label: 'Ajouter', aria: false, w: 320, h: 48 },
      { label: 'ajouter', aria: false, w: 48, h: 48 },
      { label: '', aria: false, w: 20, h: 20 },
    ]
    const raw = { ...empty, actions }
    expect(metric(raw, 'duplicates').value).toBe(1)
    expect(metric(raw, 'unnamed').value).toBe(1)
    expect(metric(raw, 'targets').value).toBe(1)
  })

  it('passe un écran sobre et échoue sur emoji, dégradé et trop de tailles', () => {
    expect(failing(scoreMeasures(empty, brand))).toEqual([])
    const sizes = [12, 14, 16, 18, 20, 24, 32].map((px) => ({ px, sample: 't' }))
    const bad = failing(scoreMeasures({ ...empty, fontSizes: sizes, emoji: [`Bravo ${String.fromCodePoint(0x1f389)}`], gradients: ['Hero'] }, brand)).map((m) => m.key)
    expect(bad.sort()).toEqual(['emoji', 'gradients', 'sizes'])
  })

  it('sans marque, ne mesure ni teintes hors marque ni rayons', () => {
    const keys = scoreMeasures(empty).map((m) => m.key)
    expect(keys).not.toContain('offBrand')
    expect(keys).not.toContain('radii')
  })
})
