-- Grace period for failed payments.
--
-- Before: a subscription in `past_due` dropped the workspace to Free at once.
-- After: the paid plan stays for 7 days from the first failed payment
-- (`grace_until`), then the workspace falls back to Free.
--
-- Safe to run more than once. Run it in the Supabase SQL Editor.

alter table public.subscriptions
  add column if not exists grace_until timestamptz;

create or replace function public.org_plan(org uuid)
 returns text
 language sql
 stable security definer
 set search_path to ''
as $function$
  select coalesce(
    (select s.plan
     from public.subscriptions s
     where s.organization_id = org
       and (
         s.status in ('active', 'trialing')
         or (s.status = 'past_due' and s.grace_until is not null and s.grace_until > now())
       )),
    'free'
  );
$function$;

-- Keep org_plan internal, as security-hardening-2.sql set it up.
revoke execute on function public.org_plan(uuid) from public, anon, authenticated;
