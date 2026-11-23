// Textes de gabarit : la première impression se joue en 50 ms (Lindgaard et al., 2006). Un onboarding
// « Bienvenue / Tout ce qu'il faut, au même endroit » dit « app générée » ; ces textes doivent venir du cahier.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { CORE_DIR } from './paths'

export type Localized = Record<string, string>

/** Clés de première impression livrées avec un texte générique (gabarit et module onboarding). */
export const FIRST_IMPRESSION_KEYS = [
  'home.welcome',
  'home.intro',
  'onboarding.page1Title',
  'onboarding.page1Description',
  'onboarding.page2Title',
  'onboarding.page2Description',
  'onboarding.page3Title',
  'onboarding.page3Description',
] as const

const get = (tree: unknown, key: string): string | undefined => {
  const value = key.split('.').reduce<unknown>((node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined), tree)
  return typeof value === 'string' ? value : undefined
}

/** Clés dont le texte de l'app est encore celui du gabarit, dans au moins une langue. */
export function unchangedTexts(app: Record<string, unknown>, defaults: Record<string, Localized>): string[] {
  return Object.entries(defaults)
    .filter(([key, byLocale]) => Object.entries(byLocale).some(([locale, text]) => get(app[locale], key) === text))
    .map(([key]) => key)
}

/** Textes génériques livrés par le cœur (template/locales et module onboarding), par clé puis langue. */
export function firstImpressionDefaults(core = CORE_DIR): Record<string, Localized> {
  const out: Record<string, Localized> = {}
  for (const locale of ['fr', 'en']) {
    const file = join(core, 'template', 'locales', `${locale}.json`)
    if (!existsSync(file)) continue
    const tree = JSON.parse(readFileSync(file, 'utf8')) as unknown
    for (const key of FIRST_IMPRESSION_KEYS) {
      const text = get(tree, key)
      if (text) (out[key] ??= {})[locale] = text
    }
  }
  const onboarding = join(core, 'modules', 'onboarding', 'module.json')
  if (existsSync(onboarding)) {
    const { appLocales = {} } = JSON.parse(readFileSync(onboarding, 'utf8')) as { appLocales?: Record<string, Localized> }
    for (const [key, byLocale] of Object.entries(appLocales)) out[key] = { ...out[key], ...byLocale }
  }
  return out
}
