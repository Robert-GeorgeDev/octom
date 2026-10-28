/**
 * "Who should I write to today?" Ranks open follow-ups that are due now or late.
 * The score is the sum of a few visible signals, and every signal that counted comes
 * back as a reason, so the person can always see why someone is on top.
 */
import type { Priority } from "@/types/followup";

export type ReasonKey =
  | "overdue"
  | "today"
  | "high"
  | "proposal"
  | "negotiation"
  | "qualified"
  | "fresh"
  | "quiet"
  | "closed";

export type Reason = { key: ReasonKey; n?: number };

export type RankInput = {
  due_date: string; // YYYY-MM-DD
  priority: Priority;
  contactStatus: string;
  /** Whole days since the contact last changed, or null when unknown. */
  quietDays: number | null;
};

export const QUIET_AFTER_DAYS = 14;

/** Whole days from a to b (both YYYY-MM-DD, local calendar days). */
export function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split("-").map(Number);
  const [y2, m2, d2] = b.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

export function scoreFollowUp(input: RankInput, today: string): { score: number; reasons: Reason[] } {
  const parts: { points: number; reason: Reason }[] = [];
  const late = daysBetween(input.due_date, today);

  if (late > 0) parts.push({ points: 40 + Math.min(late, 14) * 2, reason: { key: "overdue", n: late } });
  else if (late === 0) parts.push({ points: 30, reason: { key: "today" } });

  if (input.priority === "High") parts.push({ points: 15, reason: { key: "high" } });

  if (input.contactStatus === "Proposal Sent") parts.push({ points: 20, reason: { key: "proposal" } });
  else if (input.contactStatus === "Negotiation") parts.push({ points: 20, reason: { key: "negotiation" } });
  else if (input.contactStatus === "Qualified") parts.push({ points: 8, reason: { key: "qualified" } });
  else if (input.contactStatus === "New") parts.push({ points: 4, reason: { key: "fresh" } });
  else if (input.contactStatus === "Won" || input.contactStatus === "Lost") parts.push({ points: -25, reason: { key: "closed" } });

  if (input.quietDays !== null && input.quietDays >= QUIET_AFTER_DAYS) {
    parts.push({
      points: Math.min(Math.floor(input.quietDays / 7), 4) * 3,
      reason: { key: "quiet", n: input.quietDays },
    });
  }

  const score = parts.reduce((s, p) => s + p.points, 0);
  const reasons = parts
    .slice()
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points))
    .map((p) => p.reason);
  return { score, reasons };
}

export type Rankable = RankInput & { id: string; contact_name: string; due_time: string };

/** Due today or late, best first. Ties: earlier date, earlier time, then name. */
export function rankToday<T extends Rankable>(items: T[], today: string): (T & { score: number; reasons: Reason[] })[] {
  return items
    .filter((i) => i.due_date <= today)
    .map((i) => ({ ...i, ...scoreFollowUp(i, today) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        (a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0) ||
        (a.due_time || "99:99").localeCompare(b.due_time || "99:99") ||
        a.contact_name.localeCompare(b.contact_name)
    );
}

/** "1 day", "3 days" / "1 zi", "3 zile", "20 de zile". */
export function daysLabel(n: number, lang: "en" | "ro"): string {
  if (lang === "en") return `${n} ${n === 1 ? "day" : "days"}`;
  if (n === 1) return "1 zi";
  const m = n % 100;
  return m >= 1 && m <= 19 ? `${n} zile` : `${n} de zile`;
}
