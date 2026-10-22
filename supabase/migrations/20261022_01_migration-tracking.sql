-- Migration tracking: a small table that remembers which database changes were applied.
-- Safe to run more than once. Run it in the Supabase SQL Editor (test project first).
--
-- After this, every new file in supabase/migrations/ ends with one line that registers
-- itself, and the app's health check (/api/health) tells you if one is missing.

create table if not exists public.app_migrations (
  name       text primary key,
  applied_at timestamptz not null default now(),
  note       text not null default ''
);
alter table public.app_migrations enable row level security;
revoke all on public.app_migrations from public, anon, authenticated;

-- Register the changes that were applied by hand before this table existed.
-- Where the database itself shows the proof, that is checked; the rest is taken
-- from what you told me was already run (marked "assumed").
insert into public.app_migrations (name, note)
select 'security-fixes', 'assumed: run by hand before tracking'
union all select 'security-hardening-2', 'assumed: run by hand before tracking'
union all select 'security-hardening-3', 'assumed: run by hand before tracking'
on conflict (name) do nothing;

insert into public.app_migrations (name, note)
select 'remove-bootstrap', 'checked: app_settings table is gone'
where to_regclass('public.app_settings') is null
on conflict (name) do nothing;

insert into public.app_migrations (name, note)
select 'contacts-v2', 'checked: contacts.source exists'
where exists (
  select 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'contacts' and column_name = 'source'
)
on conflict (name) do nothing;

insert into public.app_migrations (name, note)
select 'launch-readiness', 'checked: rate_limits and error_events exist'
where to_regclass('public.rate_limits') is not null and to_regclass('public.error_events') is not null
on conflict (name) do nothing;

insert into public.app_migrations (name, note)
select 'remove-plans', 'assumed: run by hand before tracking'
on conflict (name) do nothing;

insert into public.app_migrations (name, note)
values ('migration-tracking', 'this file')
on conflict (name) do nothing;

-- Shows what is registered (you should see 8 rows, "checked" or "assumed" in the note).
select name, note, applied_at from public.app_migrations order by name;
