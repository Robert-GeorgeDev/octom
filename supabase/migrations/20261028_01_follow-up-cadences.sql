-- Follow-up cadences: a follow-up can belong to a cadence (a short series of reminders).
-- Two optional columns: which cadence, and which step of it this follow-up is.
-- Existing follow-ups keep both empty. Safe to run more than once.
-- Run it in the Supabase SQL Editor (test project first), BEFORE the app update goes live.

alter table public.follow_ups add column if not exists cadence text;
alter table public.follow_ups add column if not exists cadence_step smallint;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'follow_ups_cadence_check') then
    alter table public.follow_ups add constraint follow_ups_cadence_check check (
      (cadence is null and cadence_step is null)
      or (cadence ~ '^[a-z-]{1,30}$' and cadence_step between 1 and 10)
    );
  end if;
end
$$;

insert into public.app_migrations (name) values ('follow-up-cadences') on conflict (name) do nothing;
