import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase-config";
import { isRateLimited } from "@/lib/rate-limit";

// Our own small error log, written to public.error_events (supabase/launch-readiness.sql).
// Nothing personal is stored: messages and stack traces are scrubbed of email
// addresses, tokens, long numbers and URL query strings, and no user id, contact,
// note or request body is ever recorded.

const MAX_MESSAGE = 500;
const MAX_STACK = 2_000;

export function scrub(input: unknown, max = MAX_MESSAGE): string {
  return String(input ?? "")
    // JWT-like tokens and API keys
    .replace(/eyJ[\w-]{8,}\.[\w-]{8,}\.[\w-]{4,}/g, "[token]")
    .replace(/\b(sk|pk|rk|whsec|re|sb)_[A-Za-z0-9_]{8,}/g, "[key]")
    .replace(/Bearer\s+[\w.~+/=-]+/gi, "Bearer [token]")
    // email addresses
    .replace(/[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}/g, "[email]")
    // URL query strings and fragments
    .replace(/(https?:\/\/[^\s?#"')]+)[?#][^\s"')]*/g, "$1")
    // uuids and long digit runs (phone numbers, ids)
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "[id]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[number]")
    .slice(0, max);
}

/** Path only: no query string, ids replaced. */
export function cleanRoute(path: unknown): string {
  return scrub(String(path ?? "").split(/[?#]/)[0], 200);
}

export type ErrorReport = {
  source: "server" | "client";
  route?: string;
  message: string;
  digest?: string;
  stack?: string;
};

/** Never throws: reporting an error must not cause another one. */
export async function recordError(report: ErrorReport): Promise<void> {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return;
    // Global flood guard: at most 120 stored errors per minute.
    if (await isRateLimited("errlog", report.source, 120, 60)) return;

    const row = {
      source: report.source,
      route: report.route ? cleanRoute(report.route) : null,
      message: scrub(report.message) || "(no message)",
      digest: report.digest ? scrub(report.digest, 64) : null,
      stack: report.stack ? scrub(report.stack, MAX_STACK) : null,
    };
    const db = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } });
    await db.from("error_events").insert(row);

    // Optional email alert: at most 3 per hour, only if Resend and an owner address exist.
    const key = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;
    if (key && to && !(await isRateLimited("errmail", "all", 3, 3600))) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "OCTOM One <onboarding@resend.dev>",
          to,
          subject: `Octom error (${row.source}): ${row.message}`.replace(/[\r\n]/g, " ").slice(0, 150),
          text: `Route: ${row.route ?? "-"}\nDigest: ${row.digest ?? "-"}\n\n${row.message}\n\n${row.stack ?? ""}\n\nAll errors: Supabase > Table Editor > error_events`,
        }),
      }).catch(() => undefined);
    }
  } catch {
    /* ignore */
  }
}
