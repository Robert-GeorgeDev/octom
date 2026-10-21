import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 8_000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// 5 messages per IP per hour, counted in the database so it holds across servers.
const MAX_HITS = 5;
const WINDOW_SECS = 60 * 60;

const CATEGORIES = ["bug", "suggestion", "billing", "account", "security", "other"] as const;
type Category = (typeof CATEGORIES)[number];

function fail(status: number, code: string) {
  return NextResponse.json({ error: code }, { status, headers: { "Cache-Control": "no-store" } });
}

function clean(value: unknown, max: number): string {
  return String(value ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > MAX_BODY) return fail(413, "too_large");

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return fail(400, "invalid");
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return fail(400, "invalid");
  }

  // Hidden field that real visitors never fill in. Pretend success to bots.
  if (clean(body.website, 200) !== "") {
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  }

  const name = clean(body.name, 100).replace(/\s+/g, " ");
  const email = clean(body.email, 200);
  const message = clean(body.message, 3_000);
  const category: Category = CATEGORIES.includes(body.category as Category)
    ? (body.category as Category)
    : "other";
  if (name.length < 1 || !EMAIL.test(email) || message.length < 10) {
    return fail(400, "invalid");
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (await isRateLimited("contact", ip, MAX_HITS, WINDOW_SECS)) return fail(429, "rate_limited");

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) {
    console.error(
      `contact: not configured (RESEND_API_KEY ${key ? "set" : "MISSING"}, CONTACT_TO_EMAIL ${to ? "set" : "MISSING"})`
    );
    return fail(503, "not_configured");
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "OCTOM One <onboarding@resend.dev>",
        to,
        reply_to: email,
        subject: `Octom [${category}]: ${name}`.replace(/[\r\n]/g, " ").slice(0, 150),
        // Plain text only, so nothing the visitor typed is ever treated as markup.
        text: `Category: ${category}\nFrom: ${name} <${email}>\n\n${message}\n`,
      }),
    });
    if (!res.ok) {
      // Log the provider's reason (for example an unverified sender domain). No secrets.
      const detail = await res.text().catch(() => "");
      console.error(`contact: Resend rejected the email (${res.status}): ${detail.slice(0, 300)}`);
      return fail(502, "send_failed");
    }
  } catch (error) {
    console.error("contact: could not reach Resend", error instanceof Error ? error.message : "");
    return fail(502, "send_failed");
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
