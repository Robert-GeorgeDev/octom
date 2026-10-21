-- Octom: no more plans or commercial limits (safe to run more than once)
--
-- How to run: Supabase dashboard > SQL Editor > paste this whole file > Run.
-- Then run supabase/tests/security_test.sql. It must end with
-- "ALL TESTS PASSED (rolled back on purpose)".
--
-- After this runs, every workspace is the same:
--   * unlimited contacts and follow-ups (the two limit triggers are removed)
--   * up to 5 people per workspace
--   * 30 AI requests per user per day (cost protection), plus the existing
--     5 per minute per user and 3000 per day for everyone
--
-- The `subscriptions` table and `org_plan()` stay, unused, so paid plans can be
-- added back later (Netopia) without a migration.

-- 1. No contact or follow-up limits -------------------------------------------------
drop trigger if exists contacts_enforce_limit on public.contacts;
drop trigger if exists follow_ups_enforce_limit on public.follow_ups;
drop function if exists public.enforce_contact_limit();
drop function if exists public.enforce_followup_limit();

-- 2. Seats: the same for every workspace --------------------------------------------
create or replace function public.org_seat_limit(org uuid)
returns integer
language sql
stable
security definer
set search_path to ''
as $function$
  select 5;
$function$;

-- 3. AI: one daily limit for everyone ----------------------------------------------
create or replace function public.ai_check_and_log(request_kind text)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
  day_limit constant int := 30;
  global_day_limit constant int := 3000;
  used_day int;
  used_minute int;
  used_global int;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- One request at a time per user, so parallel requests cannot all pass the check.
  perform pg_advisory_xact_lock(hashtext('ai:' || uid::text));

  delete from public.ai_usage
  where user_id = uid and created_at < now() - interval '2 days';

  select count(*) into used_day
  from public.ai_usage
  where user_id = uid and created_at > now() - interval '1 day';

  select count(*) into used_minute
  from public.ai_usage
  where user_id = uid and created_at > now() - interval '1 minute';

  select count(*) into used_global
  from public.ai_usage
  where created_at > now() - interval '1 day';

  if used_day >= day_limit or used_minute >= 5 or used_global >= global_day_limit then
    return false;
  end if;

  insert into public.ai_usage (user_id, kind)
  values (uid, left(coalesce(request_kind, ''), 30));

  return true;
end;
$function$;
