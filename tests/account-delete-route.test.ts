import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  user: { id: "u1" } as { id: string } | null,
  memberships: [{ organization_id: "o1", user_id: "u1" }] as { organization_id: string; user_id: string }[],
  rpc: vi.fn(),
}));

function builder(result: unknown) {
  const b: Record<string, unknown> = {};
  for (const m of ["select", "eq", "in", "not"]) b[m] = () => b;
  b.then = (resolve: (v: unknown) => unknown) => resolve(result);
  return b;
}

vi.mock("@/lib/supabase-admin", () => ({
  adminClient: () => ({
    rpc: state.rpc,
    auth: { getUser: async () => ({ data: { user: state.user } }) },
    from: () => builder({ data: state.memberships }),
  }),
}));

import { POST } from "@/app/api/account/delete/route";

function request(token?: string) {
  return new Request("http://localhost/api/account/delete", {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

describe("account delete route", () => {
  beforeEach(() => {
    state.user = { id: "u1" };
    state.memberships = [{ organization_id: "o1", user_id: "u1" }];
    state.rpc.mockReset().mockResolvedValue({ error: null });
  });

  it("rejects requests without a valid token", async () => {
    expect((await POST(request())).status).toBe(403);
    state.user = null;
    expect((await POST(request("bad"))).status).toBe(403);
    expect(state.rpc).not.toHaveBeenCalled();
  });

  it("deletes using the verified user's id, nothing else", async () => {
    const res = await POST(request("t"));
    expect(res.status).toBe(200);
    expect(state.rpc).toHaveBeenCalledWith("delete_account_for", { target: "u1" });
  });

  it("refuses when the workspace has other members", async () => {
    state.memberships.push({ organization_id: "o1", user_id: "u2" });
    const res = await POST(request("t"));
    expect(res.status).toBe(409);
    expect(state.rpc).not.toHaveBeenCalled();
  });

  it("maps a database refusal to 409", async () => {
    state.rpc.mockResolvedValue({ error: { message: "members_exist" } });
    expect((await POST(request("t"))).status).toBe(409);
  });
});
