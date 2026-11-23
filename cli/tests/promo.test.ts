import { describe, expect, it } from 'bun:test'

import { autoStills, FEATURE_GRAPHIC, layout, parseSpec, pngInfo, promoColors, SIZES, slideLayout, STORE_SIZES, textProblems, timeline, TIMING } from '../lib/promo'
import { promoPage } from '../lib/promo-page'

const scene = (route: string, fr: string, en = 'Short caption') => ({ route, caption: { fr, en } })
const valid = {
  hook: { fr: 'Lisez plus, chaque jour', en: 'Read more, every day' },
  scenes: [scene('/books', 'Tous vos livres'), scene('/stats', 'Vos progrès en un coup d’œil')],
  end: { fr: 'Gratuit sur Android', en: 'Free on Android' },
}

describe('vidéo promo', () => {
  it('compte mots et caractères, refuse emoji et tiret long', () => {
    expect(textProblems('Tous vos livres', 'x')).toEqual([])
    expect(textProblems('Une phrase bien trop longue pour un écran', 'x')[0]).toContain('mots')
    expect(textProblems(`Bravo ${String.fromCodePoint(0x1f389)}`, 'x')).toEqual(['x : emoji interdit'])
    expect(textProblems(`Vite ${String.fromCharCode(0x2014)} bien`, 'x')).toEqual(['x : tiret long interdit'])
    expect(textProblems('', 'x')).toEqual(['x : texte manquant'])
  })

  it('valide la spec pour les langues rendues et complète les valeurs par défaut', () => {
    const { spec, problems } = parseSpec(valid, ['fr', 'en'])
    expect(problems).toEqual([])
    expect(spec?.format).toBe('vertical')
    expect(spec?.fps).toBe(30)
  })

  it('liste chaque problème : langue manquante, trop peu d’écrans, route invalide', () => {
    const { spec, problems } = parseSpec({ ...valid, scenes: [scene('books', 'Ok')] }, ['fr', 'de'])
    expect(spec).toBeUndefined()
    expect(problems).toContain('scenes : 2 à 5 écrans (reçu 1)')
    expect(problems).toContain('hook.de : texte manquant')
    expect(problems).toContain('scenes[0].route : chemin commençant par / attendu')
  })

  it('minute accroche, écrans et fin ; images fixes une fois chaque écran posé', () => {
    const { duration, segments } = timeline(3)
    expect(duration).toBeCloseTo(TIMING.hook + 3 * TIMING.scene + TIMING.end)
    expect(segments.map((s) => s.kind)).toEqual(['hook', 'scene', 'scene', 'scene', 'end'])
    const stills = autoStills(3)
    expect(stills).toHaveLength(5)
    expect(stills.at(-1)).toBeCloseTo(duration - 0.3)
  })

  it('garde le téléphone entier dans le cadre, quel que soit le format', () => {
    for (const format of ['vertical', 'landscape', 'square'] as const) {
      const { phone, w, h } = layout(format)
      expect([w, h]).toEqual([SIZES[format].w, SIZES[format].h])
      expect(phone.x + phone.w).toBeLessThanOrEqual(w)
      if (format !== 'square') expect(phone.y + phone.h).toBeLessThanOrEqual(h)
    }
  })

  it('tire les couleurs de la marque et garde un texte lisible sur l’aplat', () => {
    const dark = promoColors({ primary: '#2F3A8F', accent: '#F2A541', font: 'inter', radius: 'lg', tone: 'pro', direction: 'clean' })
    expect(dark.panel).toBe('#2F3A8F')
    expect(dark.onPanel).toBe(dark.bg)
    const light = promoColors({ primary: '#FFD84D', accent: '#2F3A8F', font: 'inter', radius: 'lg', tone: 'pro', direction: 'clean' })
    expect(light.onPanel).toBe(light.ink)
  })

  it('échappe les textes dans la page de composition', () => {
    const html = promoPage({
      layout: layout('vertical'),
      colors: promoColors({ primary: '#2F3A8F', accent: '#F2A541', font: 'inter', radius: 'lg', tone: 'pro', direction: 'clean' }),
      overshoot: 1.1,
      radius: 12,
      ...timeline(2),
      name: 'A<b>',
      icon: 'data:,',
      hook: 'x',
      end: 'y',
      scenes: [{ img: 'data:,', caption: '<script>' }, { img: 'data:,', caption: 'ok' }],
      fonts: {},
    })
    expect(html).not.toContain('<b>')
    expect(html).toContain('&#60;script&#62;')
  })

  it('pose légende et téléphone entier dans chaque taille des stores', () => {
    for (const { w, h } of [...Object.values(STORE_SIZES), FEATURE_GRAPHIC]) {
      const { phone, caption } = slideLayout(w, h)
      expect(phone.x).toBeGreaterThanOrEqual(0)
      expect(phone.x + phone.w).toBeLessThanOrEqual(w)
      if (h > w) {
        expect(phone.y + phone.h).toBeLessThanOrEqual(h)
        expect(phone.y).toBeGreaterThan(caption.y + caption.h)
      }
    }
    expect(STORE_SIZES['iphone-6.9']).toMatchObject({ w: 1320, h: 2868 })
  })

  it('lit taille et canal alpha dans l’en-tête PNG', () => {
    const header = (colorType: number) => {
      const b = new Uint8Array(33)
      b.set([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82])
      new DataView(b.buffer).setUint32(16, 1320)
      new DataView(b.buffer).setUint32(20, 2868)
      b[24] = 8
      b[25] = colorType
      return b
    }
    expect(pngInfo(header(2))).toEqual({ width: 1320, height: 2868, colorType: 2 })
    expect(pngInfo(header(6))?.colorType).toBe(6)
    expect(pngInfo(new Uint8Array([1, 2, 3]))).toBeUndefined()
  })
})
