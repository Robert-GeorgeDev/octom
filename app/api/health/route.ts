import { NextResponse } from "next/server";
import { appUp, databaseUp } from "@/lib/health";
import { schemaUpToDate } from "@/lib/schema-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public health check used by the status page. It reports only whether the
// website answers, whether the database service responds and whether the
// database changes are up to date (yes / no only); no details.
export async function GET() {
  const [database, app] = await Promise.all([databaseUp(), appUp()]);
  // Only checked while the database answers; true / false / null (could not check).
  const schema = database ? await schemaUpToDate() : null;
  return NextResponse.json(
    { website: true, app, database, schema, checkedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
