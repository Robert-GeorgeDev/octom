# Self-hosting Octom

Octom is open source (AGPL-3.0), so you can run your own copy. This guide lists only what is checked against the code in this repository. Anything not checked is marked **Not verified**.

You need: Node.js 22 or newer, a Supabase project (supabase.com), and somewhere to run a Next.js app. The project itself runs on Vercel.

## 1. Get the code

```
git clone https://github.com/Robert-GeorgeDev/octom.git
cd octom
npm ci
```

## 2. Point it at your own Supabase project

The Supabase address and public key are written in `lib/supabase-config.ts`, not in an environment variable. They are the values the repository's own project uses, so **replace both with those of your project** (Supabase dashboard > Project Settings > API: the project URL and the publishable key). The publishable key is meant to be public. Never put the service role key in this file.

## 3. Create the database

In Supabase, open SQL Editor and run these files from `supabase/`, in this order, one at a time:

1. `baseline.sql`
2. `security-fixes.sql`
3. `security-hardening-2.sql`
4. `security-hardening-3.sql`
5. `contacts-v2.sql`
6. `launch-readiness.sql`
7. `remove-plans.sql`
8. every file in `supabase/migrations/`, in the order of their names

Checked: this exact sequence was run on an empty PostgreSQL 16 database with a stand-in for the Supabase `auth` schema and finished without errors, except `GRANT ... MAINTAIN` in `security-hardening-3.sql`, which needs PostgreSQL 17 (Supabase projects normally use a version that has it). While doing this check, `baseline.sql` was found to call two helper functions it did not define, so a new empty project failed. That is fixed in the same change as this guide. If you cloned an older copy, pull first.

**Not verified:** running the sequence on a real new Supabase project, and `supabase/tests/security_test.sql` on the stand-in database (it needs real users). Run the security test on your own project after step 8. It must end with the message `ALL TESTS PASSED (rolled back on purpose)`.

Do not run `baseline.sql` on a project that already has data.

## 4. Configure Supabase Auth

In the dashboard:

- Authentication > URL Configuration: set Site URL to the address where people will use the app, and add the same address followed by `/**` to Redirect URLs.
- Authentication > Emails > Templates: paste in the files from `supabase/email-templates/` (see the README there). The password reset template uses `{{ .SiteURL }}`, so the Site URL must be exactly the address your users open.
- Authentication > SMTP: set your own email sender. Supabase's default sender is limited and may land in spam.

## 5. Set environment variables

Copy `.env.example` to `.env.local` for local use, or set the same names in your host.

| Name | Needed for | If missing |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Account deletion, the daily summary job and other server-only work | Those routes answer with an error |
| `CRON_SECRET` | Protects `/api/cron/daily-summary` | The route always answers 401 |
| `RESEND_API_KEY` | Daily summary and contact form emails | The daily summary route answers `not_configured` |
| `EMAIL_FROM` | The sender of those emails (optional) | A Resend test address is used, which is only fit for trying |
| `CONTACT_TO_EMAIL` | Where contact form and error alerts go (optional) | Not sent |
| `APP_URL` | Links inside the daily summary (optional) | The address in `lib/hosts.ts` is used |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | The assistant that drafts messages (optional) | The assistant cannot answer |

The service role key bypasses all database security. Keep it only in your host's secret settings.

## 6. Run it

```
npm run dev
```

opens http://localhost:3000. For production: `npm run build`, then `npm start`.

On any address other than the project's own (`octom.eu`, `one.octom.eu`), the app does not redirect between a "site" address and an "app" address, so one address serves everything. See `redirectTarget` in `lib/hosts.ts`.

## 7. Things that still carry the original project's details

Search the code for these before you go public:

- `lib/hosts.ts`: `SITE_URL`, `APP_URL` and the host names. They feed links, the sitemap, social previews and the health check (`/api/health` calls `APP_URL/login`).
- `lib/legal.ts`, `lib/social.ts` and the legal pages: the company details, addresses and policies are the original project's. Replace them with yours, and have the privacy and terms texts reviewed for your situation. `docs/dpa-draft.md` and `docs/data-map.md` describe the original setup.
- Name, logo and icons (`components/mark.tsx`, `public/`, `app/`): replace them if you do not want to look like the original product.

## 8. Daily summary email

`vercel.json` schedules `/api/cron/daily-summary` once a day for Vercel. On another host, call that address once a day with the header `Authorization: Bearer <CRON_SECRET>`. Add `?dry=1` first to see what would be sent without sending. If the answer says `done: false`, call again with `?after=<next>`.

## 9. Check that it works

- `/api/health` shows `"schema": true` when every file in `supabase/migrations/` is registered. `false` means a file was not run.
- Create an account, add a contact, schedule a follow-up and finish it. Create a second account and confirm it cannot see the first one's data.

## AGPL

If you run a modified version as a network service, the AGPL requires you to offer your users the source of your changes. Keep the license file and say where your source is.

## Not verified

- Hosting other than Vercel. `npm run build` and `npm start` are standard for Next.js, but no other host has been tried.
- A self-hosted Supabase stack (as opposed to supabase.com). It has not been tried.
- A full install by someone who is not the author. If a step fails for you, please open an issue with the exact message.
