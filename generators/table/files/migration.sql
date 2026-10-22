-- Table {{table}} (générée par daroms g table). RLS : chaque utilisateur ne voit que ses lignes.
create table public.{{table}} (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
{{columns}}
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.{{table}} enable row level security;

create policy "{{table}} lecture propriétaire" on public.{{table}}
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "{{table}} création propriétaire" on public.{{table}}
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "{{table}} modification propriétaire" on public.{{table}}
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "{{table}} suppression propriétaire" on public.{{table}}
  for delete to authenticated using ((select auth.uid()) = user_id);

create index {{table}}_user_id_idx on public.{{table}} (user_id);

create trigger {{table}}_updated_at before update on public.{{table}}
  for each row execute function public.daroms_set_updated_at();
