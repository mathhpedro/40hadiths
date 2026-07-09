-- 40 Hadiths — cloud sync schema (progress + notes per user), with RLS.
-- Applied to project uhguulzgyfyvpieuaodp.

-- Profiles (one per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  updated_at timestamptz not null default now()
);

-- Per-user spaced-repetition progress (one row per hadith)
create table if not exists public.progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  hadith_number smallint not null,
  box smallint not null default 0,
  due bigint not null default 0,
  last bigint not null default 0,
  reps integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, hadith_number)
);

-- Per-user notes (one row per hadith)
create table if not exists public.notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  hadith_number smallint not null,
  body text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, hadith_number)
);

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.notes enable row level security;

-- Each authenticated user can only read/write their own rows
create policy "profiles are self-managed" on public.profiles
  for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "progress is self-managed" on public.progress
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notes are self-managed" on public.notes
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
