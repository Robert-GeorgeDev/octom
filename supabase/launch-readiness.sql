-- Launch readiness: persistent rate limits, error log, per-user email time zone.
-- Safe to run more than once. Run it in the Supabase SQL Editor.

-- 1. Rate limits that survive across servers and restarts -----------------------
create table if not exists public.rate_limits (
  key        text primary key,
  count      integer not null default 0,
  reset_at   timestamptz not null
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from public, anon, authenticated;

-- Returns true when the caller is over the limit. Only the server may call it.
create or replace function public.hit_rate_limit(p_key text, p_max integer, p_window_secs integer)
 returns boolean
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  c integer;
begin
  insert into public.rate_limits as r (key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_secs))
  on conflict (key) do update set
    count    = case when r.reset_at < now() then 1 else r.count + 1 end,
    reset_at = case when r.reset_at < now() then now() + make_interval(secs => p_window_secs) else r.reset_at end
  returning count into c;

  if random() < 0.01 then
    delete from public.rate_limits where reset_at < now() - interval '1 day';
  end if;
  return c > p_max;
end;
$function$;
revoke execute on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;

-- 2. Error log (written by the server only; read it in the Table Editor) --------
-- It never stores contact data, notes, emails or user ids: only what went wrong
-- and where.
create table if not exists public.error_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  source      text not null check (source in ('server', 'client')),
  route       text,
  message     text not null,
  digest      text,
  stack       text
);
create index if not exists error_events_created_idx on public.error_events (created_at desc);
alter table public.error_events enable row level security;
revoke all on public.error_events from public, anon, authenticated;

-- 3. Time zone for the daily summary email -------------------------------------
alter table public.email_preferences
  add column if not exists timezone text not null default 'Europe/Bucharest';
alter table public.email_preferences
  drop constraint if exists email_preferences_timezone_len;
alter table public.email_preferences
  add constraint email_preferences_timezone_len check (char_length(timezone) between 3 and 64);
