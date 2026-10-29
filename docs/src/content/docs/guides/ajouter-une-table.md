---
title: Ajouter une table
description: Créer une table Supabase avec RLS, schéma zod et hooks TanStack Query en une commande, ou une table locale sur l'appareil avec les mêmes hooks.
---

## Table Supabase

```bash
bun daroms g table books --fields "title:text, author:text?, pages:int=0, finished_on:date?"
```

| Créé | Contenu |
|---|---|
| `supabase/migrations/<horodatage>_books.sql` | table, RLS propriétaire sur les 4 opérations, index `user_id`, trigger `updated_at` |
| `src/features/books/schema.ts` | `BookSchema` (ligne) et `BookInputSchema` (saisie), types `Book`, `BookInput` |
| `src/features/books/api.ts` | `useBooks`, `useBook(id)`, `useCreateBook`, `useUpdateBook`, `useDeleteBook` |
| types hors ligne | en attendant `db types` |

### Champs

Format : `nom:type`, `?` pour facultatif, `=valeur` pour un défaut, séparés par des virgules.

| Type | SQL | zod |
|---|---|---|
| `text` | `text` | `z.string()` |
| `int` | `integer` | `z.number().int()` |
| `bigint` | `bigint` | `z.number().int()` |
| `numeric`, `float` | `numeric`, `double precision` | `z.number()` |
| `bool` | `boolean` | `z.boolean()` |
| `date`, `timestamptz` | `date`, `timestamptz` | `z.string()` |
| `uuid` | `uuid` | `z.string().uuid()` |
| `jsonb` | `jsonb` | `z.unknown()` |
| `text[]` | `text[]` | `z.array(z.string())` |

Options : `--feature <nom>` (dossier de feature, défaut : nom de la table avec tirets), `--singular <nom>` (défaut : nom sans le `s` final).

### Appliquer

Projet Supabase lié (`manifest.supabase.projectRef`) :

```bash
bun daroms db push    # applique les migrations et régénère src/types/db.ts
```

### La migration générée

Chaque utilisateur ne voit que ses lignes :

```sql
create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  author text,
  pages integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.books enable row level security;
create policy "books lecture propriétaire" on public.books
  for select to authenticated using ((select auth.uid()) = user_id);
-- idem insert, update, delete
```

Relations, lecture publique, partage, Storage, realtime : compléter la migration, voir [Données et sécurité](/explications/donnees-et-securite/).

### Les hooks générés

```ts
const books = useBooks()                      // useQuery, liste la plus récente d'abord
const create = useCreateBook()                // useMutation, invalide la liste
create.mutate({ title: 'Dune', pages: 0 })    // entrée validée par BookInputSchema
```

Toute réponse passe par `parseOrThrow(schema, ...)` : une donnée inattendue devient une `AppError` `validation` affichable par `ErrorState`.

## Table locale (sans Supabase)

App sans compte ni synchronisation (suivi perso, carnet) :

```bash
bun daroms g table books --fields "title:text, pages:int=0" --local
```

- `api.ts` utilise `localTable()` de `@daroms/data` (MMKV, sinon kv-store dans Expo Go) : mêmes hooks (`useBooks`, `useCreateBook`...), mêmes lignes (`id`, `created_at`, `updated_at`), défauts appliqués par zod.
- Aucune migration ; la table n'apparaît pas dans `src/types/db.ts`.
- Passer à Supabase plus tard : relancer la même commande sans `--local` (régénère `schema.ts` et `api.ts`, ajoute la migration) ; les écrans ne changent pas, les données déjà sur l'appareil ne sont pas migrées.
- Une ligne stockée devenue invalide (champ obligatoire ajouté sans défaut) lève une erreur `validation` au lieu d'être effacée : ajouter un défaut (`=valeur`) au nouveau champ.

Toute une app en local dès la création : `daroms new <slug> --variant tracker --local`.

## Avec Claude

`/daroms-data` lit les tables prévues dans `app.spec.md`, lance `g table` pour chacune, puis `db push` si un projet est lié.
