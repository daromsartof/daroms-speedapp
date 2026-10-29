---
paths:
  - "src/features/**/api.ts"
  - "src/features/**/schema.ts"
  - "src/features/**/hooks.ts"
---
# Données (api.ts, schema.ts, hooks.ts)

> Supabase seulement dans features/x/api.ts via db() ; entrées et sorties validées zod ; hooks TanStack Query.

- Générer : `bun daroms g table <table> --fields "titre:text, fait:bool=false, echeance:timestamptz?"` -> migration RLS, `schema.ts`, `api.ts`, types.
- Données sur l'appareil seulement : `--local` -> `localTable('t', Schema)` (`list`, `get`, `insert`, `update`, `remove`), mêmes hooks ; jamais de `storage.getJSON` à la main pour une collection.
- Lecture : `useQuery({ queryKey: keys.list(), queryFn: async () => parseOrThrow(Schema.array(), unwrap(await db().from('t').select('*'))) })`.
- Écriture : `useMutation` + `Input.parse(values)` + `invalidateQueries({ queryKey: keys.all })`. Optimiste seulement si l'UX l'exige.
- Erreurs : `unwrap()` et `toAppError()` (`@daroms/data`) ; l'UI affiche `ErrorState error={q.error}` (message traduit).
- Clés : `queryKeys('feature')` -> `all`, `list(params)`, `detail(id)`.
- Utilisateur courant : `useUser()` ; ne jamais filtrer par user_id côté client à la place de la RLS.
- `hooks.ts` combine requêtes et état local de l'écran (`useXScreen`) ; l'écran ne parle qu'à ce hook.
- Types : `src/types/db.ts` (généré : `bun daroms db types`) ; ne pas l'éditer.
