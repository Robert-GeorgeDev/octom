# Launch checklist (things to do by hand)

Code cannot do these. Tick them off in order. Use Stripe **test mode** until the end.

## 1. Database
- [ ] Back up first: Supabase > Database > Backups. Note the retention. If your plan has no daily backups, take a manual dump before every SQL change.
- [ ] Run each new SQL file on a **test project** first (create one from `supabase/baseline.sql`), then on production, in this order: `contacts-v2.sql`, `billing-grace.sql`, `launch-readiness.sql`.
- [ ] Run `supabase/tests/security_test.sql` on the test project. It rolls back everything.
- [ ] Restore test: restore a backup into the test project and check you can log in and see contacts.

## 2. Email
- [ ] Resend: domain verified, `EMAIL_FROM` uses it.
- [ ] Call `/api/cron/daily-summary?dry=1` with the `Authorization: Bearer <CRON_SECRET>` header. It should answer `would_send`, `done: true`.
- [ ] Turn the daily summary on for two real accounts, add an overdue follow-up, run the cron without `dry`, check both mails arrive and the unsubscribe link works.
- [ ] If `done` is `false`, call the URL again with `?after=<next>`.
- [ ] Stripe > Settings > Billing > Subscriptions and emails: turn on "Send emails about failed payments" so customers also hear from Stripe.

## 3. Stripe (test mode)
- [ ] Webhook sends `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
- [ ] Subscribe to Pro without a card: the plan shows Pro, status `trialing`. Subscribing again after cancelling gives **no** second trial.
- [ ] Let a trial end without a card (use a Stripe test clock): the workspace goes back to Free.
- [ ] Add a card that fails on renewal (`4000 0000 0000 0341`), advance the test clock: the banner "Your last payment did not go through" appears, the plan still works for 7 days, then drops to Free.
- [ ] Cancel from Manage subscription, then check the plan goes back to Free.
- [ ] Create the Early Feedback coupon: 100% off, once, 1 month, one use per code, with an expiry date. Test the full code-to-Pro flow.
- [ ] Prices on the site (€7.99 and €14.99) match the Stripe prices. Business is per workspace with 5 seats.

## 4. Errors
- [ ] After deploying, trigger a test error (the `/api/report-error` endpoint is public on purpose, rate limited) and check a row appears in Supabase > Table Editor > `error_events`, and that it has no names, emails or notes.
- [ ] Check `CONTACT_TO_EMAIL` is set if you want the alert mail.

## 5. Phone test
- [ ] New account, add a contact, schedule and complete a follow-up, reset the password, export CSV, import a CSV with a duplicate row.
- [ ] Repeat with a second workspace and confirm the two cannot see each other's data.
