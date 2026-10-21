import { describe, expect, it } from "vitest";
import { cleanRoute, scrub } from "@/lib/error-log";

describe("error log scrubbing", () => {
  it("removes emails, tokens, ids, numbers and query strings", () => {
    const out = scrub(
      "fail for ana@example.com tel +40 722 123 456 id 3f2b8c1e-aaaa-bbbb-cccc-1234567890ab url https://x.eu/a?token=abc key sk_live_abcdefgh12345 Bearer abc.def.ghi"
    );
    expect(out).not.toMatch(/ana@example\.com/);
    expect(out).not.toMatch(/722/);
    expect(out).not.toMatch(/3f2b8c1e/);
    expect(out).not.toMatch(/token=abc/);
    expect(out).not.toMatch(/sk_live/);
    expect(out).not.toMatch(/abc\.def\.ghi/);
  });

  it("keeps only the path of a route", () => {
    expect(cleanRoute("POST /api/contacts/3f2b8c1e-aaaa-bbbb-cccc-1234567890ab?x=1")).toBe(
      "POST /api/contacts/[id]"
    );
  });

  it("limits the length", () => {
    expect(scrub("x".repeat(5000)).length).toBe(500);
  });
});
