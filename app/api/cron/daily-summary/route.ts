import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase-config";
import { APP_URL } from "@/lib/hosts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PAGE = 100;        // users per round, and emails per Resend batch request
const CONCURRENCY = 10;  // users prepared at the same time
const BUDGET_MS = 40_000; // stop starting new rounds after this long

/** Today's date (YYYY-MM-DD) in the user's time zone; Bucharest if unknown or invalid. */
function dayIn(tz?: string | null): string {
  try {
    return new Date().toLocaleDateString("en-CA", { timeZone: tz || "Europe/Bucharest" });
  } catch {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" });
  }
}

type C = { first_name: string; last_name: string; company: string };
type Row = { due_date: string; due_time: string | null; note: string; contacts: C | C[] | null };

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function nameOf(r: Row) {
  const c = Array.isArray(r.contacts) ? r.contacts[0] : r.contacts;
  if (!c) return "Contact";
  return `${c.first_name} ${c.last_name}`.trim() + (c.company ? ` (${c.company})` : "");
}

function baseUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  return APP_URL;
}

function build(rows: Row[], today: string, base: string, token: string) {
  const overdue = rows.filter((r) => r.due_date < today);
  const due = rows.filter((r) => r.due_date === today);
  const unsub = `${base}/api/unsubscribe?token=${token}`;
  const li = (r: Row) =>
    `<li style="margin:0 0 8px"><strong>${esc(nameOf(r))}</strong>${r.note ? ` &mdash; ${esc(r.note)}` : ""}</li>`;
  const block = (title: string, items: Row[]) =>
    items.length ? `<h2 style="font-size:16px;margin:20px 0 8px">${title}</h2><ul style="padding-left:18px;margin:0">${items.map(li).join("")}</ul>` : "";
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0F172A">
<p style="margin:0 0 20px;font-size:24px;font-weight:700;letter-spacing:-0.5px;color:#111827">octom <span style="color:#4F46E5">One</span></p>
<h1 style="font-size:20px">Who to contact today</h1>
${block("Overdue", overdue)}${block("Due today", due)}
<p style="margin:24px 0"><a href="${base}/dashboard" style="background:#4F46E5;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none">Open OCTOM One</a></p>
<p style="font-size:12px;color:#64748B">You get this because you turned on the daily summary. <a href="${unsub}">Unsubscribe</a></p></div>`;
  const line = (r: Row) => `- ${nameOf(r)}${r.note ? `: ${r.note}` : ""}`;
  const text = [
    "Who to contact today",
    overdue.length ? `\nOverdue:\n${overdue.map(line).join("\n")}` : "",
    due.length ? `\nDue today:\n${due.map(line).join("\n")}` : "",
    `\nOpen OCTOM One: ${base}/dashboard`,
    `Unsubscribe: ${unsub}`,
  ].join("\n");
  return { subject: `Your follow-ups for today (${rows.length})`, html, text, unsub };
}

function sameSecret(given: string | null, secret: string): boolean {
  const a = Buffer.from(given ?? "");
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !sameSecret(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const base = baseUrl();
  if (!serviceKey || !resendKey || !base) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const url = new URL(request.url);
  const dry = url.searchParams.get("dry") === "1";
  // Continue a previous run that ran out of time: ?after=<last user_id>
  let cursor = url.searchParams.get("after");
  const from = process.env.EMAIL_FROM ?? "OCTOM One <onboarding@resend.dev>";
  const admin = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } });
  const started = Date.now();

  type Pref = { user_id: string; unsubscribe_token: string; timezone?: string | null };
  type Mail = { to: string; subject: string; html: string; text: string; unsub: string };

  async function loadPage(): Promise<{ rows: Pref[]; error: boolean }> {
    const q = (cols: string) => {
      let b = admin.from("email_preferences").select(cols).eq("daily_summary", true).order("user_id").limit(PAGE);
      if (cursor) b = b.gt("user_id", cursor);
      return b;
    };
    const first = await q("user_id, unsubscribe_token, timezone");
    if (!first.error) return { rows: (first.data ?? []) as unknown as Pref[], error: false };
    // The timezone column comes from supabase/launch-readiness.sql. Until that
    // has been run, fall back to the old behaviour instead of sending nothing.
    const second = await q("user_id, unsubscribe_token");
    if (second.error) return { rows: [], error: true };
    return { rows: (second.data ?? []) as unknown as Pref[], error: false };
  }

  async function prepare(p: Pref): Promise<Mail | null> {
    const today = dayIn(p.timezone);
    const { data: member } = await admin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", p.user_id)
      .limit(1)
      .maybeSingle();
    if (!member) return null;

    const { data: items } = await admin
      .from("follow_ups")
      .select("due_date, due_time, note, contacts!follow_ups_contact_fk(first_name, last_name, company)")
      .eq("organization_id", member.organization_id)
      .eq("status", "open")
      .lte("due_date", today)
      .or(`assigned_to.eq.${p.user_id},assigned_to.is.null`)
      .order("due_date")
      .limit(50);
    const rows = (items ?? []) as unknown as Row[];
    if (rows.length === 0) return null;

    const { data: u } = await admin.auth.admin.getUserById(p.user_id);
    const to = u?.user?.email;
    if (!to) return null;
    return { to, ...build(rows, today, base, p.unsubscribe_token) };
  }

  let sent = 0, skipped = 0, failed = 0, pages = 0;
  let done = false;

  while (true) {
    const { rows: prefs, error } = await loadPage();
    if (error) return NextResponse.json({ error: "prefs_failed" }, { status: 500 });
    if (prefs.length === 0) { done = true; break; }
    pages++;

    // Gather this page's emails a few users at a time.
    const mails: Mail[] = [];
    for (let i = 0; i < prefs.length; i += CONCURRENCY) {
      const part = await Promise.all(
        prefs.slice(i, i + CONCURRENCY).map((p) => prepare(p).catch(() => null))
      );
      for (const m of part) { if (m) mails.push(m); else skipped++; }
    }

    if (mails.length > 0) {
      if (dry) {
        sent += mails.length;
      } else {
        // One request for up to 100 emails (Resend batch API).
        const res = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify(
            mails.map((m) => ({
              from,
              to: m.to,
              subject: m.subject,
              html: m.html,
              text: m.text,
              headers: {
                "List-Unsubscribe": `<${m.unsub}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
            }))
          ),
        }).catch(() => null);
        if (res?.ok) sent += mails.length; else failed += mails.length;
        // Stay under Resend's request rate limit.
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    cursor = prefs[prefs.length - 1].user_id;
    if (prefs.length < PAGE) { done = true; break; }
    if (Date.now() - started > BUDGET_MS) break;
  }

  if (done && !dry) {
    // Housekeeping: keep the error log for 30 days.
    await admin
      .from("error_events")
      .delete()
      .lt("created_at", new Date(Date.now() - 30 * 86_400_000).toISOString());
  }

  return NextResponse.json({
    dry,
    [dry ? "would_send" : "sent"]: sent,
    skipped,
    failed,
    pages,
    done,
    // Not done: call this URL again with ?after=<next> to carry on.
    ...(done ? {} : { next: cursor }),
  });
}
