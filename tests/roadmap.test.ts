import { describe, expect, it } from "vitest";
import { DISCUSSING, SHIPPED, type RoadmapItem } from "@/lib/roadmap";
import { SITE_PAGES } from "@/lib/site-pages";

const all: RoadmapItem[] = [...SHIPPED, ...DISCUSSING];
const BANNED = /\b(revolutionary|game-changer|supercharge|seamless|coming soon|curând|in curand|never|always|niciodată|mereu)\b|10x|100%/i;

describe("public roadmap", () => {
  it("has unique ids and texts in both languages", () => {
    expect(new Set(all.map((i) => i.id)).size).toBe(all.length);
    for (const i of all) {
      for (const lang of ["en", "ro"] as const) {
        expect(i[lang].title.trim(), `${i.id} ${lang} title`).toBeTruthy();
        expect(i[lang].text.trim().length, `${i.id} ${lang} text`).toBeGreaterThan(20);
      }
    }
  });

  it("keeps the brand voice: no exclamation marks, no hype, no absolute promises", () => {
    for (const i of all) {
      for (const lang of ["en", "ro"] as const) {
        const s = `${i[lang].title} ${i[lang].text}`;
        expect(s, `${i.id} ${lang}`).not.toContain("!");
        expect(s, `${i.id} ${lang}`).not.toMatch(BANNED);
      }
    }
  });

  it("dates every shipped item and gives the discussed ones no date", () => {
    for (const i of SHIPPED) expect(i.month, i.id).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    for (const i of DISCUSSING) expect("month" in i, i.id).toBe(false);
  });

  it("lists shipped items newest first", () => {
    const months = SHIPPED.map((i) => i.month);
    expect(months).toEqual([...months].sort().reverse());
  });

  it("is a normal, indexable public page in both languages", () => {
    expect(SITE_PAGES.roadmap.legal).toBe(false);
    expect(SITE_PAGES.roadmap.noindex).toBeUndefined();
  });
});
