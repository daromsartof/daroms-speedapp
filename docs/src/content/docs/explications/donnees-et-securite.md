---
title: Données et sécurité
description: Le modèle de données daroms - Supabase avec RLS sur chaque table, accès confiné à api.ts, validation zod, secrets côté serveur - et les recettes pour la lecture publique, le partage, Storage et realtime.
---

## Le modèle

1. **La base protège les données, pas l'app.** Chaque table a la RLS activée et des politiques pour les 4 opérations : un utilisateur ne lit et n'écrit que ses lignes (`(select auth.uid()) = user_id`). Une app compromise ne peut rien lire de plus.
2. **Un seul endroit parle à Supabase** : `src/features/<x>/api.ts`, via `db()` de `@daroms/data`. Jamais dans un composant (ESLint et hook le refusent).
3. **Tout ce qui entre et sort est validé par zod** : saisie avec `XInputSchema.parse`, réponses avec `parseOrThrow`. Une donnée inattendue devient une erreur affichable, pas un crash.
4. **Les secrets restent sur le serveur.** L'app ne connaît que l'URL et la clé publique (`EXPO_PUBLIC_*`). Clé `service_role`, clé Anthropic, secrets tiers : `bunx supabase secrets set NOM=...`, lus par les edge functions.
5. **La structure ne change que par migration SQL** (`supabase/migrations/`). Une migration poussée ne se modifie plus : on en écrit une nouvelle.

## Les erreurs

`toAppError` normalise toute erreur (PostgREST, Auth, réseau, zod) en `AppError` avec un `code` et une clé i18n :

| Code | Cas typique |
|---|---|
| `network` | hors ligne, délai dépassé |
| `unauthorized` | session absente ou expirée |
| `forbidden` | RLS, permission refusée (ex. localisation) |
| `notFound`, `conflict` | ligne absente, contrainte d'unicité |
| `validation` | donnée refusée par zod |
| `rateLimit`, `config`, `unknown` | quota, Supabase non configuré, autre |

`ErrorState` et `QueryView` affichent le message traduit et le bouton Réessayer.

## Recettes

| Besoin | Politique ou méthode |
|---|---|
| Lecture publique, écriture propriétaire | `select to anon, authenticated using (true)` ; écritures `with check ((select auth.uid()) = user_id)` |
| Partage (équipe, conversation) | table `members(group_id, user_id)` ; `using (exists (select 1 from members m where m.group_id = t.group_id and m.user_id = (select auth.uid())))` ; index `members(user_id, group_id)` |
| Fonction `security definer` | toujours `set search_path = ''` et noms qualifiés (`public.t`) |
| Fichiers privés | bucket privé, politiques sur `storage.objects` par préfixe `auth.uid()::text`, URL signée à l'affichage. Photos publiques par URL : module [camera](/reference/modules/camera/) |
| Temps réel | `db().channel('x').on('postgres_changes', ...)` dans un hook, puis invalider la requête TanStack ; activer la table dans `supabase_realtime` |
| Edge function | Deno, imports `npm:`, client créé avec l'en-tête `Authorization` de l'utilisateur (RLS appliquée) ; `service_role` seulement pour l'administration |
| Pagination | `.range(from, to)` + `useInfiniteQuery`, tri stable (`created_at`, `id`) |
| Index | toute colonne de filtre : `user_id`, clés étrangères |

## Données locales

`localTable` (MMKV, sinon kv-store) garde les lignes sur l'appareil avec la même forme que Supabase. Pas de RLS ni de synchronisation : à réserver aux apps sans compte. Voir [Ajouter une table](/guides/ajouter-une-table/#table-locale-sans-supabase).

## Ce que l'agent ne peut pas faire

- Lire `.env` : permissions `deny` et hook `daroms-deny-env`. Il lit `.env.example` et demande les valeurs.
- Placer `service_role` dans l'app : refusé en relecture par l'agent `daroms-reviewer`.
