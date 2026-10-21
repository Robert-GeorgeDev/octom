# Changelog

## Unreleased

- New app sidebar: collapsible (icon rail with hover menus), submenus for Contacts (by status, with counts) and Workspace, smooth animations. The choice is remembered on the device.
- Contacts: status filters, sorting, and a slide-over panel per contact (also available as a full page) with call, email, WhatsApp and website buttons, editable details (job title, company, email, phone, website, location, source), tags, activity log (notes, calls, emails, meetings), follow-ups and AI tab. Run `supabase/contacts-v2.sql` when deploying.
- Added PNG icons (apple-touch, favicon.ico, PWA manifest) generated from the octopus icon.
- Landing hero redesigned: dark opening with the animated octopus mascot, product window overlapping the hero, dark header and footer. Rest of the page unchanged.
- Redesigned landing page: neutral surfaces with a violet-blue accent, animated product window, scroll progress bar, new comparison section, rewritten copy (EN + RO). New rounded wordmark and octopus mascot in the brand gradient, new favicon.
- First public version.
- Removed Bootstrap Mode and the admin page. Plans and limits apply as before. Run `supabase/remove-bootstrap.sql` when deploying.
