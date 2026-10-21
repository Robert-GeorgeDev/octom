# Launch checklist (things to do by hand)

Code cannot do these. Tick them off in order.

## 1. Database
- [ ] Back up first: Supabase > Database > Backups. Note the retention. If your plan has no daily backups, take a manual dump before every SQL change.
- [ ] Run each new SQL file on a **test project** first (create one from `supabase/baseline.sql`), then on production, in this order: `contacts-v2.sql`, `launch-readiness.sql`, `remove-plans.sql`. (If you already ran `billing-grace.sql`, that is fine; nothing needs undoing.)
- [ ] Run `supabase/tests/security_test.sql` on the test project. It rolls back everything.
- [ ] Restore test: restore a backup into the test project and check you can log in and see contacts.

## 2. Email
- [ ] Resend: domain verified, `EMAIL_FROM` uses it.
- [ ] Call `/api/cron/daily-summary?dry=1` with the `Authorization: Bearer <CRON_SECRET>` header. It should answer `would_send`, `done: true`.
- [ ] Turn the daily summary on for two real accounts, add an overdue follow-up, run the cron without `dry`, check both mails arrive and the unsubscribe link works.
- [ ] If `done` is `false`, call the URL again with `?after=<next>`.

## 3. Payments (later)
Octom is free for now: there is no Stripe and no plan limits. When Netopia is added, this section gets the test steps (subscribe, recurring charge, failed payment, cancel). The Early Feedback vouchers (a free month of Business) will need to be created in the new payment system at that point.

## 4. Errors
- [ ] After deploying, trigger a test error (the `/api/report-error` endpoint is public on purpose, rate limited) and check a row appears in Supabase > Table Editor > `error_events`, and that it has no names, emails or notes.
- [ ] Check `CONTACT_TO_EMAIL` is set if you want the alert mail.

## 5. Phone test
- [ ] New account, add a contact, schedule and complete a follow-up, reset the password, export CSV, import a CSV with a duplicate row.
- [ ] Repeat with a second workspace and confirm the two cannot see each other's data.
