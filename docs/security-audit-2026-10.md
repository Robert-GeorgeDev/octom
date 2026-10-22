# Audit de securitate, date și conformitate (octombrie 2026)

Data: 22 octombrie 2026 · Versiune verificată: `main` @ 512a440 + remedierile din acest PR.

## Ce s-a verificat

| Zonă | Cum |
|---|---|
| Cod (toate rutele API, autentificare, proxy, CSV, AI, email, cron) | Citire integrală, căutare după tipare periculoase (XSS, redirect deschis, injecții, secrete) |
| Baza de date **live** (Supabase, proiectul de producție) | RLS pe fiecare tabel, politici, drepturi pe tabele și coloane, funcții `SECURITY DEFINER`, triggere, chei străine, Supabase Security Advisor |
| Izolare între clienți (live, doar citire, tranzacție anulată) | Un utilizator autentificat străin vede **0** rânduri în toate tabelele; rolul anonim nu are niciun drept pe tabele |
| Dependențe | `npm audit` (producție și dezvoltare) |
| Teste | 13 fișiere / 118 teste unitare, `tsc`, `next build` – toate trec |
| CI/CD | Workflow-uri GitHub (CI, CodeQL, dependency review, backup, IndexNow) |
| Juridic / GDPR | Politica de confidențialitate, Termeni, Cookie-uri, Subprocesatori, DPA draft, banner de consimțământ, înscriere |

Site-ul live (octom.eu) nu a putut fi accesat din mediul de audit (rețea blocată), deci headerele HTTP au fost verificate în cod, nu pe server. Vezi „Pași manuali” pentru verificarea live.

## Rezumat

Nu am găsit nicio vulnerabilitate exploatabilă de severitate înaltă sau medie. Fundația e bună: RLS peste tot, funcțiile sensibile au `search_path` gol, anonimii nu au acces la nimic, cheia de service există doar pe server, rate limiting persistent, CSV injection tratat, URL-urile din contacte sunt filtrate (`javascript:` imposibil), prompt-urile AI tratează datele ca neîncredere, emailurile escapează HTML-ul.

**Blocantul real pentru lansare este juridic, nu tehnic:** datele firmei lipsesc (vezi J1).

## Remedieri făcute în acest PR

| # | Problemă | Remediere |
|---|---|---|
| F1 | `/api/health` și `/api/ping` sunt publice; fiecare apel făcea o interogare cu cheia de service + 2 cereri externe. Un script putea genera trafic și costuri nelimitate. | Rezultat comun timp de 30 s (`lib/health.ts`), test nou `tests/health-cache.test.ts`. |
| F2 | Funcțiile Vercel rulau implicit în SUA (`iad1`), deși baza de date e la Frankfurt: datele clienților (AI, ștergere cont, rezumatul zilnic) treceau prin SUA. | `vercel.json`: `"regions": ["fra1"]`. Mai puține transferuri în afara SEE și latență mai mică. |
| F3 | Retragerea consimțământului pentru analytics nu oprea scriptul deja încărcat până la următoarea vizită. | Pagina se reîncarcă fără script când consimțământul e retras. |
| F4 | Backup-urile criptate ale bazei de date sunt stocate la GitHub, dar GitHub nu apărea ca subprocesator. | Adăugat în Subprocesatori (RO + EN); Politica de confidențialitate spune acum explicit „cel mult 30 de zile” pentru backup-uri. |
| F5 | Utilizatorul își putea rescrie propriul `unsubscribe_token` prin API (inofensiv, dar inutil). | Migrare `supabase/migrations/20261022_02_prefs-token-lock.sql` (testată pe producție într-o tranzacție anulată). **Trebuie rulată manual** în SQL Editor; până atunci `/api/health` arată `"schema": false`. |

## Juridic și GDPR – de rezolvat înainte de lansare

| # | Prioritate | Problemă | Ce trebuie făcut |
|---|---|---|---|
| J1 | **Blocant** | `lib/legal.ts` conține încă `[Denumirea completă a societății]`, `[CUI]`, `[J../../..]`, `[Adresa sediului social]`. Paginile legale afișează banner „Draft”. Legea 365/2002 (art. 5) și GDPR (art. 13) cer identificarea completă a furnizorului / operatorului. | Completează datele firmei (SRL/PFA) în `lib/legal.ts`. Fără entitate juridică nu poți încheia contracte și nu poți fi operator GDPR. |
| J2 | **Ridicată** | Clienții introduc date despre terți (contactele lor) → Octom e **persoană împuternicită** (art. 28 GDPR). Art. 28(3) cere un contract cu fiecare client, nu „la cerere”. `docs/dpa-draft.md` e doar ciornă. | Un avocat finalizează DPA-ul; publică-l ca pagină și include-l prin trimitere în Termeni, acceptat la înscriere. |
| J3 | **Ridicată** | Contracte cu furnizorii: ai nevoie de DPA semnat/acceptat cu Supabase, Vercel, Resend, OpenAI, GitHub. | Acceptă DPA-urile din dashboard-urile lor (Supabase și OpenAI au formular separat). La OpenAI: confirmă că datele API nu sunt folosite la antrenare; ia în calcul „EU data residency” / Zero Data Retention. |
| J4 | **Ridicată** | Planurile gratuite: Vercel **Hobby interzice uzul comercial**; Supabase Free nu are backup propriu, nici PITR și se poate suspenda. | Treci pe Vercel Pro și Supabase Pro înainte de primii clienți plătitori (sau imediat ce e serviciu comercial). |
| J5 | Medie | Registrul activităților de prelucrare (art. 30) – nu există în repo. | Folosește `docs/data-map.md` ca bază și fă un registru simplu (scop, temei, categorii, retenție, destinatari). |
| J6 | Medie | AI Act art. 50 (transparență, aplicabil din aug. 2026): utilizatorii trebuie să știe că un text e generat de AI. | Asistentul e etichetat ca atare; păstrează mențiunea „generat de AI, verifică înainte să trimiți” lângă fiecare rezultat. |
| J7 | Scăzută | Consimțământul de marketing se salvează doar în `user_metadata` (modificabil de utilizator). | Când începi să trimiți newslettere, salvează consimțământul într-un tabel separat, cu dată și textul acceptat. |
| J8 | Scăzută | Facturare/plăți (Netopia) – încă inexistente. | Când adaugi plăți: e-Factura (B2B), dreptul de retragere B2C, prețuri cu TVA, actualizare Termeni. |

