import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { llmsTxt } from "@/lib/llms";
import { localizeHref } from "@/components/loc-link";
import { SITE_URL } from "@/lib/site";
import { COST_LIMITS, TOOL_SLUGS, TOOLS, forgottenCost, parseAmount } from "@/lib/tools";

describe("parseAmount", () => {
  it("reads numbers the way people type them", () => {
    expect(parseAmount("1500")).toBe(1500);
    expect(parseAmount(" 1 500 ")).toBe(1500);
    expect(parseAmount("1.500,50")).toBe(1500.5);
    expect(parseAmount("1,500.25")).toBe(1500.25);
    expect(parseAmount("1,5")).toBe(1.5);
    expect(parseAmount("0.5")).toBe(0.5);
    expect(parseAmount(".5")).toBe(0.5);
    expect(parseAmount("10.")).toBe(10);
    expect(parseAmount("1,000,000")).toBe(1_000_000);
    expect(parseAmount("1.000.000")).toBe(1_000_000);
  });

  it("treats a lone group of three digits as thousands", () => {
    expect(parseAmount("2.500")).toBe(2500);
    expect(parseAmount("2,500")).toBe(2500);
  });

  it("rejects anything else", () => {
    for (const bad of ["", "   ", "abc", "-5", "1e5", "1.2.3", "1,2,3", "1.5,3.2", "12abc", "€100", "--", ".", ","]) {
      expect(parseAmount(bad), JSON.stringify(bad)).toBeNull();
    }
  });
});

describe("forgottenCost", () => {
  it("multiplies the three numbers and nothing else", () => {
    const r = forgottenCost({ value: 1500, quietPerMonth: 4, sharePercent: 10 });
    expect(r).not.toBeNull();
    expect(r!.perMonth).toBeCloseTo(600);
    expect(r!.perYear).toBeCloseTo(7200);
    expect(r!.clientsPerYear).toBeCloseTo(4.8);
  });

  it("needs all three, and sensible ranges", () => {
    expect(forgottenCost({ value: null, quietPerMonth: 4, sharePercent: 10 })).toBeNull();
    expect(forgottenCost({ value: 1500, quietPerMonth: null, sharePercent: 10 })).toBeNull();
    expect(forgottenCost({ value: 1500, quietPerMonth: 4, sharePercent: null })).toBeNull();
    expect(forgottenCost({ value: 0, quietPerMonth: 4, sharePercent: 10 })).toBeNull();
    expect(forgottenCost({ value: 1500, quietPerMonth: 0, sharePercent: 10 })).toBeNull();
    expect(forgottenCost({ value: 1500, quietPerMonth: 4, sharePercent: 0 })).toBeNull();
    expect(forgottenCost({ value: 1500, quietPerMonth: 4, sharePercent: 101 })).toBeNull();
    expect(forgottenCost({ value: COST_LIMITS.value + 1, quietPerMonth: 4, sharePercent: 10 })).toBeNull();
    expect(forgottenCost({ value: 1500, quietPerMonth: COST_LIMITS.quietPerMonth + 1, sharePercent: 10 })).toBeNull();
  });

  it("accepts 100 percent and the limits themselves", () => {
    expect(forgottenCost({ value: COST_LIMITS.value, quietPerMonth: COST_LIMITS.quietPerMonth, sharePercent: 100 })).not.toBeNull();
  });
});

describe("tool pages", () => {
  it("have copy in both languages with three questions, titles and descriptions of a sensible length", () => {
    for (const slug of TOOL_SLUGS) {
      for (const lang of ["en", "ro"] as const) {
        const c = TOOLS[slug][lang];
        expect(c.title.length + " | OCTOM One".length, `${slug} ${lang} title`).toBeLessThanOrEqual(65);
        expect(c.desc.length, `${slug} ${lang} desc`).toBeGreaterThanOrEqual(50);
        expect(c.desc.length, `${slug} ${lang} desc`).toBeLessThanOrEqual(170);
        expect(c.faq.length).toBe(3);
      }
    }
  });

  it("keeps the brand voice and invents no statistics", () => {
    const banned = /revolution|game-changer|supercharge|seamless|\b10x\b|\b100%|\bAI magic\b|never miss|nu mai pierzi/i;
    for (const slug of TOOL_SLUGS) {
      for (const lang of ["en", "ro"] as const) {
        const text = JSON.stringify(TOOLS[slug][lang]);
        expect(text, `${slug} ${lang}`).not.toContain("!");
        expect(text, `${slug} ${lang}`).not.toMatch(banned);
        expect(text, `${slug} ${lang}`).not.toMatch(/\d+\s?%/);
      }
    }
  });

  it("are in the sitemap in both languages and in llms.txt", () => {
    const urls = sitemap().map((e) => e.url);
    const txt = llmsTxt();
    for (const s of TOOL_SLUGS) {
      expect(urls).toContain(`${SITE_URL}/tools/${s}`);
      expect(urls).toContain(`${SITE_URL}/ro/tools/${s}`);
      expect(txt).toContain(`${SITE_URL}/tools/${s}`);
    }
  });
});

describe("localizeHref", () => {
  it("sends Romanian readers to the Romanian tool, roadmap and audience pages", () => {
    expect(localizeHref("/tools/forgotten-client-cost", "ro")).toBe("/ro/tools/forgotten-client-cost");
    expect(localizeHref("/roadmap", "ro")).toBe("/ro/roadmap");
    expect(localizeHref("/for/designers", "ro")).toBe("/ro/for/designers");
    expect(localizeHref("/tools/forgotten-client-cost", "en")).toBe("/tools/forgotten-client-cost");
  });
  it("leaves app and unknown links alone", () => {
    expect(localizeHref("/signup", "ro")).toBe("/signup");
    expect(localizeHref("/login?next=/today", "ro")).toBe("/login?next=/today");
  });
});
