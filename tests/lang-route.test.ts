import { describe, expect, it } from "vitest";
import { homeRedirect } from "@/lib/lang-route";
import { redirectTarget } from "@/lib/hosts";

describe("homeRedirect", () => {
  it("only touches the home page", () => {
    expect(homeRedirect("/privacy", "ro", "ro")).toBeNull();
    expect(homeRedirect("/ro", undefined, "ro")).toBeNull();
  });

  it("a saved choice wins over the browser language", () => {
    expect(homeRedirect("/", "en", "ro-RO,ro;q=0.9")).toBeNull();
    expect(homeRedirect("/", "ro", "en-US")).toBe("/ro");
  });

  it("uses the browser's first language when nothing is saved", () => {
    expect(homeRedirect("/", undefined, "ro-RO,ro;q=0.9,en;q=0.8")).toBe("/ro");
    expect(homeRedirect("/", undefined, "ro")).toBe("/ro");
    expect(homeRedirect("/", undefined, "en-US,en;q=0.9,ro;q=0.5")).toBeNull();
  });

  it("sends search engines (no language, or an odd cookie) to the English page", () => {
    expect(homeRedirect("/", undefined, null)).toBeNull();
    expect(homeRedirect("/", "xx", "")).toBeNull();
  });
});

describe("/ro belongs to the public site", () => {
  it("is served on octom.eu and moved off the app address", () => {
    expect(redirectTarget("octom.eu", "/ro")).toBeNull();
    expect(redirectTarget("one.octom.eu", "/ro")).toBe("https://octom.eu/ro");
  });
});
