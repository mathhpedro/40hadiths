-- Class scheduling + attendance confirmation ("confirmação das aulas").
-- Applied to project uhguulzgyfyvpieuaodp.

-- A class session the group schedules.
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  scheduled_at timestamptz not null,
  hadith_numbers smallint[] not null default '{}',
  location text,
  notes text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- One attendance confirmation per user per session.
create table if not exists public.attendance (
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('going', 'maybe', 'declined')),
  display_name text,
  updated_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

alter table public.sessions enable row level security;
alter table public.attendance enable row level security;

-- Everyone signed in sees the shared schedule; only the creator manages a session.
create policy "sessions readable by authenticated" on public.sessions
  for select to authenticated using (true);
create policy "sessions insert by owner" on public.sessions
  for insert to authenticated with check (auth.uid() = created_by);
create policy "sessions update by owner" on public.sessions
  for update to authenticated using (auth.uid() = created_by) with check (auth.uid() = created_by);
create policy "sessions delete by owner" on public.sessions
  for delete to authenticated using (auth.uid() = created_by);

-- Everyone signed in sees who is coming; each user manages only their own confirmation.
create policy "attendance readable by authenticated" on public.attendance
  for select to authenticated using (true);
create policy "attendance self insert" on public.attendance
  for insert to authenticated with check (auth.uid() = user_id);
create policy "attendance self update" on public.attendance
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "attendance self delete" on public.attendance
  for delete to authenticated using (auth.uid() = user_id);

create index if not exists sessions_scheduled_at_idx on public.sessions (scheduled_at);
create index if not exists attendance_session_idx on public.attendance (session_id);
