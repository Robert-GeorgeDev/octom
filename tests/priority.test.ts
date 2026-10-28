import { describe, expect, it } from "vitest";
import { dictionaries } from "@/lib/dictionaries";
import { daysBetween, daysLabel, rankToday, scoreFollowUp, type ReasonKey } from "@/lib/priority";

const TODAY = "2026-10-28";
const base = { due_date: TODAY, priority: "Normal" as const, contactStatus: "Contacted", quietDays: null };

describe("daysBetween", () => {
  it("counts calendar days, also over month ends and DST", () => {
    expect(daysBetween("2026-10-25", "2026-10-28")).toBe(3);
    expect(daysBetween("2026-10-28", "2026-10-28")).toBe(0);
    expect(daysBetween("2026-10-30", "2026-11-02")).toBe(3);
    expect(daysBetween("2026-03-28", "2026-03-30")).toBe(2);
  });
});

describe("scoreFollowUp", () => {
  it("puts late above today, and longer-late above shorter-late", () => {
    const today = scoreFollowUp(base, TODAY).score;
    const late1 = scoreFollowUp({ ...base, due_date: "2026-10-27" }, TODAY).score;
    const late5 = scoreFollowUp({ ...base, due_date: "2026-10-23" }, TODAY).score;
    expect(late1).toBeGreaterThan(today);
    expect(late5).toBeGreaterThan(late1);
  });

  it("caps the lateness bonus so very old items do not drown everything else", () => {
    const a = scoreFollowUp({ ...base, due_date: "2026-09-28" }, TODAY).score;
    const b = scoreFollowUp({ ...base, due_date: "2026-08-01" }, TODAY).score;
    expect(a).toBe(b);
  });

  it("adds points for proposal, negotiation, high priority and quiet contacts, each with a reason", () => {
    const r = scoreFollowUp({ ...base, contactStatus: "Proposal Sent", priority: "High", quietDays: 30 }, TODAY);
    const keys = r.reasons.map((x) => x.key);
    expect(keys).toEqual(expect.arrayContaining<ReasonKey>(["today", "high", "proposal", "quiet"]));
    expect(r.score).toBeGreaterThan(scoreFollowUp(base, TODAY).score);
    expect(r.reasons.find((x) => x.key === "quiet")?.n).toBe(30);
  });

  it("does not count quiet before two weeks", () => {
    expect(scoreFollowUp({ ...base, quietDays: 13 }, TODAY).reasons.some((x) => x.key === "quiet")).toBe(false);
    expect(scoreFollowUp({ ...base, quietDays: 14 }, TODAY).reasons.some((x) => x.key === "quiet")).toBe(true);
  });

  it("lowers closed contacts but still explains why", () => {
    const won = scoreFollowUp({ ...base, contactStatus: "Won" }, TODAY);
    expect(won.score).toBeLessThan(scoreFollowUp(base, TODAY).score);
    expect(won.reasons.some((x) => x.key === "closed")).toBe(true);
  });

  it("lists the strongest reason first", () => {
    const r = scoreFollowUp({ ...base, due_date: "2026-10-20", priority: "High" }, TODAY);
    expect(r.reasons[0].key).toBe("overdue");
  });
});

describe("rankToday", () => {
  const item = (id: string, over: Partial<typeof base> & { due_time?: string; name?: string } = {}) => ({
    ...base,
    id,
    contact_name: over.name ?? id,
    due_time: over.due_time ?? "",
    ...over,
  });

  it("drops follow-ups that are not due yet", () => {
    const out = rankToday([item("a"), item("b", { due_date: "2026-10-29" })], TODAY);
    expect(out.map((x) => x.id)).toEqual(["a"]);
  });

  it("orders by score, then date, then time, then name, in a stable way", () => {
    const out = rankToday(
      [
        item("z", { due_time: "15:00" }),
        item("b", { due_time: "09:00" }),
        item("a", { due_time: "09:00" }),
        item("top", { contactStatus: "Negotiation" }),
      ],
      TODAY
    );
    expect(out.map((x) => x.id)).toEqual(["top", "a", "b", "z"]);
  });

  it("returns an empty list for an empty input", () => {
    expect(rankToday([], TODAY)).toEqual([]);
  });
});

describe("daysLabel", () => {
  it("handles English singular and plural", () => {
    expect(daysLabel(1, "en")).toBe("1 day");
    expect(daysLabel(3, "en")).toBe("3 days");
  });
  it("handles Romanian forms", () => {
    expect(daysLabel(1, "ro")).toBe("1 zi");
    expect(daysLabel(2, "ro")).toBe("2 zile");
    expect(daysLabel(19, "ro")).toBe("19 zile");
    expect(daysLabel(20, "ro")).toBe("20 de zile");
    expect(daysLabel(35, "ro")).toBe("35 de zile");
  });
});

describe("today dictionary", () => {
  it("has a reason text for every reason key in both languages", () => {
    const keys: ReasonKey[] = ["overdue", "today", "high", "proposal", "negotiation", "qualified", "fresh", "quiet", "closed"];
    for (const lang of ["en", "ro"] as const) {
      const d = dictionaries[lang] as Record<string, string>;
      for (const k of keys) expect(d[`today.r.${k}`]).toBeTruthy();
    }
  });
});
