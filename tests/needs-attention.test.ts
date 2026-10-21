import { describe, expect, it } from "vitest";
import { needsAttention } from "@/lib/contact-utils";

const now = new Date("2026-10-21T10:00:00Z");
const c = (id: string, status: string, daysAgo: number) => ({
  id, first_name: id, last_name: "", company: "", status,
  updated_at: new Date(now.getTime() - daysAgo * 86_400_000).toISOString(),
});

describe("needsAttention", () => {
  it("picks quiet open contacts without a follow-up, longest quiet first", () => {
    const out = needsAttention(
      [c("a", "New", 30), c("b", "Contacted", 60), c("c", "New", 5), c("d", "Won", 90), c("e", "Lost", 90), c("f", "New", 40)],
      new Set(["f"]),
      now
    );
    expect(out.map((x) => x.id)).toEqual(["b", "a"]);
    expect(out[0].days).toBe(60);
  });

  it("respects the limit", () => {
    const many = Array.from({ length: 9 }, (_, i) => c("x" + i, "New", 30 + i));
    expect(needsAttention(many, new Set(), now, 3)).toHaveLength(3);
  });
});
