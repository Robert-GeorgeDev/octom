import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { pageMetadata, roPath } from "@/lib/seo";
import { PAGES } from "@/lib/seo-pages";
import { ARTICLES } from "@/lib/articles";
import { SITE_PAGES, SITE_SLUGS } from "@/lib/site-pages";
import { breadcrumbLd, faqLd, graph, organizationLd, softwareLd, websiteLd } from "@/lib/jsonld";
import { llmsFullTxt, llmsTxt } from "@/lib/llms";
import { dictionaries } from "@/lib/dictionaries";
import { SITE_URL } from "@/lib/site";

describe("roPath", () => {
  it("puts /ro in front of a path", () => {
    expect(roPath("/")).toBe("/ro");
    expect(roPath("/privacy")).toBe("/ro/privacy");
    expect(roPath("/for/agencies")).toBe("/ro/for/agencies");
  });
});

describe("pageMetadata", () => {
  it("sets canonical, language twins and the right image per language", () => {
    const en = pageMetadata({ title: "Privacy Policy", description: "d", path: "/privacy", lang: "en" });
    const ro = pageMetadata({ title: "Politica", description: "d", path: "/privacy", lang: "ro" });
    expect(en.alternates?.canonical).toBe("/privacy");
    expect(ro.alternates?.canonical).toBe("/ro/privacy");
    expect(en.alternates?.languages).toEqual({ en: "/privacy", ro: "/ro/privacy", "x-default": "/privacy" });
    expect(en.openGraph?.locale).toBe("en_US");
    expect(ro.openGraph?.locale).toBe("ro_RO");
    expect(JSON.stringify(en.openGraph?.images)).toContain("/opengraph-image");
    expect(JSON.stringify(ro.openGraph?.images)).toContain("/ro/opengraph-image");
  });

  it("does not add the site name twice on the home page", () => {
    const home = pageMetadata({ title: "OCTOM One – Know who to contact today", description: "d", path: "/", lang: "en", wholeTitle: true });
    expect(home.title).toEqual({ absolute: "OCTOM One – Know who to contact today" });
    expect(home.openGraph?.title).toBe("OCTOM One – Know who to contact today");
  });
});

describe("page copy", () => {
  it("keeps titles and descriptions a sensible length in both languages", () => {
    const all = [
      ...PAGES.flatMap((p) => [p.en, p.ro].map((c) => ({ id: p.slug, title: c.title, desc: c.desc }))),
      ...SITE_SLUGS.flatMap((s) => [SITE_PAGES[s].en, SITE_PAGES[s].ro].map((c) => ({ id: s, title: c.title, desc: c.description }))),
    ];
    for (const { id, title, desc } of all) {
      expect(title.length + " | OCTOM One".length, `${id} title`).toBeLessThanOrEqual(65);
      expect(desc.length, `${id} description`).toBeGreaterThanOrEqual(50);
      expect(desc.length, `${id} description`).toBeLessThanOrEqual(170);
    }
  });

  it("has the same structure in English and Romanian for every audience page", () => {
    for (const p of PAGES) {
      expect(p.ro.problems.length, p.slug).toBe(p.en.problems.length);
      expect(p.ro.points.length, p.slug).toBe(p.en.points.length);
      expect(p.ro.steps.length, p.slug).toBe(p.en.steps.length);
      expect(p.ro.faq.length, p.slug).toBe(p.en.faq.length);
      for (const c of [p.en, p.ro]) {
        expect(c.faq.length, p.slug).toBeGreaterThanOrEqual(3);
        for (const f of c.faq) expect(f.q.trim() && f.a.trim(), p.slug).toBeTruthy();
      }
    }
  });
});

