import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { APP_HOST, redirectTarget } from "@/lib/hosts";
import { dictionaries } from "@/lib/dictionaries";

const pub = (f: string) => join(process.cwd(), "public", f);

describe("web app manifest", () => {
  const m = manifest();

  it("opens on a page that lives in the app, and so do its shortcuts", () => {
    const urls = [m.start_url!, ...(m.shortcuts ?? []).map((s) => s.url)];
    expect(urls.length).toBeGreaterThanOrEqual(3);
    for (const u of urls) expect(redirectTarget(APP_HOST, u), u).toBeNull();
  });

  it("keeps a stable id and has every icon file", () => {
    expect(m.id).toBe("/dashboard");
    for (const i of m.icons ?? []) {
      if (i.src.endsWith(".png")) expect(existsSync(pub(i.src.slice(1))), i.src).toBe(true);
    }
    expect((m.icons ?? []).some((i) => i.purpose === "maskable")).toBe(true);
  });
});

describe("service worker", () => {
  const sw = readFileSync(pub("sw.js"), "utf8");

  it("has an offline page", () => {
    expect(existsSync(pub("offline.html"))).toBe(true);
    expect(sw).toContain("/offline.html");
  });

  it("only stores fixed app files, never pages or API answers", () => {
    expect(sw).toContain('"/_next/static/"');
    expect(sw).not.toMatch(/\/api/);
    // the only cache.put is inside the /_next/static/ branch
    expect(sw.match(/cache\.put/g)?.length).toBe(1);
    expect(sw.indexOf("cache.put")).toBeGreaterThan(sw.indexOf('"/_next/static/"'));
    expect(sw).toContain('request.method !== "GET"');
  });
});

describe("install hint texts", () => {
  it("exist in both languages", () => {
    for (const d of [dictionaries.en, dictionaries.ro] as Record<string, string>[]) {
      expect(d["install.ios"]?.trim()).toBeTruthy();
      expect(d["install.gotit"]?.trim()).toBeTruthy();
    }
  });
});
