import Papa from "papaparse";
import { STATUSES, type Status } from "@/types/contact";

export const CSV_COLUMNS = [
  "first_name",
  "last_name",
  "company",
  "email",
  "phone",
  "status",
  "notes",
  "next_followup",
  "job_title",
  "website",
  "location",
  "source",
  "tags",
] as const;

export const MAX_ROWS = 500;
export const MAX_FILE_BYTES = 1_000_000;

const LIMITS: Record<string, number> = {
  first_name: 80,
  last_name: 80,
  company: 120,
  email: 200,
  phone: 40,
  notes: 5000,
  job_title: 120,
  website: 200,
  location: 200,
  source: 120,
};

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 40;

// Other names a column may have (Google Contacts, LinkedIn, Excel, Romanian).
// Compared after lowercasing and replacing punctuation with single spaces.
const ALIASES: Record<string, string[]> = {
  first_name: ["first name", "firstname", "given name", "prenume", "first"],
  last_name: ["last name", "lastname", "surname", "family name", "nume de familie", "nume familie"],
  full_name: ["name", "full name", "nume", "nume complet", "contact", "contact name"],
  company: ["company", "company name", "organization", "organization name", "organization 1 name", "companie", "firma", "firmă"],
  email: ["email", "e mail", "email address", "e mail address", "e mail 1 value", "email 1", "adresa email", "adresă email", "adresa de email"],
  phone: ["phone", "phone number", "mobile", "mobile phone", "phone 1 value", "telefon", "mobil", "tel"],
  status: ["status", "stage", "etapa", "etapă"],
  notes: ["notes", "note", "notite", "notițe", "comments", "comentarii", "observatii", "observații"],
  next_followup: ["next followup", "next follow up", "follow up", "follow up date", "urmatorul follow up", "următorul follow up", "data follow up"],
  job_title: ["job title", "title", "position", "organization title", "organization 1 title", "functie", "funcție", "pozitie", "poziție"],
  website: ["website", "web site", "url", "web", "site", "pagina web", "pagină web"],
  location: ["location", "city", "oras", "oraș", "locatie", "locație", "address", "adresa", "adresă", "country", "tara", "țara"],
  source: ["source", "sursa", "sursă"],
  tags: ["tags", "tag", "labels", "label", "etichete", "eticheta", "etichetă", "group membership"],
};

const ALIAS_TO_FIELD = new Map<string, string>();
for (const [field, names] of Object.entries(ALIASES)) {
  for (const n of names) ALIAS_TO_FIELD.set(n, field);
}
for (const f of CSV_COLUMNS) ALIAS_TO_FIELD.set(f.replace(/_/g, " "), f);

function canonicalHeader(raw: string): string | null {
  const key = raw
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/[^a-z0-9ăâîșțşţ]+/g, " ")
    .trim();
  return ALIAS_TO_FIELD.get(key) ?? null;
}

