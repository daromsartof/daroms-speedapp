---
name: daroms-data
description: Crée la couche données depuis app.spec.md - tables Supabase avec RLS (migrations), types, schémas zod et hooks api.ts générés, puis db push si un projet est lié.
---

# /daroms-data : tables et API

1. Lire `app.spec.md > Données`. Une table par entité ; colonnes au format `nom:type[?][=défaut]` (types : text, int, numeric, bool, date, timestamptz, uuid, jsonb, text[]).
2. Pour chaque table : `bun daroms g table <table> --fields "..." [--feature <feature>]` (migration RLS propriétaire, `schema.ts`, `api.ts`, types hors ligne).
3. Relations ou partage : compléter la migration générée à la main (clé étrangère + index + politique) ; lire `.claude/rules-ondemand/daroms-supabase-advanced.md`.
4. Si `manifest.supabase.projectRef` est renseigné : `bun daroms db push` (pousse et régénère `src/types/db.ts`). Sinon types hors ligne (suffisants pour coder).
5. `bun daroms doctor --quick`.
6. **Stop** : lister tables, politiques et hooks disponibles (`useTodos`, `useCreateTodo`...).
