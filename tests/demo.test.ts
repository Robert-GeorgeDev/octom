import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { localizeHref } from "@/components/loc-link";
import { totalSteps } from "@/lib/cadences";
import { DEMO_COPY, completeDemo, demoItems, snoozeDemo } from "@/lib/demo";
import { addDays } from "@/lib/dates";
import { rankToday } from "@/lib/priority";
import { TEMPLATE_IDS } from "@/lib/templates";
import { SITE_URL } from "@/lib/site";

const TODAY = "2026-10-28";
const rank = (items: ReturnType<typeof demoItems>) => rankToday(items.map((i) => ({ ...i, contact_name: i.name })), TODAY);

describe("demo data", () => {
  it("has unique ids and real templates", () => {
    const items = demoItems(TODAY);
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
    for (const i of items) expect(TEMPLATE_IDS).toContain(i.template);
  });

  it("is dated relative to today and leaves one follow-up for later", () => {
    const items = demoItems(TODAY);
    expect(items.filter((i) => i.due_date > TODAY)).toHaveLength(1);
    expect(items.some((i) => i.due_date < TODAY)).toBe(true);
    expect(items.some((i) => i.due_date === TODAY)).toBe(true);
  });

  it("uses the real ranking: late proposal first, closed contact last", () => {
    expect(rank(demoItems(TODAY)).map((i) => i.contact)).toEqual(["maria", "andrei", "elena", "radu", "tudor"]);
  });

  it("explains each position with at least one reason", () => {
    for (const r of rank(demoItems(TODAY))) expect(r.reasons.length, r.id).toBeGreaterThan(0);
  });

  it("only uses cadence steps that exist", () => {
    for (const i of demoItems(TODAY)) {
      if (i.cadence) {
        expect(i.step, i.id).toBeGreaterThanOrEqual(1);
        expect(i.step!, i.id).toBeLessThanOrEqual(totalSteps(i.cadence));
      }
    }
  });
});

describe("demo actions", () => {
  it("finishing a cadence step schedules the next one from today", () => {
    const out = completeDemo(demoItems(TODAY), "maria:2", TODAY)!;
    expect(out.items).toHaveLength(6);
    expect(out.next).toMatchObject({ id: "maria:3", step: 3, due_date: addDays(TODAY, 7) });
    expect(out.gapDays).toBe(7);
    expect(out.items.some((i) => i.id === "maria:2")).toBe(false);
  });

  it("finishing the last step, or a plain follow-up, just removes it", () => {
    const afterStep3 = completeDemo(completeDemo(demoItems(TODAY), "maria:2", TODAY)!.items, "maria:3", TODAY)!;
    expect(afterStep3.next).toBeUndefined();
    expect(afterStep3.items.some((i) => i.contact === "maria")).toBe(false);
    const plain = completeDemo(demoItems(TODAY), "andrei:0", TODAY)!;
    expect(plain.items).toHaveLength(5);
    expect(plain.next).toBeUndefined();
  });

  it("ignores an unknown id and does not change the original list", () => {
    const items = demoItems(TODAY);
    const copy = JSON.stringify(items);
    expect(completeDemo(items, "nobody:0", TODAY)).toBeNull();
    completeDemo(items, "maria:2", TODAY);
    snoozeDemo(items, "andrei:0", TODAY);
    expect(JSON.stringify(items)).toBe(copy);
  });

  it("snoozing moves a follow-up to tomorrow, off today's list", () => {
    const out = snoozeDemo(demoItems(TODAY), "andrei:0", TODAY);
    expect(out.find((i) => i.id === "andrei:0")!.due_date).toBe(addDays(TODAY, 1));
    expect(rank(out).some((i) => i.contact === "andrei")).toBe(false);
  });
});

describe("demo page", () => {
  it("has copy in both languages, within the length rules, and the right voice", () => {
    for (const lang of ["en", "ro"] as const) {
      const c = DEMO_COPY[lang];
      expect(c.title.length + " | OCTOM One".length).toBeLessThanOrEqual(65);
      expect(c.desc.length).toBeGreaterThanOrEqual(50);
      expect(c.desc.length).toBeLessThanOrEqual(170);
      expect(c.faq).toHaveLength(3);
      expect(JSON.stringify(c)).not.toContain("!");
      expect(JSON.stringify(c)).not.toMatch(/revolution|game-changer|supercharge|seamless|\b10x\b|\b100%/i);
    }
  });

  it("is in the sitemap in both languages and localizes for Romanian readers", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE_URL}/demo`);
    expect(urls).toContain(`${SITE_URL}/ro/demo`);
    expect(localizeHref("/demo", "ro")).toBe("/ro/demo");
  });
});