describe("sitemap", () => {
  const entries = sitemap();

  it("lists every page in both languages with its twin", () => {
    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(`${SITE_URL}/ro`);
    expect(urls).toContain(`${SITE_URL}/for/freelancers`);
    expect(urls).toContain(`${SITE_URL}/ro/for/freelancers`);
    expect(urls).toContain(`${SITE_URL}/ro/privacy`);
    for (const e of entries.filter((x) => !x.url.includes("/blog"))) {
      const langs = e.alternates?.languages as Record<string, string>;
      expect(Object.keys(langs).sort(), e.url).toEqual(["en", "ro", "x-default"]);
      expect(e.url.startsWith(SITE_URL), e.url).toBe(true);
    }
  });

  it("leaves out the live status page and uses stable dates", () => {
    expect(entries.some((e) => e.url.includes("/status"))).toBe(false);
    for (const e of entries) expect(String(e.lastModified), e.url).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("structured data", () => {
  it("describes the organisation, site and software, without invented ratings or reviews", () => {
    const json = JSON.stringify(graph(organizationLd(), websiteLd(), softwareLd("en"), softwareLd("ro")));
    for (const type of ["Organization", "WebSite", "SoftwareApplication"]) expect(json).toContain(`"@type":"${type}"`);
    expect(json).toContain('"price":"0"');
    expect(json).not.toMatch(/aggregateRating|"review"|ratingValue/i);
  });

  it("builds FAQ and breadcrumb data from real texts", () => {
    const faq = faqLd([{ q: "Q?", a: "A." }]) as { mainEntity: { name: string }[] };
    expect(faq.mainEntity[0].name).toBe("Q?");
    const crumbs = breadcrumbLd("ro", [{ name: "Acasă", path: "/" }, { name: "Securitate", path: "/security" }]) as {
      itemListElement: { position: number; item: string }[];
    };
    expect(crumbs.itemListElement.map((i) => i.item)).toEqual([`${SITE_URL}/ro`, `${SITE_URL}/ro/security`]);
  });

  it("has seven home page questions in both languages", () => {
    for (const d of [dictionaries.en, dictionaries.ro] as Record<string, string>[]) {
      for (let n = 0; n <= 6; n++) {
        expect(d[`land.q${n}`]?.trim(), `q${n}`).toBeTruthy();
        expect(d[`land.a${n}`]?.trim(), `a${n}`).toBeTruthy();
      }
    }
  });
});

describe("llms.txt", () => {
  it("is a short index that links every audience page and the full file", () => {
    const txt = llmsTxt();
    expect(txt.startsWith("# OCTOM One")).toBe(true);
    for (const p of PAGES) expect(txt).toContain(`${SITE_URL}/for/${p.slug}`);
    expect(txt).toContain(`${SITE_URL}/llms-full.txt`);
  });

  it("states the key facts and both FAQs", () => {
    const txt = llmsFullTxt();
    expect(txt).toMatch(/free during beta/i);
    expect(txt).toContain("AGPL-3.0");
    expect(txt).toContain("Frankfurt");
    expect(txt).toContain("What is OCTOM One?");
    expect(txt).toContain("Ce este OCTOM One?");
  });
});

describe("blog articles", () => {
  it("have unique slugs, sensible titles and descriptions, and real content", () => {
    expect(new Set(ARTICLES.map((a) => a.slug)).size).toBe(ARTICLES.length);
    expect(ARTICLES.length).toBeGreaterThanOrEqual(5);
    for (const a of ARTICLES) {
      expect(a.slug, a.slug).toMatch(/^[a-z0-9-]+$/);
      expect(a.title.length + " | OCTOM One".length, `${a.slug} title`).toBeLessThanOrEqual(75);
      expect(a.desc.length, `${a.slug} description`).toBeGreaterThanOrEqual(80);
      expect(a.desc.length, `${a.slug} description`).toBeLessThanOrEqual(190);
      expect(a.blocks.length, a.slug).toBeGreaterThanOrEqual(4);
      expect(a.faq.length, a.slug).toBeGreaterThanOrEqual(3);
      const text = JSON.stringify(a);
      expect(text, `${a.slug} placeholder text`).not.toMatch(/TODO|lorem|XXX/i);
    }
  });

  it("are in the sitemap and llms.txt, in Romanian only", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE_URL}/ro/blog`);
    const txt = llmsTxt();
    for (const a of ARTICLES) {
      expect(urls).toContain(`${SITE_URL}/ro/blog/${a.slug}`);
      expect(txt).toContain(`/ro/blog/${a.slug}`);
      expect(urls).not.toContain(`${SITE_URL}/blog/${a.slug}`);
    }
  });
});
