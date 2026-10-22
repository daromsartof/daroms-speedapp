-- Profils : une ligne par utilisateur, créée automatiquement à l'inscription.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profil lecture propriétaire" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profil modification propriétaire" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create or replace function public.daroms_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists daroms_on_auth_user_created on auth.users;
create trigger daroms_on_auth_user_created
  after insert on auth.users
  for each row execute function public.daroms_handle_new_user();
