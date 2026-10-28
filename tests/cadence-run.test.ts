import { beforeEach, describe, expect, it, vi } from "vitest";
import { addDays, todayISO } from "@/lib/dates";
import type { FollowUp } from "@/types/followup";

type Res = { data: unknown; error: unknown };
const h = vi.hoisted(() => ({
  script: {} as Record<string, Res>,
  calls: [] as { table: string; op: string; args: unknown[] }[],
}));

vi.mock("@/lib/supabase", () => {
  function builder(table: string) {
    let first = "";
    const b: Record<string, unknown> = {};
    const note = (op: string) => (...args: unknown[]) => {
      if (!first) first = op;
      h.calls.push({ table, op, args });
      return b;
    };
    for (const op of ["update", "insert", "delete", "select", "eq", "limit"]) b[op] = note(op);
    const result = () => Promise.resolve(h.script[`${table}:${first}`] ?? { data: null, error: null });
    b.maybeSingle = () => result();
    b.then = (res: (v: Res) => unknown, rej: (e: unknown) => unknown) => result().then(res, rej);
    return b;
  }
  return { supabase: { from: (t: string) => builder(t) } };
});

import { completeFollowUp, undoCompleteFollowUp } from "@/lib/cadence-run";

const item: FollowUp = {
  id: "f1",
  organization_id: "o1",
  contact_id: "c1",
  contact_name: "Ana",
  company: "",
  due_date: "2026-10-28",
  due_time: "",
  priority: "High",
  note: "",
  status: "open",
  assigned_to: null,
  cadence: "offer",
  cadence_step: 1,
};

const ok = (data: unknown): Res => ({ data, error: null });
const inserts = () => h.calls.filter((c) => c.op === "insert");

beforeEach(() => {
  h.calls.length = 0;
  h.script = {
    "follow_ups:update": ok([{ id: "f1" }]),
    "contacts:select": ok({ status: "Proposal Sent" }),
    "follow_ups:select": ok([]),
    "follow_ups:insert": ok({ id: "n1" }),
    "follow_ups:delete": ok(null),
  };
});

describe("completeFollowUp", () => {
  it("schedules the next step from today, keeping priority and cadence", async () => {
    const out = await completeFollowUp(item);
    expect(out).toEqual({ result: "done-next-scheduled", nextId: "n1", nextGapDays: 4 });
    const row = inserts()[0].args[0] as Record<string, unknown>;
    expect(row).toMatchObject({
      organization_id: "o1",
      contact_id: "c1",
      cadence: "offer",
      cadence_step: 2,
      priority: "High",
      due_date: addDays(todayISO(), 4),
    });
    expect("assigned_to" in row).toBe(false);
  });

  it("keeps the assignee when there is one", async () => {
    await completeFollowUp({ ...item, assigned_to: "u9" });
    expect((inserts()[0].args[0] as Record<string, unknown>).assigned_to).toBe("u9");
  });

  it("does nothing more for a plain follow-up", async () => {
    const out = await completeFollowUp({ ...item, cadence: null, cadence_step: null });
    expect(out.result).toBe("done");
    expect(inserts()).toHaveLength(0);
  });

  it("does nothing more when it was already done (double click, second device)", async () => {
    h.script["follow_ups:update"] = ok([]);
    const out = await completeFollowUp(item);
    expect(out.result).toBe("already-done");
    expect(h.calls.every((c) => c.table === "follow_ups")).toBe(true);
    expect(inserts()).toHaveLength(0);
  });

  it("stops after the last step", async () => {
    const out = await completeFollowUp({ ...item, cadence_step: 3 });
    expect(out.result).toBe("done");
    expect(inserts()).toHaveLength(0);
  });

  it("ignores an unknown cadence id", async () => {
    const out = await completeFollowUp({ ...item, cadence: "made-up" });
    expect(out.result).toBe("done");
    expect(inserts()).toHaveLength(0);
  });

  it("does not schedule for a Won or Lost contact", async () => {
    for (const status of ["Won", "Lost"]) {
      h.calls.length = 0;
      h.script["contacts:select"] = ok({ status });
      expect((await completeFollowUp(item)).result).toBe("done");
      expect(inserts()).toHaveLength(0);
    }
  });

  it("does not schedule when the contact is gone", async () => {
    h.script["contacts:select"] = ok(null);
    expect((await completeFollowUp(item)).result).toBe("done");
    expect(inserts()).toHaveLength(0);
  });

  it("does not add a second open step of the same cadence", async () => {
    h.script["follow_ups:select"] = ok([{ id: "other" }]);
    expect((await completeFollowUp(item)).result).toBe("done");
    expect(inserts()).toHaveLength(0);
  });

  it("reports when the next step could not be saved", async () => {
    h.script["follow_ups:insert"] = { data: null, error: { message: "boom" } };
    expect((await completeFollowUp(item)).result).toBe("done-next-failed");
  });

  it("reports when the contact could not be read", async () => {
    h.script["contacts:select"] = { data: null, error: { message: "boom" } };
    const out = await completeFollowUp(item);
    expect(out.result).toBe("done-next-failed");
    expect(inserts()).toHaveLength(0);
  });

  it("throws when marking as done fails, so the card can show an error", async () => {
    h.script["follow_ups:update"] = { data: null, error: { message: "boom" } };
    await expect(completeFollowUp(item)).rejects.toBeTruthy();
  });
});

describe("undoCompleteFollowUp", () => {
  it("reopens the follow-up and removes the step that was scheduled", async () => {
    expect(await undoCompleteFollowUp(item, "n1")).toBe(true);
    const del = h.calls.filter((c) => c.op === "delete");
    expect(del).toHaveLength(1);
    expect(h.calls.some((c) => c.op === "eq" && c.args[0] === "id" && c.args[1] === "n1")).toBe(true);
    expect(h.calls.some((c) => c.op === "eq" && c.args[0] === "status" && c.args[1] === "open")).toBe(true);
  });

  it("only reopens when there was no next step", async () => {
    expect(await undoCompleteFollowUp(item)).toBe(true);
    expect(h.calls.filter((c) => c.op === "delete")).toHaveLength(0);
  });

  it("deletes nothing when the reopen did not happen", async () => {
    h.script["follow_ups:update"] = ok([]);
    expect(await undoCompleteFollowUp(item, "n1")).toBe(true);
    expect(h.calls.filter((c) => c.op === "delete")).toHaveLength(0);
  });

  it("returns false and deletes nothing when reopening fails", async () => {
    h.script["follow_ups:update"] = { data: null, error: { message: "boom" } };
    expect(await undoCompleteFollowUp(item, "n1")).toBe(false);
    expect(h.calls.filter((c) => c.op === "delete")).toHaveLength(0);
  });
});
