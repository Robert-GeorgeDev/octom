import type { MetadataRoute } from "next";
import { SITE_URL, siteConfigured } from "@/lib/site";
import { LEGAL } from "@/lib/legal";
import { roPath } from "@/lib/seo";
import { PAGES } from "@/lib/seo-pages";
import { ARTICLES } from "@/lib/articles";
import { SITE_PAGES, SITE_SLUGS } from "@/lib/site-pages";

// Date of the last real change to the product pages. Update it when their text changes:
// search engines ignore a date that changes on every visit.
const PRODUCT_UPDATED = "2026-10-22";

type Entry = MetadataRoute.Sitemap[number];

// Each page is listed in both languages, each entry pointing at its twin (hreflang).
function both(path: string, lastModified: string, changeFrequency: Entry["changeFrequency"], priority: number): Entry[] {
  const en = `${SITE_URL}${path}`; // "/" gives "https://octom.eu/", the same as the canonical address
  const ro = `${SITE_URL}${roPath(path)}`;
  const languages = { en, ro, "x-default": en };
  return [
    { url: en, lastModified, changeFrequency, priority, alternates: { languages } },
    { url: ro, lastModified, changeFrequency, priority, alternates: { languages } },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteConfigured) return [];
  return [
    ...both("/", PRODUCT_UPDATED, "weekly", 1),
    ...PAGES.flatMap((p) => both(`/for/${p.slug}`, PRODUCT_UPDATED, "monthly", 0.8)),
    // The blog exists in Romanian only, so these entries have no language twin.
    { url: `${SITE_URL}${roPath("/blog")}`, lastModified: PRODUCT_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    ...ARTICLES.map((a): Entry => ({ url: `${SITE_URL}${roPath(`/blog/${a.slug}`)}`, lastModified: a.updated, changeFrequency: "monthly", priority: 0.6 })),
    ...both("/docs", PRODUCT_UPDATED, "monthly", 0.7),
    ...both("/roadmap", PRODUCT_UPDATED, "monthly", 0.4),
    ...both("/contact", PRODUCT_UPDATED, "yearly", 0.5),
    ...SITE_SLUGS.filter((s) => SITE_PAGES[s].legal).flatMap((s) => both(`/${s}`, LEGAL.updated, "yearly", 0.3)),
  ];
}
