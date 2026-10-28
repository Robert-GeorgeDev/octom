/**
 * The weekly review: a calm look at where things stand. Pure rules, no data access.
 * Open work is "mine": assigned to me or to nobody (same as the Today page).
 */
import { addDays } from "@/lib/dates";
import { totalsByCurrency } from "@/lib/deal";
import { daysBetween } from "@/lib/priority";

export type ReviewFollowUp = {
  id: string;
  contact_id: string;
  contact_name: string;
  company: string;
  due_date: string; // YYYY-MM-DD
  status: string;
  assigned_to: string | null;
};

export type ReviewContact = {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
  status: string;
  updated_at: string;
  deal_value?: number | string | null;
  deal_currency?: string | null;
};

export type NoNextStep = { contact: ReviewContact; quietDays: number | null };

export type Review = {
  doneCount: number;
  overdue: ReviewFollowUp[];
  upcoming: ReviewFollowUp[];
  noNextStep: NoNextStep[];
  value: { currency: "RON" | "EUR" | "USD"; total: number }[];
  valueCount: number;
};

export const UPCOMING_DAYS = 7;
const CLOSED = new Set(["Won", "Lost"]);

export function isClosed(status: string): boolean {
  return CLOSED.has(status);
}

export function buildReview(input: {
  openFollowUps: ReviewFollowUp[];
  doneCount: number;
  contacts: ReviewContact[];
  today: string;
  nowMs: number;
  userId: string | null;
}): Review {
  const { openFollowUps, doneCount, contacts, today, nowMs, userId } = input;
  const open = openFollowUps.filter((f) => f.status === "open");
  const mine = open.filter((f) => f.assigned_to === null || f.assigned_to === userId);
  const byDue = (a: ReviewFollowUp, b: ReviewFollowUp) =>
    a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : a.contact_name.localeCompare(b.contact_name);

  const overdue = mine.filter((f) => f.due_date < today).sort(byDue);
  const last = addDays(today, UPCOMING_DAYS);
  const upcoming = mine.filter((f) => f.due_date > today && f.due_date <= last).sort(byDue);

  // Any open follow-up in the workspace counts as a next step, whoever it is assigned to.
  const planned = new Set(open.map((f) => f.contact_id));
  const noNextStep: NoNextStep[] = contacts
    .filter((c) => !isClosed(c.status) && !planned.has(c.id))
    .map((contact) => {
      const days = Math.floor((nowMs - new Date(contact.updated_at).getTime()) / 86_400_000);
      return { contact, quietDays: Number.isFinite(days) && days >= 0 ? days : null };
    })
    .sort((a, b) => (b.quietDays ?? -1) - (a.quietDays ?? -1) || a.contact.first_name.localeCompare(b.contact.first_name));

  const inPlay = contacts.filter((c) => !isClosed(c.status));
  const value = totalsByCurrency(inPlay);
  const valueCount = inPlay.filter((c) => totalsByCurrency([c]).length > 0).length;

  return { doneCount, overdue, upcoming, noNextStep, value, valueCount };
}

/** Whole days an open follow-up is late, for display. */
export function lateDays(due: string, today: string): number {
  return Math.max(0, daysBetween(due, today));
}
