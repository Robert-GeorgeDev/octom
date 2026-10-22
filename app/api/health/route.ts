import { NextResponse } from "next/server";
import { APP_URL } from "@/lib/hosts";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import { schemaUpToDate } from "@/lib/schema-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public health check used by the status page. It reports only whether the
// website answers, whether the database service responds and whether the
// database changes are up to date (yes / no only); no details.
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
  // Only checked while the database answers; true / false / null (could not check).
  const schema = database ? await schemaUpToDate() : null;
  return NextResponse.json(
    { website: true, app, database, schema, checkedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
