import { NextResponse } from "next/server";
import { APP_URL } from "@/lib/hosts";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public health check used by the status page. It reports only whether the
// website answers and whether the database service responds; no details.
async function databaseUp(): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: SUPABASE_KEY },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function appUp(): Promise<boolean> {
  try {
    const res = await fetch(`${APP_URL}/login`, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
      redirect: "manual",
    });
    return res.status < 500;
  } catch {
    return false;
  }
}

export async function GET() {
  const [database, app] = await Promise.all([databaseUp(), appUp()]);
  return NextResponse.json(
    { website: true, app, database, checkedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
