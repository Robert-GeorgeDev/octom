-- Octom: read-only product numbers from data the app already stores. Changes nothing.
-- No tracking code and no personal data in the results: only counts.
-- Run each query in Supabase > SQL Editor.
--
-- 1. Sign-ups per week, last 8 weeks.
select date_trunc('week', created_at)::date as week, count(*) as sign_ups
from auth.users
where created_at > now() - interval '8 weeks'
group by 1
order by 1 desc;

-- 2. How far new people get (everyone so far). "Came back" = did something on 2 different days.
with actions as (
  select created_by as user_id, created_at::date as day from public.contacts where created_by is not null
  union all
  select created_by, created_at::date from public.follow_ups where created_by is not null
  union all
  select created_by, created_at::date from public.activities where created_by is not null
),
steps as (
  select 1 as n, 'Signed up' as step, count(*) as people from auth.users
  union all
  select 2, 'Has a workspace', count(distinct user_id) from public.organization_members
  union all
  select 3, 'Added a contact', count(distinct created_by) from public.contacts where created_by is not null
  union all
  select 4, 'Created a follow-up', count(distinct created_by) from public.follow_ups where created_by is not null
  union all
  select 5, 'Finished a follow-up', count(distinct created_by) from public.activities
    where type = 'follow_up_completed' and created_by is not null
  union all
  select 6, 'Came back (2 or more days)', count(*) from (
    select user_id from actions group by user_id having count(distinct day) >= 2
  ) s
)
select n, step, people,
       round(100.0 * people / nullif(max(people) filter (where n = 1) over (), 0), 1) as percent_of_sign_ups
from steps
order by n;

-- 3. People who did something, per week, last 6 weeks.
with actions as (
  select created_by as user_id, created_at from public.contacts where created_by is not null
  union all
  select created_by, created_at from public.follow_ups where created_by is not null
  union all
  select created_by, created_at from public.activities where created_by is not null
)
select date_trunc('week', created_at)::date as week, count(distinct user_id) as active_people
from actions
where created_at > now() - interval '6 weeks'
group by 1
order by 1 desc;

-- 4. Cadences in use (needs the follow-up-cadences change).
select cadence, count(*) as follow_ups, count(*) filter (where status = 'done') as finished
from public.follow_ups
where cadence is not null
group by cadence
order by 2 desc;
