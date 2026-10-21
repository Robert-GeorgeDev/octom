# Octom database files

SQL is applied by hand: Supabase dashboard > SQL Editor > paste > Run.

| File | What it is | Run on production? |
|---|---|---|
| `baseline.sql` | Snapshot of the live schema (2026-10-05). For disaster recovery and for building a staging project. | No (already live) |
| `security-fixes.sql` | Account deletion via service role only | Already run |
| `security-hardening-2.sql` | Same-workspace triggers, one workspace per user | Already run |
| `security-hardening-3.sql` | created_by on delete set null, AI global cap, invitation policy, MAINTAIN revoke | Already run |
| `remove-bootstrap.sql` | Removes Bootstrap Mode, platform-admin tables; plan limits apply again | Run when the matching app version is deployed |
| `contacts-v2.sql` | Adds website, location, job_title, source, tags to contacts (contact panel) | Yes, once, when the contact-panel version is deployed |
| `billing-grace.sql` | `grace_until` column and `org_plan()` keeps a paid plan for 7 days after a failed payment | Yes, once, **before** deploying the grace-period version |
| `launch-readiness.sql` | Persistent rate limits, `error_events` log, email time zone per user | Yes, once, when the launch-readiness version is deployed |
| `inspect-*.sql` | Read-only diagnostics | Any time |
| `tests/security_test.sql` | Security test, rolls back everything | Any time |

New empty project: baseline, security-fixes, security-hardening-2,
security-hardening-3, contacts-v2, billing-grace, launch-readiness. (`remove-bootstrap.sql` is already reflected in the baseline.)
