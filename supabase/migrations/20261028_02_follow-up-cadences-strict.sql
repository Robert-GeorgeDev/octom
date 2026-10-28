-- Tightens the cadence rule from 20261028_01: a follow-up has either both a cadence and a step
-- (step 1 to 10) or neither. The first version also let "cadence without step" and
-- "step without cadence" through. The app never writes those, this makes the database refuse them.
-- Safe to run more than once. It runs as one transaction: if anything fails, nothing changes.

begin;

-- Anything that does not follow the rule becomes a plain follow-up, so the change cannot fail on it.
update public.follow_ups
set cadence = null, cadence_step = null
where not (
  (cadence is null and cadence_step is null)
  or (
    cadence is not null and cadence_step is not null
    and cadence ~ '^[a-z-]{1,30}$'
    and cadence_step between 1 and 10
  )
);

alter table public.follow_ups drop constraint if exists follow_ups_cadence_check;
alter table public.follow_ups add constraint follow_ups_cadence_check check (
  (cadence is null and cadence_step is null)
  or (
    cadence is not null and cadence_step is not null
    and cadence ~ '^[a-z-]{1,30}$'
    and cadence_step between 1 and 10
  )
);

insert into public.app_migrations (name) values ('follow-up-cadences-strict') on conflict (name) do nothing;

commit;
