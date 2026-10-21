import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { recordError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 4_000;

// Browsers report crashes here. Public on purpose (a crashed page may have no
// session), so it is small, rate limited, and stores only scrubbed text.
export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > MAX_BODY) return NextResponse.json({ ok: true });

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (await isRateLimited("report-error", ip, 10, 60)) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = JSON.parse(raw) as Record<string, unknown>;
    await recordError({
      source: "client",
      route: String(body.route ?? ""),
      message: String(body.message ?? ""),
      digest: body.digest ? String(body.digest) : undefined,
    });
  } catch {
    /* ignore malformed reports */
  }
  return NextResponse.json({ ok: true });
}
