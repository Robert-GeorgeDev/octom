import { SITE_URL } from "@/lib/site";
import { SOCIAL_LINKS } from "@/lib/social";
import { dictionaries } from "@/lib/dictionaries";
import { PAGES } from "@/lib/seo-pages";
import { ARTICLES } from "@/lib/articles";
import { SITE_PAGES, SITE_SLUGS } from "@/lib/site-pages";
import { TOOL_SLUGS, toolCopy } from "@/lib/tools";
import { DEMO_COPY } from "@/lib/demo";
import { roPath } from "@/lib/seo";

// Plain-text descriptions of the site for AI assistants (the llms.txt convention).
// Everything here is generated from the same texts as the website, so they cannot drift apart.

const SUMMARY =
  "OCTOM One is a simple CRM built around follow-ups. Every morning it shows freelancers, consultants, small agencies and small B2B teams who to contact today, and helps draft what to say. It is free during beta, its core is open source (AGPL-3.0), and the interface is in English and Romanian.";

const FACTS = [
  "Product: OCTOM One, a lightweight follow-up CRM (not a full sales suite).",
  "For: freelancers, solopreneurs, consultants, small agencies and small B2B teams.",
  "Price: free during beta, with unlimited contacts and follow-ups and no card needed. Paid plans may come later and users would be told well in advance.",
  "Workspace size: up to 5 people.",
  "Core features: daily list of who to contact today, follow-up reminders and a daily email summary, contacts with notes, tags and history, pipeline view, CSV import and export, assignees.",
  "Cadences: short series of follow-ups for a sent quote, a quiet contact, an unpaid invoice or a meeting. Finishing one step schedules the next, and the person can stop a cadence at any time.",
  "Weekly review: a page with what was finished in the last 7 days, what is overdue, what is coming up and which open contacts have no next step. It sends nothing to anyone.",
  "Estimated value: each contact can carry an estimated deal value in a currency chosen by the user. Totals are shown per currency and are not converted.",
  "Demo: https://octom.eu/demo works without an account or card, uses example contacts and saves nothing.",
  "Not included: no email sending, no invoicing, no phone or marketing automation. OCTOM One is for knowing who to contact next, not a full sales suite.",
  "AI assistant: drafts messages for the user to review. It cannot send messages, edit contacts or delete anything. OCTOM One never sends email on the user's behalf.",
  "Data: stored in the EU (Frankfurt). Workspaces are isolated at the database level. Users can export their contacts as CSV and delete their account at any time.",
  "Open source: the core is public under the AGPL-3.0 license. A step-by-step self-hosting guide is in the repository (docs/self-hosting.md).",
  "Languages: English and Romanian.",
  "Website: " + SITE_URL + ". The app itself runs at https://one.octom.eu and is for signed-in users.",
  "Contact: contact@octom.eu.",
];

const url = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

export function llmsTxt(): string {
  const github = SOCIAL_LINKS.github;
  const lines: string[] = [
    "# OCTOM One",
    "",
    `> ${SUMMARY}`,
    "",
    "## Product",
    `- [OCTOM One home (English)](${url("/")}): what it is, how it works, pricing and FAQ`,
    `- [OCTOM One acasă (română)](${SITE_URL}${roPath("/")}): aceeași pagină, în română`,
    `- [Live demo](${url("/demo")}): ${DEMO_COPY.en.desc}`,
    "",
    "## Who it is for",
    ...PAGES.map((p) => `- [${p.en.h1}](${url(`/for/${p.slug}`)}): ${p.en.desc}`),
    "",
    "## Free tools (no account needed)",
    ...TOOL_SLUGS.map((s) => `- [${toolCopy(s, "en").h1}](${url(`/tools/${s}`)}): ${toolCopy(s, "en").desc}`),
    "",
    "## Articles (Romanian)",
    ...ARTICLES.map((a) => `- [${a.h1}](${SITE_URL}${roPath(`/blog/${a.slug}`)}): ${a.desc}`),
    "",
    "## Documentation and policies",
    `- [Documentation](${url("/docs")}): ${SITE_PAGES.docs.en.description}`,
    ...SITE_SLUGS.filter((s) => SITE_PAGES[s].legal).map((s) => `- [${SITE_PAGES[s].en.title}](${url(`/${s}`)}): ${SITE_PAGES[s].en.description}`),
    `- [Contact](${url("/contact")}): ${SITE_PAGES.contact.en.description}`,
    "",
    "## Optional",
    `- [Full text for AI assistants](${url("/llms-full.txt")}): all key facts, FAQ and audience pages in one file`,
    ...(github ? [`- [Source code on GitHub](${github}): the open source core`, `- [Self-hosting guide](${github}/blob/main/docs/self-hosting.md): how to run OCTOM One on your own server`] : []),
    "",
  ];
  return lines.join("\n");
}

export function llmsFullTxt(): string {
  const en = dictionaries.en as Record<string, string>;
  const ro = dictionaries.ro as Record<string, string>;
  const faq = (d: Record<string, string>) =>
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => `### ${d[`land.q${n}`]}\n${d[`land.a${n}`]}`).join("\n\n");

  const audience = (lang: "en" | "ro") =>
    PAGES.map((p) => {
      const c = p[lang];
      return [
        `### ${c.h1}`,
        c.intro,
        `${c.problemsTitle}:`,
        ...c.problems.map((x) => `- ${x}`),
        `${c.pointsTitle}:`,
        ...c.points.map((x) => `- ${x.t}: ${x.d}`),
        `${c.stepsTitle}:`,
        ...c.steps.map((x, i) => `${i + 1}. ${x}`),
        `${c.faqTitle}:`,
        ...c.faq.map((f) => `- ${f.q} ${f.a}`),
        `Page: ${SITE_URL}${lang === "ro" ? roPath(`/for/${p.slug}`) : `/for/${p.slug}`}`,
      ].join("\n");
    }).join("\n\n");

  return [
    "# OCTOM One – full description for AI assistants",
    "",
    `> ${SUMMARY}`,
    "",
    "## Key facts",
    ...FACTS.map((f) => `- ${f}`),
    "",
    "## Frequently asked questions (English)",
    faq(en),
    "",
    "## Întrebări frecvente (română)",
    faq(ro),
    "",
    "## Who OCTOM One is for (English)",
    audience("en"),
    "",
    "## Pentru cine este OCTOM One (română)",
    audience("ro"),
    "",
    "## Articole (română)",
    ...ARTICLES.map((a) => `### ${a.h1}\n${a.intro}\n${a.faq.map((f) => `- ${f.q} ${f.a}`).join("\n")}\nPage: ${SITE_URL}${roPath(`/blog/${a.slug}`)}`),
    "",
    "## Pages",
    `- Home: ${url("/")} (English), ${SITE_URL}${roPath("/")} (română)`,
    `- Documentation: ${url("/docs")}`,
    ...SITE_SLUGS.filter((s) => SITE_PAGES[s].legal).map((s) => `- ${SITE_PAGES[s].en.title}: ${url(`/${s}`)}`),
    `- Short index: ${url("/llms.txt")}`,
    "",
  ].join("\n");
}
