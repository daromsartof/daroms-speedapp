/** Clés pointées d'un objet de traductions : { a: { b: '' } } -> 'a.b'. */
export type Paths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`
    }[keyof T & string]

/** Ressources : langue -> namespace -> arbre de textes. */
export type Resources = Record<string, Record<string, object>>

export type TOptions = Record<string, string | number | boolean | undefined>
