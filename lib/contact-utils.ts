/** Small helpers shared by the contact list, panel and page. */

export function fullName(c: { first_name: string; last_name: string }): string {
  return `${c.first_name} ${c.last_name}`.trim();
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

const GRADIENTS = [
  "from-[#6366F1] to-[#3B82F6]",
  "from-[#8B5CF6] to-[#6366F1]",
  "from-[#0EA5E9] to-[#6366F1]",
  "from-[#14B8A6] to-[#3B82F6]",
  "from-[#F59E0B] to-[#F97316]",
  "from-[#10B981] to-[#0EA5E9]",
];

/** A stable colour per contact so the same person always looks the same. */
export function avatarGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

/** Adds https:// when the user typed a bare domain. Returns "" if it is not usable. */
export function websiteHref(raw: string | null | undefined): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withScheme);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
}

export function websiteLabel(raw: string | null | undefined): string {
  return (raw ?? "").trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

/**
 * Digits for a wa.me link. A leading + or 00 is international already; a single
 * leading 0 is a national number and is treated as Romanian (+40). Returns ""
 * when the number is too short to be usable.
 */
export function whatsappDigits(phone: string | null | undefined): string {
  const v = (phone ?? "").trim().replace(/\(0\)/g, "");
  const plus = v.startsWith("+");
  let digits = v.replace(/[^\d]/g, "");
  if (!plus) {
    if (digits.startsWith("00")) digits = digits.slice(2);
    else if (digits.startsWith("0")) digits = "40" + digits.slice(1);
  }
  return digits.length >= 8 && digits.length <= 15 ? digits : "";
}

/** wa.me link, optionally with the message already typed in. Returns "" if the number is unusable. */
export function whatsappHref(phone: string | null | undefined, text?: string): string {
  const digits = whatsappDigits(phone);
  if (!digits) return "";
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function relativeTime(iso: string, locale: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const mins = Math.round(diffMs / 60000);
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  return rtf.format(Math.round(months / 12), "year");
}

export const CONTACT_KINDS = ["note", "call", "email", "meeting"] as const;
export type ContactKind = (typeof CONTACT_KINDS)[number];

/** Activities of type 'contacted' store "kind|text". Notes may store plain text. */
export function parseLogged(description: string): { kind: string; text: string } {
  const i = description.indexOf("|");
  if (i === -1) return { kind: description, text: "" };
  return { kind: description.slice(0, i), text: description.slice(i + 1) };
}

export type AttentionContact = {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
  status: string;
  updated_at: string;
};

/** Days without any change after which an open contact is worth a nudge. */
export const STALE_DAYS = 21;

/**
 * Open contacts (not Won or Lost) that have no open follow-up and have not been
 * touched for a while, longest quiet first. These are the ones that slip through.
 */
export function needsAttention(
  contacts: AttentionContact[],
  contactIdsWithOpenFollowUp: Set<string>,
  now: Date = new Date(),
  limit = 5
): (AttentionContact & { days: number })[] {
  const out: (AttentionContact & { days: number })[] = [];
  for (const c of contacts) {
    if (c.status === "Won" || c.status === "Lost") continue;
    if (contactIdsWithOpenFollowUp.has(c.id)) continue;
    const days = Math.floor((now.getTime() - new Date(c.updated_at).getTime()) / 86_400_000);
    if (Number.isFinite(days) && days >= STALE_DAYS) out.push({ ...c, days });
  }
  return out.sort((a, b) => b.days - a.days).slice(0, limit);
}
