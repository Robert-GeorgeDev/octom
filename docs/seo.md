# Search, AI answers and indexing: what is in place and what you do

## What the site does by itself

| Area | What is done |
|---|---|
| Titles, descriptions | Every public page has its own, in English and Romanian (`lib/site-pages.ts`, `lib/seo-pages.ts`). One title pattern: `Page | OCTOM One`. |
| Canonical + language twins | Each page points at itself (canonical) and at its English/Romanian twin (hreflang), so Google shows the right language. English at `/page`, Romanian at `/ro/page`. |
| Sitemap | `/sitemap.xml` lists every page in both languages with hreflang and a real "last changed" date. |
| robots.txt | Open to search engines and to AI search crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended). The app address (`one.octom.eu`) is closed to all crawlers. |
| Structured data (schema.org) | Organization, WebSite, SoftwareApplication (free during beta), FAQPage (7 questions, both languages), BreadcrumbList. No ratings or reviews, because there are none yet. |
| GEO / AEO (AI assistants) | `/llms.txt` (short index) and `/llms-full.txt` (all facts, FAQ and audience pages). The home page starts its FAQ with "What is OCTOM One?" so assistants can quote a direct answer. |
| Social previews | A 1200x630 image per language (`/opengraph-image`, `/ro/opengraph-image`) plus Open Graph and Twitter tags on every page. |
| IndexNow | `public/<key>.txt` proves ownership. After each change to the site, the "IndexNow" GitHub workflow sends all sitemap URLs to Bing, Yandex and others (about 4 minutes after the push, to let the deployment finish). |

## What only you can do (about 30 minutes)

1. **Google Search Console** (search.google.com/search-console): add `octom.eu` as a "Domain" property and verify it with the DNS record Google shows (or, if you prefer a tag, put the code in Vercel as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`). Then Sitemaps > add `sitemap.xml`.
2. **Bing Webmaster Tools** (bing.com/webmasters): "Import from Google Search Console" does it in two clicks. Bing also feeds DuckDuckGo, Ecosia and ChatGPT search, so it matters more than it used to.
3. In Search Console, **URL Inspection** > paste `https://octom.eu/` and `https://octom.eu/ro` > Request indexing.
4. Check `/api/health` shows `"schema": true` and run https://search.google.com/test/rich-results on the home page (it should show "FAQ" and "Software application").
5. Fill in `lib/social.ts` (company page links). They go into the structured data as `sameAs`, which helps search engines and AI assistants tie the brand to its profiles.
6. Put real company details in `lib/legal.ts`. Legal pages marked "Draft" are a weak trust signal.

## What helps most after launch

- Real content: one useful page per question people actually search (for example "how to follow up with a lead", "CRM for freelancers in Romania"). The four audience pages are the template.
- Links from outside: GitHub README, a Product Hunt or similar listing, Romanian startup directories, LinkedIn page, guest posts. Search engines and AI assistants trust what others link to.
- Real reviews from beta testers, with permission. Add them to the page and then, only then, to the structured data.
- When a page's text changes, update `PRODUCT_UPDATED` in `app/sitemap.ts`.

## Opting out of AI training only

Remove `Google-Extended` and `Applebot-Extended` from `AI_CRAWLERS` in `app/robots.ts`. Search products (OAI-SearchBot, Claude-SearchBot, PerplexityBot) are separate and keep working.
