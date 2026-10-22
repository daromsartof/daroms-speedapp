// Config Tamagui complète d'une app : base v6 (échelles 4 pt alignées Tailwind)
// + couleurs, rayons, espacements, polices et animations dérivés de la marque.
import { createAnimations } from '@tamagui/animations-reanimated'
import { createV6Config } from '@tamagui/config/v6-base'
import { animationPresets } from '@tamagui/animation-helpers'
import { createTamagui } from 'tamagui'

import type { Brand } from './brand'
import { createBrandFonts } from './fonts'
import { createBrandTheme } from './themes'
import { semanticRadius, semanticSpace, springs, Z_INDEX } from './tone'

export function createBrandConfig(brand: Brand) {
  const { colorTokens, themes } = createBrandTheme(brand)
  const base = createV6Config({ themes, colorTokens })
  const space = semanticSpace(brand)
  return createTamagui({
    ...base,
    tokens: {
      ...base.tokens,
      space: { ...base.tokens.space, ...space },
      radius: { ...base.tokens.radius, ...semanticRadius(brand) },
      zIndex: Z_INDEX,
    },
    // variables adaptées au mode clair/sombre, utilisables comme un token : bg="card"
    variables: {
      card: { light: '#ffffff', dark: colorTokens['surface-900'] },
      overlay: { light: 'rgba(0,0,0,0.4)', dark: 'rgba(0,0,0,0.6)' },
      skeleton: { light: colorTokens['surface-200'], dark: colorTokens['surface-800'] },
      separator: { light: colorTokens['surface-200'], dark: colorTokens['surface-800'] },
    },
    fonts: createBrandFonts(brand),
    animations: createAnimations({ ...animationPresets, ...springs(brand) }),
    settings: {
      ...base.settings,
      // pas de SSR : app mobile (le web sert à l'aperçu et aux captures)
      disableSSR: true,
      // refuse au typage les couleurs hors tokens (hex, rgb) tout en gardant % et mots-clés
      allowedStyleValues: 'somewhat-strict',
    },
  })
}

export type DaromsTamaguiConfig = ReturnType<typeof createBrandConfig>