/** "Ana Maria Popescu" becomes first "Ana Maria", last "Popescu". */
function splitName(full: string): { first: string; last: string } {
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: parts[0] ?? "", last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

/** Accepts 2026-10-15, 15.10.2026 and 15/10/2026. Returns "" when it is none of them. */
function normalizeDate(value: string): string {
  if (isRealDate(value)) return value;
  const m = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(value);
  if (!m) return "";
  const iso = `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return isRealDate(iso) ? iso : "";
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ImportContact = {
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  phone: string;
  status: Status;
  notes: string;
  job_title: string;
  website: string;
  location: string;
  source: string;
  tags: string[];
};

export type ImportRow = {
  row: number;
  contact: ImportContact;
  nextFollowup: string | null;
};

export type RowIssue = { row: number; code: string; field?: string };

export type ParseResult =
  | { ok: false; error: "empty" | "noFirstName" | "tooMany" | "read" }
  | { ok: true; rows: ImportRow[]; issues: RowIssue[]; badRows: number };

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

export function parseContactsCsv(text: string): ParseResult {
  if (text.trim() === "") return { ok: false, error: "empty" };

  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    // Unknown columns keep a name nobody reads; a second column for the same
    // field (for example "E-mail 2") is ignored, the first one wins.
    transformHeader: (() => {
      const seen = new Set<string>();
      return (h: string) => {
        const field = canonicalHeader(h);
        if (!field || seen.has(field)) return `_ignored_${seen.size}_${h}`;
        seen.add(field);
        return field;
      };
    })(),
  });

  const fields = result.meta.fields ?? [];
  if (!fields.includes("first_name") && !fields.includes("full_name")) {
    return { ok: false, error: "noFirstName" };
  }

  const data = result.data;
  if (data.length === 0) return { ok: false, error: "empty" };
  if (data.length > MAX_ROWS) return { ok: false, error: "tooMany" };

  const rows: ImportRow[] = [];
  const issues: RowIssue[] = [];
  let badRows = 0;

  data.forEach((raw, index) => {
    const row = index + 2; // row 1 is the header
    const get = (key: string) => String(raw[key] ?? "").trim();
    const rowIssues: RowIssue[] = [];

    let firstName = get("first_name");
    let lastName = get("last_name");
    // A single "name" column is split when there is no first-name column.
    if (!fields.includes("first_name") && get("full_name")) {
      ({ first: firstName, last: lastName } = splitName(get("full_name")));
    } else if (!fields.includes("last_name") && get("full_name")) {
      // "Prenume" + "Nume": the plain name column is the surname.
      lastName = get("full_name");
    }
    if (!firstName) rowIssues.push({ row, code: "first_name_required" });

    for (const field of Object.keys(LIMITS)) {
      const value = field === "last_name" ? lastName : field === "first_name" ? firstName : get(field);
      if (value.length > LIMITS[field]) {
        rowIssues.push({ row, code: "too_long", field });
      }
    }

    const tags: string[] = [];
    for (const piece of get("tags").split(/[;|,]/)) {
      const tag = piece.trim();
      if (tag && !tags.some((x) => x.toLowerCase() === tag.toLowerCase())) tags.push(tag);
    }
    if (tags.length > MAX_TAGS || tags.some((x) => x.length > MAX_TAG_LENGTH)) {
      rowIssues.push({ row, code: "too_long", field: "tags" });
    }

    const email = get("email");
    if (email && !EMAIL.test(email)) {
      rowIssues.push({ row, code: "email_invalid" });
    }

    let status: Status = "New";
    const statusRaw = get("status");
    if (statusRaw) {
      const found = STATUSES.find(
        (s) => s.toLowerCase() === statusRaw.toLowerCase()
      );
      if (found) status = found;
      else rowIssues.push({ row, code: "status_invalid" });
    }

    let nextFollowup: string | null = null;
    const dateRaw = get("next_followup");
    if (dateRaw) {
      const iso = normalizeDate(dateRaw);
      if (iso) nextFollowup = iso;
      else rowIssues.push({ row, code: "date_invalid" });
    }

    if (rowIssues.length > 0) {
      issues.push(...rowIssues);
      badRows += 1;
      return;
    }

    rows.push({
      row,
      contact: {
        first_name: firstName,
        last_name: lastName,
        company: get("company"),
        email,
        phone: get("phone"),
        status,
        notes: get("notes"),
        job_title: get("job_title"),
        website: get("website"),
        location: get("location"),
        source: get("source"),
        tags,
      },
      nextFollowup,
    });
  });

  return { ok: true, rows, issues, badRows };
}

// Protects against "CSV injection": cells that a spreadsheet could run as a
// formula get a leading apostrophe. Phone-like values such as "+40 700 000 000"
// are left untouched.
function escapeCell(value: string): string {
  let v = value;
  const looksLikeNumber = /^[+-]?[\d\s().-]+$/.test(v);
  if (/^[=@\t\r]/.test(v) || (/^[+-]/.test(v) && !looksLikeNumber)) {
    v = "'" + v;
  }
  if (/[",\n\r]/.test(v)) {
    v = '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

export function buildCsv(rows: string[][]): string {
  const lines = [
    CSV_COLUMNS.join(","),
    ...rows.map((r) => r.map(escapeCell).join(",")),
  ];
  return lines.join("\r\n") + "\r\n";
}

// Builds a CSV with custom headers (used for the extra exports).
export function buildTable(headers: string[], rows: string[][]): string {
  const lines = [headers.join(","), ...rows.map((r) => r.map(escapeCell).join(","))];
  return lines.join("\r\n") + "\r\n";
}

export function downloadCsv(filename: string, content: string) {
  // The BOM makes Excel read accents (ă, â, î, ș, ț) correctly.
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export type DuplicateKind = "existing" | "file";

const digits = (v: string) => v.replace(/\D/g, "");

/**
 * Flags import rows that look like contacts you already have ("existing") or
 * like an earlier row of the same file ("file"). Match on email (any case) or on
 * the phone number's digits (at least 7). Returns row number -> kind.
 */
export function findDuplicates(
  rows: ImportRow[],
  existing: { email?: string | null; phone?: string | null }[]
): Map<number, DuplicateKind> {
  const emails = new Set<string>();
  const phones = new Set<string>();
  for (const c of existing) {
    const e = (c.email ?? "").trim().toLowerCase();
    if (e) emails.add(e);
    const p = digits(c.phone ?? "");
    if (p.length >= 7) phones.add(p);
  }
  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();
  const out = new Map<number, DuplicateKind>();
  for (const r of rows) {
    const e = r.contact.email.trim().toLowerCase();
    const p = digits(r.contact.phone);
    const pOk = p.length >= 7;
    if ((e && emails.has(e)) || (pOk && phones.has(p))) out.set(r.row, "existing");
    else if ((e && seenEmails.has(e)) || (pOk && seenPhones.has(p))) out.set(r.row, "file");
    if (e) seenEmails.add(e);
    if (pOk) seenPhones.add(p);
  }
  return out;
}
