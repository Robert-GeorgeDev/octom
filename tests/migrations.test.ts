import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { REQUIRED_MIGRATIONS } from "@/lib/migrations";

const dir = join(process.cwd(), "supabase", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

describe("database migrations", () => {
  it("names files YYYYMMDD_NN_name.sql", () => {
    for (const f of files) expect(f, f).toMatch(/^\d{8}_\d{2}_[a-z0-9-]+\.sql$/);
  });

  it("every file registers itself in app_migrations", () => {
    for (const f of files) {
      const sql = readFileSync(join(dir, f), "utf8");
      const name = f.replace(/^\d{8}_\d{2}_/, "").replace(/\.sql$/, "");
      expect(sql, f).toMatch(new RegExp(`'${name}'`));
      expect(sql, f).toMatch(/app_migrations/);
      expect(sql, f).toMatch(/on conflict \(name\) do nothing/i);
    }
  });

  it("every file's name is in REQUIRED_MIGRATIONS and the list has no unknown extras", () => {
    const fromFiles = files.map((f) => f.replace(/^\d{8}_\d{2}_/, "").replace(/\.sql$/, ""));
    for (const n of fromFiles) expect(REQUIRED_MIGRATIONS as readonly string[], n).toContain(n);
    // Older changes registered by the tracking file keep their original file names in supabase/.
    const legacy = REQUIRED_MIGRATIONS.filter((n) => !fromFiles.includes(n));
    for (const n of legacy) {
      expect(readFileSync(join(dir, files[0]), "utf8"), n).toContain(`'${n}'`);
    }
  });
});
