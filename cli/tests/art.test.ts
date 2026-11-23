import { describe, expect, it } from 'bun:test'

import { defineBrand } from '../../packages/theme/src/brand'
import { artName, artPrompt } from '../commands/art'

describe('images générées', () => {
  const brand = defineBrand({ primary: '#4F46E5', accent: '#F97316', direction: 'soft', tone: 'playful' })

  it('impose la marque, le style et les interdits dans le prompt', () => {
    const prompt = artPrompt(brand, 'A person reading on a sofa with a cat.', 'illustration')
    expect(prompt.startsWith('A person reading on a sofa with a cat.')).toBe(true)
    expect(prompt).toContain('#4F46E5')
    expect(prompt).toContain('#F97316')
    expect(prompt).toContain('flat vector illustration')
    expect(prompt).toContain('playful')
    expect(prompt).toContain('No text')
  })

  it('nomme le fichier en minuscules et tirets', () => {
    expect(artName('Accueil Héros !')).toBe('accueil-h-ros')
    expect(artName('onboarding_1')).toBe('onboarding-1')
  })
})
