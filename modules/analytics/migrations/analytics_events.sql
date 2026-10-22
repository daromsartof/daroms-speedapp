-- Événements analytiques : l'app écrit, personne ne lit côté client (tableau de bord SQL).
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  anonymous_id text not null,
  name text not null check (char_length(name) <= 80),
  props jsonb not null default '{}'::jsonb,
  platform text,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

create policy "événements écriture" on public.analytics_events
  for insert to anon, authenticated
  with check (user_id is null or (select auth.uid()) = user_id);

create index if not exists analytics_events_name_created_idx on public.analytics_events (name, created_at desc);
