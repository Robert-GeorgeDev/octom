import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/schema-check", () => ({ schemaUpToDate: vi.fn(async () => true) }));

describe("healthSnapshot", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.resetModules();
  });

  it("answers repeated calls from one check for 30 seconds", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { healthSnapshot } = await import("@/lib/health");

    const first = await healthSnapshot();
    for (let i = 0; i < 20; i++) await healthSnapshot();
    expect(first).toEqual({ app: true, database: true, schema: true });
    // One database check and one app check, not 21 of each.
    expect(fetchMock).toHaveBeenCalledTimes(2);

    vi.setSystemTime(Date.now() + 31_000);
    await healthSnapshot();
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
