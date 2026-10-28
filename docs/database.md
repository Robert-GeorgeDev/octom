# Database

Postgres on Supabase (EU, Frankfurt). The full structure is in
`supabase/baseline.sql`; patches are listed in `supabase/README.md`.
No real data belongs in this repository.

```
auth.users
   |
   +-- organization_members (role: owner / admin / member) -- organizations
   |                                                              |
   |                                       +----------------------+----------+
   |                                       |                      |          |
   |                                   contacts              invitations  subscriptions
   |                                       |
   |                              follow_ups, activities
   +-- email_preferences
```

| Table | Purpose |
|---|---|
| `organizations` | A workspace |
| `organization_members` | Who belongs to which workspace, with role. One workspace per user |
| `contacts`, `follow_ups`, `activities` | The CRM data, always scoped by `organization_id` |
| `invitations` | Pending invitation links (admins see member invites only) |
| `subscriptions` | Unused for now (no paid plans). Kept so a payment provider can be added later |
| `email_preferences` | Daily summary and marketing consent per user |
| `ai_usage` | Counters for AI limits. No message content is stored |

Rules worth knowing:
- Child rows use composite foreign keys `(contact_id, organization_id)` so a row
  cannot point at another workspace's contact.
- `created_by` is nullable and becomes empty when its author's account is deleted.
- Users cannot change `organization_id` or `created_by` after a row is created.
- `supabase/tests/security_test.sql` checks isolation and role limits,
  and rolls everything back.

## Product numbers without tracking

`supabase/inspect-product-metrics.sql` is read-only. It counts sign-ups per week, how far new people get (workspace, first contact, first follow-up, first finished follow-up, came back on a second day), weekly active people and which cadences are used. It uses only data the app already stores for the service, adds no tracking code, and the results contain counts, never names or emails. Run each query in the Supabase SQL Editor.

`contacts.deal_value` and `deal_currency` (estimated value) belong together too: both empty, or an amount above 0 up to one billion and RON, EUR or USD (`20261028_03`). The app only adds amounts up per currency, never converts.

`follow_ups.cadence` and `cadence_step` belong together: both empty, or a cadence name and a step from 1 to 10 (`20261028_01` and `20261028_02`).
