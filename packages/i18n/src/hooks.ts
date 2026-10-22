import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type darFr from '../locales/fr.json'
import type { Paths, TOptions } from './types'

type LooseT = (key: string, options?: TOptions) => string

/** Traductions de l'app, typées par l'augmentation `CustomTypeOptions` de l'app. */
export function useT() {
  return useTranslation().t
}

/**
 * Fabrique un hook typé pour un namespace (cœur, modules) sans dépendre de
 * l'augmentation i18next de l'app : aucune collision de types.
 */
export function createNamespaceT<Tree extends object>(ns: string) {
  return function useNamespaceT() {
    const { i18n } = useTranslation()
    const language = i18n.language
    return useMemo(() => {
      const getFixedT = i18n.getFixedT.bind(i18n) as unknown as (lng: null, namespace: string) => LooseT
      const fixed = getFixedT(null, ns)
      return (key: Paths<Tree>, options?: TOptions) => fixed(key, options)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [i18n, language])
  }
}

/** Textes du cœur (boutons standard, états, erreurs). */
export const useDaromsT = createNamespaceT<typeof darFr>('daroms')

export type DaromsKey = Paths<typeof darFr>

/** Traduit une clé éventuellement préfixée par un namespace (`daroms:validation.email`). */
export function useTranslateKey() {
  const { i18n } = useTranslation()
  return (key: string, options?: TOptions) => (i18n.t as unknown as LooseT)(key, options)
}
