-- Signed-in users may change their own email settings, but not the unsubscribe
-- token: only the database creates it. Before this, a user could overwrite their
-- own token through the API (harmless, but nothing should be writable that the
-- app never writes). Safe to run more than once.

revoke update on public.email_preferences from authenticated;
grant update (user_id, daily_summary, timezone) on public.email_preferences to authenticated;

insert into public.app_migrations (name, note)
values ('prefs-token-lock', 'unsubscribe_token is read-only for signed-in users')
on conflict (name) do nothing;
