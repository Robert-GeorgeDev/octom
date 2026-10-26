import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL, siteConfigured } from "@/lib/site";
import { APP_HOST, hostName } from "@/lib/hosts";

// Crawlers of AI search and assistant products. They are allowed on purpose: being
// quoted and linked by ChatGPT, Claude, Perplexity, Gemini and Apple Intelligence
// brings visitors. To opt out of training only, remove "Google-Extended" and
// "Applebot-Extended" from this list.
const AI_CRAWLERS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = hostName((await headers()).get("host"));

  // The app (one.octom.eu) is for signed-in people, not for search engines.
  if (host === APP_HOST) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: ["/api/"] },
    ],
    ...(siteConfigured ? { sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/sitemap.txt`], host: SITE_URL } : {}),
  };
}
