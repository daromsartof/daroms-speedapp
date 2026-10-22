-- Jetons push Expo : un appareil = un jeton, rattaché à l'utilisateur connecté.
create table if not exists public.push_tokens (
  token text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  platform text not null check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);

alter table public.push_tokens enable row level security;

create policy "jetons lecture propriétaire" on public.push_tokens
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "jetons création propriétaire" on public.push_tokens
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "jetons modification propriétaire" on public.push_tokens
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "jetons suppression propriétaire" on public.push_tokens
  for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists push_tokens_user_id_idx on public.push_tokens (user_id);
