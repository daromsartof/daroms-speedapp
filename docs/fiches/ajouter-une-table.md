# Ajouter une table Supabase

1. `bun daroms g table <table> --fields "titre:text, fait:bool=false, echeance:timestamptz?"`
   - types : `text`, `int`, `bigint`, `numeric`, `float`, `bool`, `date`, `timestamptz`, `uuid`, `jsonb`, `text[]` ; `?` = facultatif ; `=valeur` = défaut.
   - crée la migration (RLS propriétaire sur les 4 opérations, index, `updated_at`), `schema.ts` (zod ligne + saisie), `api.ts` (`useXs`, `useX`, `useCreateX`, `useUpdateX`, `useDeleteX`) et les types hors ligne.
2. Projet Supabase lié (`manifest.supabase.projectRef`) : `bun daroms db push` (applique et régénère `src/types/db.ts`).
3. Relations, partage, lecture publique : compléter la migration (voir `.claude/rules-ondemand/daroms-supabase-advanced.md`).

## Table locale (sans Supabase)

App sans compte ni synchronisation (suivi perso, carnet) : `bun daroms g table <table> --fields "..." --local`.

- `api.ts` utilise `localTable()` de `@daroms/data` (MMKV, sinon kv-store dans Expo Go) : mêmes hooks (`useXs`, `useCreateX`...), mêmes lignes (`id`, `created_at`, `updated_at`), défauts appliqués par zod.
- Aucune migration ; la table n'apparaît pas dans `src/types/db.ts`.
- Passer à Supabase plus tard : relancer la même commande sans `--local` (régénère `schema.ts` et `api.ts`, ajoute la migration) ; les écrans ne changent pas, les données déjà sur l'appareil ne sont pas migrées.
- Une ligne stockée devenue invalide (champ obligatoire ajouté sans défaut) lève une erreur `validation` au lieu d'être effacée : ajouter un défaut (`=valeur`) au nouveau champ.
