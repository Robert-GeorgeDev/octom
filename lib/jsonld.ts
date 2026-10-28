import { SITE_URL } from "@/lib/site";
import { SOCIAL_LINKS, SOCIAL_ORDER } from "@/lib/social";
import { localizedPath, SITE_NAME, type Lang } from "@/lib/seo";

// Structured data (schema.org) that search engines and AI assistants read.
// Only true statements: no ratings, reviews or prices that do not exist.

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

const description: Record<Lang, string> = {
  en: "OCTOM One is a simple CRM built around follow-ups. Every morning it shows freelancers, consultants and small teams who to contact today and what to say.",
  ro: "OCTOM One este un CRM simplu, construit în jurul follow-up-urilor. În fiecare dimineață le arată freelancerilor, consultanților și echipelor mici pe cine să contacteze azi și ce să spună.",
};

const features: Record<Lang, string[]> = {
  en: [
    "Daily list of who to contact today",
    "Follow-up reminders and a daily email summary",
    "Contacts with notes, tags and history",
    "Pipeline view with an estimated value per contact",
    "Follow-up cadences for quotes, invoices and quiet contacts",
    "Weekly review of what was finished, what is overdue and what is next",
    "AI assistant that drafts messages for you to review",
    "CSV import and export",
    "Demo that works without an account",
    "Open source and self-hostable",
    "Shared workspace for up to 5 people",
    "English and Romanian interface",
  ],
  ro: [
    "Listă zilnică cu cine contactezi azi",
    "Mementouri pentru follow-up și rezumat zilnic pe email",
    "Contacte cu notițe, etichete și istoric",
    "Vedere de tip pipeline, cu valoare estimată pe contact",
    "Cadențe de follow-up pentru oferte, facturi și contacte care au tăcut",
    "Recapitulare săptămânală: ce ai încheiat, ce e întârziat, ce urmează",
    "Asistent AI care scrie mesaje pe care le verifici tu",
    "Import și export CSV",
    "Demo care funcționează fără cont",
    "Open-source și poate fi găzduit de tine",
    "Spațiu de lucru comun pentru până la 5 persoane",
    "Interfață în română și engleză",
  ],
};

export function organizationLd() {
  const sameAs = SOCIAL_ORDER.map((k) => SOCIAL_LINKS[k]).filter(Boolean);
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "OCTOM",
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 },
    email: "contact@octom.eu",
    ...(sameAs.length > 0 ? { sameAs } : {}),
    contactPoint: { "@type": "ContactPoint", email: "contact@octom.eu", contactType: "customer support", availableLanguage: ["en", "ro"] },
  };
}

export function websiteLd() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: ["en", "ro"],
    publisher: { "@id": ORG_ID },
  };
}

export function softwareLd(lang: Lang) {
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: SITE_NAME,
    url: `${SITE_URL}${localizedPath("/", lang)}`,
    description: description[lang],
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: ["en", "ro"],
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", description: lang === "ro" ? "Gratuit în perioada beta" : "Free during beta" },
    featureList: features[lang],
    license: "https://www.gnu.org/licenses/agpl-3.0.html",
    softwareHelp: { "@type": "CreativeWork", url: `${SITE_URL}${localizedPath("/docs", lang)}` },
    publisher: { "@id": ORG_ID },
  };
}

/** The public source code. Only included when the repository address is set. */
export function sourceCodeLd() {
  const repo = SOCIAL_LINKS.github;
  if (!repo) return null;
  return {
    "@type": "SoftwareSourceCode",
    "@id": `${SITE_URL}/#source`,
    name: `${SITE_NAME} source code`,
    codeRepository: repo,
    programmingLanguage: "TypeScript",
    license: "https://www.gnu.org/licenses/agpl-3.0.html",
    runtimePlatform: "Node.js",
    targetProduct: { "@id": `${SITE_URL}/#software` },
    publisher: { "@id": ORG_ID },
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function breadcrumbLd(lang: Lang, trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${localizedPath(t.path, lang)}`,
    })),
  };
}

export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/** A blog article (Romanian only). */
export function articleLd(a: { slug: string; title: string; desc: string; published: string; updated: string }) {
  const url = `${SITE_URL}${localizedPath(`/blog/${a.slug}`, "ro")}`;
  return {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: a.title,
    description: a.desc,
    datePublished: a.published,
    dateModified: a.updated,
    inLanguage: "ro",
    mainEntityOfPage: url,
    url,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}
