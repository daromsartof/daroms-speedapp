-- Fonctions communes daroms (créées une fois, avant la première table).
create or replace function public.daroms_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
