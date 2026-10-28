-- Estimated value of a contact (what a deal might be worth), in one currency per contact.
-- Two optional columns. Existing contacts keep both empty. Both are set or both are empty.
-- The value is the person's own estimate; it is only added up per pipeline column.
-- Safe to run more than once. It runs as one transaction: if anything fails, nothing changes.
-- Run it in the Supabase SQL Editor (test project first), BEFORE the app update goes live.

begin;

alter table public.contacts add column if not exists deal_value numeric(12, 2);
alter table public.contacts add column if not exists deal_currency text;

alter table public.contacts drop constraint if exists contacts_deal_check;
alter table public.contacts add constraint contacts_deal_check check (
  (deal_value is null and deal_currency is null)
  or (deal_value is not null and deal_currency is not null and deal_value > 0 and deal_value <= 1000000000 and deal_currency in ('RON', 'EUR', 'USD'))
);

insert into public.app_migrations (name) values ('deal-value') on conflict (name) do nothing;

commit;
