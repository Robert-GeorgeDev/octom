-- Contacts v2: extra profile fields for the new contact panel.
-- Safe to run more than once. Run in Supabase > SQL Editor.
-- Run BEFORE (or right after) deploying the matching app version:
-- until then, saving the new fields shows an error in the app.

alter table public.contacts add column if not exists website   text not null default '';
alter table public.contacts add column if not exists location  text not null default '';
alter table public.contacts add column if not exists job_title text not null default '';
alter table public.contacts add column if not exists source    text not null default '';
alter table public.contacts add column if not exists tags      text[] not null default '{}'::text[];

alter table public.contacts drop constraint if exists contacts_v2_lengths;
alter table public.contacts add constraint contacts_v2_lengths check (
  char_length(website) <= 200
  and char_length(location) <= 200
  and char_length(job_title) <= 120
  and char_length(source) <= 120
  and coalesce(array_length(tags, 1), 0) <= 10
);
