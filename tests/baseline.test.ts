import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const baseline = readFileSync("supabase/baseline.sql", "utf8");

describe("supabase/baseline.sql builds a new empty project", () => {
  it("defines every function its triggers call", () => {
    const used = [...baseline.matchAll(/execute function public\.(\w+)\(/gi)].map((m) => m[1]);
    expect(used.length).toBeGreaterThan(0);
    for (const name of new Set(used)) {
      expect(baseline, name).toMatch(new RegExp(`create or replace function public\\.${name}\\(`, "i"));
    }
  });
});
