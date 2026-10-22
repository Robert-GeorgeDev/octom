# Backups and uptime monitoring (all free)

Free Supabase has **no backups** and pauses a project after 7 days of low activity. This page covers the two things that make up for it.

## 1. Uptime monitoring

`/api/ping` answers `200` when the app and the database work and `503` otherwise (`/api/health` always answers 200 because the status page reads its details). Each check also reads one database row, which counts as activity and keeps the project from being paused.

Set up in UptimeRobot (free plan, commercial use allowed):

1. Create an account, install the mobile app and allow push notifications.
2. Add HTTP monitors (5-minute interval): `https://octom.eu/api/ping`, `https://octom.eu`, `https://one.octom.eu/login`.
3. Alerts: email + push (SMS and voice are paid).
4. Optional: add a public status page in UptimeRobot (free plan has one).

## 2. Daily encrypted backup

Workflow: `.github/workflows/backup.yml` (every night 02:17 UTC, and on demand). It dumps your tables and data plus the login accounts, encrypts the file with a password (GPG, AES-256), and stores it in a **private** repository, keeping the newest 30.

### One-time setup

1. **Private repo**: create `octom-backups` (private, empty, with a README so it has a branch).
2. **Backup password**: invent a long random password (at least 16 characters, e.g. 4-5 random words) and save it in your password manager. It goes into GitHub as a secret. Without it the backups cannot be opened, so keep a second copy offline.
3. **Database URL**: Supabase dashboard → Connect → *Session pooler* → copy the URI (port 5432) and put your database password in place of `[YOUR-PASSWORD]`. (The direct connection does not work from GitHub because it needs IPv6.)
4. **Token**: GitHub → Settings → Developer settings → Fine-grained tokens → only repository `octom-backups`, permission *Contents: Read and write*, expiry 1 year (put the date in your calendar).
5. **Monitor for missed backups (recommended)**: healthchecks.io free account → new check, period 1 day, grace 3 hours → copy its ping URL.
6. In the octom repo → Settings → Secrets and variables → Actions:
   - Secrets: `SUPABASE_DB_URL`, `BACKUP_PASSPHRASE`, `BACKUP_REPO_TOKEN`, `HEALTHCHECK_URL` (optional)
   - Variable: `BACKUP_REPO` = `Robert-GeorgeDev/octom-backups`
7. Actions → *Database backup* → Run workflow. Check that a `.gpg` file appears in the private repo.

### Restore drill (do it once now, then every few months)

A backup you never restored is not a backup.

1. Create an empty Supabase project (free).
2. Download a file from `octom-backups/backups/` and decrypt (it asks for the password):
   `gpg -o backup.tar.gz -d octom-....tar.gz.gpg && tar -xzf backup.tar.gz`
3. In the new project run `psql "<its session pooler URI>" -f public.sql`, then `psql "<URI>" -f auth-data.sql`.
4. Open the app against the new project and check that you can log in and see contacts.

### What is and is not covered

- Covered: all tables and rows in `public`, and the accounts in `auth` (logins).
- Not covered: Supabase settings (auth providers, email templates, redirect URLs), file storage if you ever use it, and environment variables. Keep those documented.
- Data can be up to 24 hours old at worst. When paying customers arrive, move to Supabase Pro (daily backups, 7 days).
- If a run fails GitHub emails you; if no run happens at all (for example the schedule was disabled after inactivity), healthchecks.io emails you.
- The private repo keeps history, so deleted old backups remain in git history (still encrypted). If it ever grows too big, recreate the repo.
