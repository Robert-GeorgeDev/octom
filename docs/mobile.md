# OCTOM One on phones: what is in place and the way to the app stores

## In place now (no store needed)

| Area | What is done |
|---|---|
| Install on Android | Chrome offers "Install" (our own card, `components/install-prompt.tsx`, and Chrome's menu). The app opens full screen on the Today page. |
| Install on iPhone and iPad | Safari has no install button for web apps, so the app shows a short hint: Share, then Add to Home Screen. |
| Home screen shortcuts | Long-press the icon on Android: Today, Pipeline, Weekly review (`app/manifest.ts`). |
| Offline page | If there is no internet, a friendly page appears instead of the browser error (`public/offline.html`). |
| Faster repeat visits | `public/sw.js` keeps the fixed, hashed app files. It never stores pages, API answers or contacts. |
| Identity | The manifest `id` stays `/dashboard`, so anyone who installed the app earlier keeps it. |

Not in place: notifications on the phone, working offline with contacts. Both need more work, and notifications are what Apple looks for in an app that wraps a website.

## Way to the stores (when you have users)

Both stores accept a thin shell around the web app, with limits. The numbers below were true when this was written: check them before you pay.

### Google Play (Android)

1. Developer account, one-time fee (about 25 USD). A personal account may need a closed test with a minimum number of testers for a number of days before the first public release. Read the current rule in Play Console.
2. Package the app as a Trusted Web Activity (PWABuilder or Bubblewrap build an `.aab` file from `https://one.octom.eu`).
3. Serve `https://one.octom.eu/.well-known/assetlinks.json` (the file links the app to the website; the tool gives you its content).
4. Store listing: icon 512x512, feature graphic 1024x500, screenshots, short and full description, link to the Privacy Policy, the Data safety form (what is collected, where it is stored: EU).

### Apple App Store (iOS)

1. Apple Developer Program, yearly fee (about 99 USD). Needs a Mac with Xcode, or a cloud build service.
2. A wrapper made with Capacitor. Apple's guideline 4.2 can reject an app that is only a website, so add something native first: push notifications for follow-ups are the natural one.
3. Store listing: screenshots for the required iPhone sizes, privacy details ("App Privacy"), a demo account for the reviewers, link to the Privacy Policy.
4. Sign in with Apple is only required if you add sign-in with other social providers. Email and password does not need it.

### Before either store

- Company incorporated, or accept that the store account is in your own name.
- `lib/legal.ts` filled in, Privacy Policy and Terms live.
- Account deletion from inside the app (already there, Account page): both stores require it.
- A reason for the first review to pass: a short, honest description and a test account.
