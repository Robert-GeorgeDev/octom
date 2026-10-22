import { describe, expect, it } from "vitest";
import { buildCsv, parseContactsCsv } from "@/lib/csv";

const HEADER =
  "first_name,last_name,company,email,phone,status,notes,next_followup,job_title,website,location,source,tags";

describe("parseContactsCsv", () => {
  it("parses a valid file", () => {
    const res = parseContactsCsv(
      `${HEADER}\nMaria,Ionescu,Bright Agency,maria@example.com,+40 700 000 000,Contacted,Call,2026-10-15`
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows).toHaveLength(1);
    expect(res.badRows).toBe(0);
    expect(res.rows[0].contact.first_name).toBe("Maria");
    expect(res.rows[0].contact.status).toBe("Contacted");
    expect(res.rows[0].nextFollowup).toBe("2026-10-15");
  });

  it("accepts semicolons (Excel in Romanian) and a BOM", () => {
    const res = parseContactsCsv("\uFEFFfirst_name;last_name\nAna;Pop");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows[0].contact.first_name).toBe("Ana");
    expect(res.rows[0].contact.last_name).toBe("Pop");
  });

  it("defaults the status to New and ignores the case of statuses", () => {
    const res = parseContactsCsv(
      `${HEADER}\nAna,,,,,,,\nBob,,,,,proposal sent,,`
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows[0].contact.status).toBe("New");
    expect(res.rows[1].contact.status).toBe("Proposal Sent");
  });

  it("skips rows with problems and says why", () => {
    const res = parseContactsCsv(
      [
        HEADER,
        "Ok,One,,one@example.com,,New,,2026-10-15",
        ",NoName,,,,,,",
        "Bad,Email,,not-an-email,,,,",
        "Bad,Status,,,,Hot,,",
        "Bad,Date,,,,,,2026-02-30",
      ].join("\n")
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows).toHaveLength(1);
    expect(res.badRows).toBe(4);
    const codes = res.issues.map((i) => i.code);
    expect(codes).toContain("first_name_required");
    expect(codes).toContain("email_invalid");
    expect(codes).toContain("status_invalid");
    expect(codes).toContain("date_invalid");
    expect(res.issues.find((i) => i.code === "first_name_required")?.row).toBe(3);
  });

  it("flags values that are too long", () => {
    const res = parseContactsCsv(`${HEADER}\n${"A".repeat(81)},,,,,,,`);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.badRows).toBe(1);
    expect(res.issues[0].code).toBe("too_long");
    expect(res.issues[0].field).toBe("first_name");
  });

  it("rejects files without a first name or name column", () => {
    expect(parseContactsCsv("email,company\na@b.co,Acme")).toEqual({
      ok: false,
      error: "noFirstName",
    });
  });

  it("splits a single name column", () => {
    const res = parseContactsCsv("Name,Email\nAna Maria Popescu,a@b.co\nMadonna,");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows[0].contact.first_name).toBe("Ana Maria");
    expect(res.rows[0].contact.last_name).toBe("Popescu");
    expect(res.rows[1].contact.first_name).toBe("Madonna");
    expect(res.rows[1].contact.last_name).toBe("");
  });

  it("reads Romanian headers, with Nume as the surname next to Prenume", () => {
    const res = parseContactsCsv("Prenume;Nume;Firmă;Telefon;Notițe;Funcție;Oraș;Etichete\nIon;Vasile;Acme;0700 000 000;Sună;Director;Iași;client; vip");
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const c = res.rows[0].contact;
    expect([c.first_name, c.last_name, c.company, c.phone, c.notes, c.job_title, c.location]).toEqual([
      "Ion", "Vasile", "Acme", "0700 000 000", "Sună", "Director", "Iași",
    ]);
  });

  it("reads Google Contacts style headers and ignores a second email column", () => {
    const res = parseContactsCsv(
      'First Name,Last Name,E-mail 1 - Value,E-mail 2 - Value,Phone 1 - Value,Organization Name,Organization Title,Website\nAna,Pop,first@example.com,second@example.com,+40 700,Acme,CEO,acme.example'
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const c = res.rows[0].contact;
    expect(c.email).toBe("first@example.com");
    expect(c.company).toBe("Acme");
    expect(c.job_title).toBe("CEO");
    expect(c.website).toBe("acme.example");
  });

  it("reads the extra fields and splits tags", () => {
    const res = parseContactsCsv(
      `${HEADER}\nAna,,,,,,,,CEO,acme.example,Cluj,LinkedIn,"client; vip, client"`
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const c = res.rows[0].contact;
    expect([c.job_title, c.website, c.location, c.source]).toEqual(["CEO", "acme.example", "Cluj", "LinkedIn"]);
    expect(c.tags).toEqual(["client", "vip"]);
  });

  it("flags more than 10 tags and long extra fields", () => {
    const many = Array.from({ length: 11 }, (_, i) => `t${i}`).join(";");
    const res = parseContactsCsv(`${HEADER}\nAna,,,,,,,,,,,,${many}\nBo,,,,,,,,${"x".repeat(121)},,,,`);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.badRows).toBe(2);
    expect(res.issues.map((i) => i.field)).toEqual(["tags", "job_title"]);
  });

  it("accepts dates written DD.MM.YYYY and DD/MM/YYYY", () => {
    const res = parseContactsCsv(`${HEADER}\nA,,,,,,,15.10.2026,,,,,\nB,,,,,,,5/1/2027,,,,,\nC,,,,,,,31.02.2026,,,,,`);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows.map((r) => r.nextFollowup)).toEqual(["2026-10-15", "2027-01-05"]);
    expect(res.issues[0].code).toBe("date_invalid");
  });

  it("rejects empty files", () => {
    expect(parseContactsCsv("")).toEqual({ ok: false, error: "empty" });
    expect(parseContactsCsv("first_name,last_name")).toEqual({
      ok: false,
      error: "empty",
    });
  });

  it("rejects more than 500 rows", () => {
    const rows = Array.from({ length: 501 }, (_, i) => `Person${i},X`);
    expect(
      parseContactsCsv(["first_name,last_name", ...rows].join("\n"))
    ).toEqual({ ok: false, error: "tooMany" });
  });
});

