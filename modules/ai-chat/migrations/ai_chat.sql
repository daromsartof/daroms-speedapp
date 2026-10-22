-- Conversations et messages du chat IA (écrits par l'edge function avec le jeton de l'utilisateur).
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

create policy "conversations propriétaire" on public.ai_conversations
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "messages propriétaire" on public.ai_messages
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create index if not exists ai_messages_conversation_idx on public.ai_messages (conversation_id, created_at);
create index if not exists ai_messages_user_day_idx on public.ai_messages (user_id, created_at);
