import { NextResponse } from "next/server";
import { healthSnapshot } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public health check used by the status page. It reports only whether the
// website answers, whether the database service responds and whether the
// database changes are up to date (yes / no only); no details.
export async function GET() {
  const { database, app, schema } = await healthSnapshot();
  return NextResponse.json(
    { website: true, app, database, schema, checkedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