## Securitate – recomandări (nu vulnerabilități)

| # | Prioritate | Recomandare | De ce |
|---|---|---|---|
| S1 | Medie | **Activează protecția împotriva parolelor compromise** (HaveIBeenPwned) și setează lungimea minimă 8 în Supabase > Auth > Password. | Supabase Advisor o semnalează. Acum minimul 8 e verificat doar în browser. |
| S2 | Medie | **MFA (TOTP)** opțional pentru conturi; obligatoriu pentru contul tău de admin pe Supabase, Vercel, GitHub, Resend, OpenAI, registrar DNS. | Compromiterea unui cont de furnizor = compromiterea tuturor datelor. |
| S3 | Medie | CSP folosește `script-src 'unsafe-inline'`. Sesiunea Supabase e în `localStorage`, deci un XSS ar putea fura sesiunea. | Riscul actual e mic (React escapează tot, nu există HTML injectat din date), dar un CSP cu nonce sau hash-uri ar elimina clasa de atac. Necesită randare dinamică; de făcut după lansare. |
| S4 | Medie | Fixează GitHub Actions la SHA (ex. `actions/checkout@<sha>`), mai ales în `backup.yml`, care are acces la URL-ul bazei de date. | Un tag compromis al unei acțiuni terțe ar putea exfiltra secretele. |
| S5 | Scăzută | Restaurare de test lunară a unui backup într-un proiect Supabase separat. Păstrează passphrase-ul backup-ului într-un manager de parole, separat de GitHub. | Un backup netestat nu e un backup. |
| S6 | Scăzută | Orice membru al unui spațiu de lucru poate șterge toate contactele. | Decizie de produs: limitează ștergerea în masă la owner/admin sau adaugă „coș” cu restaurare 30 de zile. |
| S7 | Scăzută | Linkurile de invitație nu sunt legate de o adresă de email (oricine are linkul, 7 zile). | Acceptabil pentru beta; ulterior, opțiune de legare la email. |
| S8 | Scăzută | `npm audit`: 0 probleme în producție. 7 în uneltele de dezvoltare (vitest, tailwind 3 → braces). Nu ajung în site. | `npm audit fix` eșuează din cauza unui bug npm cu `overrides`; Dependabot va propune vitest ≥ 4.1.12. Tailwind 4 rezolvă restul. |
| S9 | Scăzută | HSTS fără `preload`. | După ce totul merge stabil pe HTTPS (inclusiv subdomeniile), adaugă `preload` și înscrie domeniul pe hstspreload.org (greu de anulat). |
| S10 | Scăzută | `/api/report-error` e public: un atacator poate trimite cel mult 3 emailuri de alertă pe oră către tine, cu text ales de el. | Tratează emailurile de alertă ca neîncredere; nu da click pe linkuri din ele. |

## Pași manuali de verificare (nu se pot face din cod)

1. Rulează `supabase/migrations/20261022_02_prefs-token-lock.sql` în Supabase SQL Editor, apoi deschide `/api/health` și verifică `"schema": true`.
2. Verifică headerele live pe https://securityheaders.com și https://observatory.mozilla.org pentru `octom.eu` și `one.octom.eu` (ținta: A/A+).
3. TLS: https://www.ssllabs.com/ssltest/ pentru ambele domenii (ținta: A+).
4. Email: SPF, DKIM și DMARC (`p=quarantine` sau `reject`) pentru `octom.eu` – verifică pe https://www.mail-tester.com. Fără ele, emailurile de resetare a parolei ajung în spam și domeniul poate fi folosit la phishing.
5. DNS: CAA record (`0 issue "letsencrypt.org"` sau ce folosește Vercel) și blocare de transfer la registrar.
6. După deploy, verifică în Vercel > Settings > Functions că regiunea este `fra1`.
7. Supabase > Auth > URL Configuration: doar `https://one.octom.eu/**` în „Redirect URLs”, fără `localhost` pe producție.
8. Supabase > Auth > Rate limits și CAPTCHA (hCaptcha/Turnstile) la înscriere dacă apar conturi false.
