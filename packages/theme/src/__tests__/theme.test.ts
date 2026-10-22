import { contrastRatio } from '../color'
import { createBrandTheme, defineBrand, SHADES } from '../index'
import { semanticRadius } from '../tone'

const BRANDS = {
  playful: defineBrand({
    primary: '#7C3AED',
    accent: '#F59E0B',
    font: 'inter',
    radius: 'full',
    tone: 'playful',
  }),
  pro: defineBrand({
    primary: '#0F62FE',
    accent: '#08BDBA',
    font: 'system',
    radius: 'md',
    tone: 'pro',
  }),
  minimal: defineBrand({
    primary: '#111827',
    accent: '#10B981',
    font: 'inter',
    radius: 'sm',
    tone: 'minimal',
  }),
}

describe.each(Object.entries(BRANDS))('marque %s', (name, brand) => {
  const theme = createBrandTheme(brand)

  it('produit des palettes de 11 nuances contenant la couleur exacte', () => {
    expect(theme.palettes.brand).toHaveLength(SHADES.length)
    expect(theme.palettes.brand).toContain(brand.primary.toLowerCase())
    expect(theme.palettes.accent).toContain(brand.accent.toLowerCase())
  })

  it('génère les thèmes racine et les sous-thèmes attendus', () => {
    for (const key of [
      'light',
      'dark',
      'light_brand',
      'dark_accent',
      'light_success',
      'light_warning',
      'dark_danger',
      'light_destructive',
    ]) {
      expect(theme.themes).toHaveProperty(key)
    }
  })

  it('garde un texte lisible (WCAG AA) sur le fond principal et sur brand', () => {
    for (const scheme of ['light', 'dark', 'light_brand', 'dark_brand'] as const) {
      const t = theme.themes[scheme] as Record<string, string>
      expect(contrastRatio(t.background!, t.color!)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('reste stable (snapshot)', () => {
    expect({
      palettes: theme.palettes,
      radius: semanticRadius(brand),
      light: theme.themes.light,
      dark_brand: theme.themes.dark_brand,
    }).toMatchSnapshot(name)
  })
})
