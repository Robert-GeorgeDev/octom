import { describe, expect, it } from "vitest";
import { dictionaries } from "@/lib/dictionaries";
import { redirectTarget } from "@/lib/hosts";
import { buildReview, lateDays, type ReviewContact, type ReviewFollowUp } from "@/lib/weekly";

const TODAY = "2026-10-28";
const NOW = new Date("2026-10-28T09:00:00Z").getTime();
const ME = "user-me";

const fu = (id: string, contact: string, due: string, extra: Partial<ReviewFollowUp> = {}): ReviewFollowUp => ({
  id, contact_id: contact, contact_name: contact.toUpperCase(), company: "", due_date: due, status: "open", assigned_to: null, ...extra,
});
const ct = (id: string, status = "Contacted", updated = "2026-10-27T09:00:00Z", extra: Partial<ReviewContact> = {}): ReviewContact => ({
  id, first_name: id, last_name: "", company: "", status, updated_at: updated, ...extra,
});

const run = (openFollowUps: ReviewFollowUp[], contacts: ReviewContact[], doneCount = 0) =>
  buildReview({ openFollowUps, doneCount, contacts, today: TODAY, nowMs: NOW, userId: ME });

describe("weekly review", () => {
  it("splits overdue from coming up, oldest first, and leaves today to the Today page", () => {
    const r = run(
      [fu("1", "a", "2026-10-27"), fu("2", "b", "2026-10-20"), fu("3", "c", TODAY), fu("4", "d", "2026-11-04"), fu("5", "e", "2026-11-05"), fu("6", "f", "2026-10-30")],
      []
    );
    expect(r.overdue.map((f) => f.id)).toEqual(["2", "1"]);
    expect(r.upcoming.map((f) => f.id)).toEqual(["6", "4"]);
  });

  it("only counts my follow-ups, or unassigned ones", () => {
    const r = run([fu("1", "a", "2026-10-20", { assigned_to: "someone-else" }), fu("2", "b", "2026-10-20", { assigned_to: ME })], []);
    expect(r.overdue.map((f) => f.id)).toEqual(["2"]);
  });

  it("ignores done follow-ups", () => {
    expect(run([fu("1", "a", "2026-10-20", { status: "done" })], []).overdue).toEqual([]);
  });

  it("lists open contacts without any open follow-up, quietest first", () => {
    const r = run(
      [fu("1", "has", "2026-11-01"), fu("2", "other", "2026-11-01", { assigned_to: "someone-else" })],
      [
        ct("has"),
        ct("other"),
        ct("fresh", "New", "2026-10-27T09:00:00Z"),
        ct("old", "Qualified", "2026-09-01T09:00:00Z"),
        ct("won", "Won", "2026-01-01T09:00:00Z"),
        ct("lost", "Lost"),
      ]
    );
    expect(r.noNextStep.map((x) => x.contact.id)).toEqual(["old", "fresh"]);
    expect(r.noNextStep[0].quietDays).toBe(57);
    expect(r.noNextStep[1].quietDays).toBe(1);
  });

  it("does not trust a bad or future timestamp", () => {
    const r = run([], [ct("a", "New", "not a date"), ct("b", "New", "2027-01-01T00:00:00Z")]);
    expect(r.noNextStep.map((x) => x.quietDays)).toEqual([null, null]);
  });

  it("adds estimated value per currency for contacts still in play", () => {
    const r = run([], [
      ct("a", "Proposal Sent", undefined, { deal_value: 1000, deal_currency: "EUR" }),
      ct("b", "Negotiation", undefined, { deal_value: "500.5", deal_currency: "EUR" }),
      ct("c", "New", undefined, { deal_value: 2000, deal_currency: "RON" }),
      ct("d", "Won", undefined, { deal_value: 9999, deal_currency: "EUR" }),
      ct("e", "Lost", undefined, { deal_value: 9999, deal_currency: "USD" }),
      ct("f"),
    ]);
    expect(r.value).toEqual([{ currency: "RON", total: 2000 }, { currency: "EUR", total: 1500.5 }]);
    expect(r.valueCount).toBe(3);
  });

  it("passes the finished count through", () => {
    expect(run([], [], 7).doneCount).toBe(7);
  });

  it("counts late days without going negative", () => {
    expect(lateDays("2026-10-20", TODAY)).toBe(8);
    expect(lateDays("2026-11-01", TODAY)).toBe(0);
  });
});

describe("weekly review page", () => {
  it("has text in both languages", () => {
    for (const key of ["review.link", "review.title", "review.subtitle", "review.nonext.none", "review.value.none"] as const) {
      expect(dictionaries.en[key], key).toBeTruthy();
      expect(dictionaries.ro[key], key).toBeTruthy();
    }
    expect(JSON.stringify(dictionaries.en)).not.toMatch(/review\.[a-z.]+": "[^"]*!/);
  });

  it("is an app page: the public site sends /review to the app address", () => {
    expect(redirectTarget("octom.eu", "/review")).toBe("https://one.octom.eu/review");
    expect(redirectTarget("one.octom.eu", "/review")).toBeNull();
  });
});
