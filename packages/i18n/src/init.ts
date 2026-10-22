import { getLocales } from 'expo-localization'
import i18next, { type i18n } from 'i18next'
import { initReactI18next } from 'react-i18next'

import darEn from '../locales/en.json'
import darFr from '../locales/fr.json'
import type { Resources } from './types'

export const coreResources: Resources = { fr: { daroms: darFr }, en: { daroms: darEn } }

function mergeResources(...sources: Resources[]): Resources {
  const out: Resources = {}
  for (const source of sources) {
    for (const [lang, namespaces] of Object.entries(source)) {
      out[lang] = { ...out[lang], ...namespaces }
    }
  }
  return out
}

export type InitI18nOptions = {
  /** Textes de l'app (namespace par défaut `app`) : { fr: {...}, en: {...} } */
  app: Record<string, object>
  /** Ressources additionnelles (modules) : { fr: { auth: {...} } } */
  extra?: Resources[]
  supported: readonly string[]
  fallback: string
  /** Langue choisie par l'utilisateur (prioritaire sur l'appareil). */
  language?: string | null
}

/** Choisit la langue de l'appareil si elle est supportée. */
export function detectLanguage(supported: readonly string[], fallback: string): string {
  try {
    for (const locale of getLocales()) {
      if (locale.languageCode && supported.includes(locale.languageCode)) return locale.languageCode
    }
  } catch {
    // pas de module natif (tests) : langue par défaut
  }
  return fallback
}

export function initI18n({ app, extra = [], supported, fallback, language }: InitI18nOptions): i18n {
  const appResources: Resources = Object.fromEntries(Object.entries(app).map(([lang, tree]) => [lang, { app: tree }]))
  if (!i18next.isInitialized) {
    void i18next.use(initReactI18next).init({
      resources: mergeResources(coreResources, appResources, ...extra),
      lng: language && supported.includes(language) ? language : detectLanguage(supported, fallback),
      fallbackLng: fallback,
      supportedLngs: [...supported],
      defaultNS: 'app',
      ns: ['app', 'daroms'],
      interpolation: { escapeValue: false },
      returnNull: false,
      initAsync: false,
    })
  }
  return i18next
}

export { i18next }
