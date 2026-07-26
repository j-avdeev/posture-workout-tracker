-- Posture & Strength Tracker: Supabase schema
-- Run this once in Supabase Dashboard -> SQL Editor.

create table if not exists public.workout_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_date date not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, workout_date)
);

create table if not exists public.tracker_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_tracker_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workout_logs_set_updated_at on public.workout_logs;
create trigger workout_logs_set_updated_at
before update on public.workout_logs
for each row execute function public.set_tracker_updated_at();

drop trigger if exists tracker_settings_set_updated_at on public.tracker_settings;
create trigger tracker_settings_set_updated_at
before update on public.tracker_settings
for each row execute function public.set_tracker_updated_at();

alter table public.workout_logs enable row level security;
alter table public.tracker_settings enable row level security;

revoke all on public.workout_logs from anon;
revoke all on public.tracker_settings from anon;
grant select, insert, update, delete on public.workout_logs to authenticated;
grant select, insert, update, delete on public.tracker_settings to authenticated;

-- Each authenticated user can only read their own rows.
drop policy if exists "Users read own workout logs" on public.workout_logs;
create policy "Users read own workout logs"
on public.workout_logs
for select
to authenticated
using ((select auth.uid()) = user_id);

-- The browser may only create rows for the signed-in user.
drop policy if exists "Users insert own workout logs" on public.workout_logs;
create policy "Users insert own workout logs"
on public.workout_logs
for insert
to authenticated
with check ((select auth.uid()) = user_id);

-- Both USING and WITH CHECK protect updates.
drop policy if exists "Users update own workout logs" on public.workout_logs;
create policy "Users update own workout logs"
on public.workout_logs
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete own workout logs" on public.workout_logs;
create policy "Users delete own workout logs"
on public.workout_logs
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users read own tracker settings" on public.tracker_settings;
create policy "Users read own tracker settings"
on public.tracker_settings
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users insert own tracker settings" on public.tracker_settings;
create policy "Users insert own tracker settings"
on public.tracker_settings
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own tracker settings" on public.tracker_settings;
create policy "Users update own tracker settings"
on public.tracker_settings
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete own tracker settings" on public.tracker_settings;
create policy "Users delete own tracker settings"
on public.tracker_settings
for delete
to authenticated
using ((select auth.uid()) = user_id);
