# Ajouter une table Supabase

1. `bun daroms g table <table> --fields "titre:text, fait:bool=false, echeance:timestamptz?"`
   - types : `text`, `int`, `bigint`, `numeric`, `float`, `bool`, `date`, `timestamptz`, `uuid`, `jsonb`, `text[]` ; `?` = facultatif ; `=valeur` = défaut.
   - crée la migration (RLS propriétaire sur les 4 opérations, index, `updated_at`), `schema.ts` (zod ligne + saisie), `api.ts` (`useXs`, `useX`, `useCreateX`, `useUpdateX`, `useDeleteX`) et les types hors ligne.
2. Projet Supabase lié (`manifest.supabase.projectRef`) : `bun daroms db push` (applique et régénère `src/types/db.ts`).
3. Relations, partage, lecture publique : compléter la migration (voir `.claude/rules-ondemand/daroms-supabase-advanced.md`).
