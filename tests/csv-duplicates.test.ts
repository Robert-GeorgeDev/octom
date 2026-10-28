import { describe, expect, it } from "vitest";
import { findDuplicates, type ImportRow } from "@/lib/csv";

const row = (n: number, email: string, phone = ""): ImportRow => ({
  row: n,
  contact: { first_name: "A", last_name: "B", company: "", email, phone, status: "New", notes: "", job_title: "", website: "", location: "", source: "", tags: [], deal_value: null, deal_currency: null },
  nextFollowup: null,
});

describe("findDuplicates", () => {
  it("flags rows that match an existing contact by email, ignoring case", () => {
    const d = findDuplicates([row(2, "Ana@Example.com"), row(3, "new@example.com")], [{ email: "ana@example.com" }]);
    expect(d.get(2)).toBe("existing");
    expect(d.has(3)).toBe(false);
  });

  it("matches phone numbers by digits only", () => {
    const d = findDuplicates([row(2, "", "0700 000 000")], [{ phone: "+0700-000-000" }]);
    expect(d.get(2)).toBe("existing");
  });

  it("flags the second copy inside the file but keeps the first", () => {
    const d = findDuplicates([row(2, "x@y.com"), row(3, "X@y.com")], []);
    expect(d.has(2)).toBe(false);
    expect(d.get(3)).toBe("file");
  });

  it("ignores short or empty phones and empty emails", () => {
    const d = findDuplicates([row(2, "", "123"), row(3, "", "123")], [{ phone: "123" }]);
    expect(d.size).toBe(0);
  });
});
