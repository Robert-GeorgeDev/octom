import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Deletes the signed-in user's account and, through the database function, every
// workspace that has no other members.
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    const admin = adminClient();
    const { data } = await admin.auth.getUser(token);
    const user = data.user;
    if (!user) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    // Same rule as the database function: every workspace the user belongs to
    // must have no other members, otherwise nothing is deleted.
    const { data: mine } = await admin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id);
    const orgIds = (mine ?? []).map((r) => r.organization_id as string);

    if (orgIds.length > 0) {
      const { data: members } = await admin
        .from("organization_members")
        .select("organization_id, user_id")
        .in("organization_id", orgIds);
      if ((members ?? []).some((m) => m.user_id !== user.id)) {
        return NextResponse.json({ error: "members_exist" }, { status: 409 });
      }
    }

    // The database function can only be run with the service key, never by a
    // signed-in user directly. The id comes from the verified token, never from
    // the request.
    const { error } = await admin.rpc("delete_account_for", { target: user.id });
    if (error) {
      return NextResponse.json(
        { error: String(error.message).includes("members_exist") ? "members_exist" : "server_error" },
        { status: String(error.message).includes("members_exist") ? 409 : 500 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