describe("buildCsv", () => {
  it("writes the header and CRLF line endings", () => {
    const csv = buildCsv([["Ana", "Pop", "", "", "", "New", "", ""]]);
    expect(csv.startsWith(`${HEADER}\r\n`)).toBe(true);
    expect(csv.endsWith("\r\n")).toBe(true);
  });

  it("neutralises spreadsheet formulas", () => {
    const csv = buildCsv([["=1+1", "@cmd", "-1+2x", "+SUM(A1)", "", "", "", ""]]);
    expect(csv).toContain("'=1+1");
    expect(csv).toContain("'@cmd");
    expect(csv).toContain("'-1+2x");
    expect(csv).toContain("'+SUM(A1)");
  });

  it("leaves phone numbers untouched", () => {
    const csv = buildCsv([["Ana", "", "", "", "+40 700 000 000", "", "", ""]]);
    expect(csv).toContain("+40 700 000 000");
    expect(csv).not.toContain("'+40");
  });

  it("quotes commas and quotation marks", () => {
    const csv = buildCsv([["a,b", 'say "hi"', "", "", "", "", "", ""]]);
    expect(csv).toContain('"a,b"');
    expect(csv).toContain('"say ""hi"""');
  });

  it("survives an export followed by an import", () => {
    const csv = buildCsv([
      [
        "Ana",
        "Pop",
        "Acme, Inc.",
        "ana@example.com",
        "+40 700 000 000",
        "Won",
        'Said "yes"\nsecond line',
        "2026-10-15",
        "CEO",
        "acme.example",
        "Cluj",
        "Referral",
        "client; vip",
      ],
    ]);
    const res = parseContactsCsv(csv);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.rows).toHaveLength(1);
    const c = res.rows[0].contact;
    expect(c.company).toBe("Acme, Inc.");
    expect(c.phone).toBe("+40 700 000 000");
    expect(c.status).toBe("Won");
    expect(c.notes).toBe('Said "yes"\nsecond line');
    expect(res.rows[0].nextFollowup).toBe("2026-10-15");
    expect([c.job_title, c.website, c.location, c.source]).toEqual(["CEO", "acme.example", "Cluj", "Referral"]);
    expect(c.tags).toEqual(["client", "vip"]);
  });
});
