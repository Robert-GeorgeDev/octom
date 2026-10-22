import { NextResponse } from "next/server";
import { healthSnapshot } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Endpoint for uptime monitors (UptimeRobot etc.). Unlike /api/health, which
// always answers 200 for the status page, this answers 503 when the app or the
// database is down, so a monitor can alert on the status code alone.
// It also reads one row from the database, which counts as activity and keeps
// a free-tier Supabase project from being paused for inactivity.
export async function GET() {
  const { database, app } = await healthSnapshot();
  const ok = database && app;
  return NextResponse.json(
    { ok, app, database },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}

// Some monitors check with HEAD.
export async function HEAD() {
  const { database, app } = await healthSnapshot();
  return new NextResponse(null, { status: database && app ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
