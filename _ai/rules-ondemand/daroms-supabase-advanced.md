# Supabase avancé

> Tables partagées, lecture publique, storage, realtime, fonctions SQL et edge functions.

- Lecture publique, écriture propriétaire : politique `select to anon, authenticated using (true)` + écritures `with check ((select auth.uid()) = user_id)`.
- Partage (équipes, conversations) : table de liaison `members(group_id, user_id)` ; politique `using (exists (select 1 from members m where m.group_id = t.group_id and m.user_id = (select auth.uid())))`. Indexer `members(user_id, group_id)`.
- Fonctions `security definer` : toujours `set search_path = ''` et noms qualifiés (`public.t`).
- Storage : bucket privé + politiques sur `storage.objects` par préfixe `auth.uid()::text` ; upload depuis `api.ts` (`db().storage.from('b').upload(path, file)`), URL signée pour l'affichage.
- Realtime : `db().channel('x').on('postgres_changes', { event: '*', schema: 'public', table: 't', filter: 'user_id=eq.' + id }, cb)` dans un hook ; invalider la requête TanStack plutôt que muter le cache à la main ; activer la table dans la publication `supabase_realtime`.
- Edge function : Deno, `npm:` imports, client avec l'en-tête `Authorization` de l'utilisateur (RLS appliquée) ; `service_role` seulement pour l'administration.
- Pagination : `.range(from, to)` + `useInfiniteQuery` ; tri stable (`created_at`, `id`).
