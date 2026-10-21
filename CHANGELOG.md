# Changelog

## Unreleased

- Stripe, paid plans and plan limits removed. OCTOM One is free during beta: unlimited contacts and follow-ups, up to 5 people per workspace, 30 AI requests per user per day. Removed: checkout, billing portal, webhook, Plans page, usage banner, grace period and trial, plan picker on sign-up. The landing pricing section is now one free card. Run `supabase/remove-plans.sql` when deploying. Legal pages updated (Terms section 6, Privacy, Security, Subprocessors, Cookies, Billing); have them reviewed before launch.
- Early Feedback reward is now a 100% voucher for one month of Business, valid when paid plans launch.
- Log in, sign up, forgot and reset password redesigned: dark navy background with a violet-blue light beam, frosted glass card, gradient button, show/hide password. Sign-up is two columns (what you get, with a sample "Today" list) with a plan picker (Free, Pro with 7 days free, Business).
- Early Feedback banner on the landing page and the contact page: a confirmed bug or an accepted idea earns a free month of Business via a 100% voucher. The contact form repeats the rules.
- Contact form topics: bug, idea, payment or invoice, account, security, other. `/contact?topic=suggestion` opens the form with a topic chosen.
- Round social media icons (LinkedIn, Facebook, GitHub, TikTok, YouTube) in the site and legal-page footers. Links are set in `lib/social.ts`; an icon with an empty link is hidden.
- Failed payments: a paid plan now stays active for 7 days after the first failed payment, with a banner asking the owner to update the card. After that the workspace drops to Free. Run `supabase/billing-grace.sql` before deploying.
- Pro now starts with a 7-day free trial for a workspace's first subscription, no card needed. If no card is added the trial ends and nothing is charged.
- Contact form has a category (help, bug, suggestion, other) that shows in the email subject. Its rate limit is now kept in the database, so it holds across servers.
- Error log: server and browser crashes are saved to `error_events` with personal data removed, with a friendly error page and an optional email alert (max 3 per hour). Entries older than 30 days are deleted by the daily job.
- Daily summary email: sent in batches of 100 with a time budget, so a large user base no longer risks a timeout, and "today" follows each person's own time zone.
- CSV import warns about duplicates (same email or phone as an existing contact, or repeated in the file) and skips them by default.
- Dashboard: "Worth a message" lists open contacts with no follow-up and no activity for 21 days or more.
- Run `supabase/launch-readiness.sql` when deploying.
- Dashboard redesigned: soft blurred backdrop in the brand colours, rounded frosted panels, colour-coded follow-up tiles with one-tap complete, month calendar, stage funnel, today's schedule. Same data and actions as before.
- New app sidebar: collapsible (icon rail with hover menus), submenus for Contacts (by status, with counts) and Workspace, smooth animations. The choice is remembered on the device.
- Contacts: status filters, sorting, and a slide-over panel per contact (also available as a full page) with call, email, WhatsApp and website buttons, editable details (job title, company, email, phone, website, location, source), tags, activity log (notes, calls, emails, meetings), follow-ups and AI tab. Run `supabase/contacts-v2.sql` when deploying.
- Added PNG icons (apple-touch, favicon.ico, PWA manifest) generated from the octopus icon.
- Landing hero redesigned: dark opening with the animated octopus mascot, product window overlapping the hero, dark header and footer. Rest of the page unchanged.
- Redesigned landing page: neutral surfaces with a violet-blue accent, animated product window, scroll progress bar, new comparison section, rewritten copy (EN + RO). New rounded wordmark and octopus mascot in the brand gradient, new favicon.
- First public version.
- Removed Bootstrap Mode and the admin page. Plans and limits apply as before. Run `supabase/remove-bootstrap.sql` when deploying.
