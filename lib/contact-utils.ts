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

/** wa.me link from a phone number. Needs international digits; returns "" otherwise. */
export function whatsappHref(phone: string | null | undefined): string {
  const digits = (phone ?? "").replace(/[^\d]/g, "");
  if (digits.length < 8) return "";
  return `https://wa.me/${digits}`;
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
