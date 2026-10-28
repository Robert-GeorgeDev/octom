import { describe, expect, it } from "vitest";
import { buildCsv, parseContactsCsv } from "@/lib/csv";
import { dealOf, formatMoney, parseDeal, totalsByCurrency } from "@/lib/deal";
import { dictionaries } from "@/lib/dictionaries";
import { REQUIRED_MIGRATIONS } from "@/lib/migrations";

describe("parseDeal", () => {
  it("reads amounts the way people type them", () => {
    expect(parseDeal("1500", "eur")).toEqual({ ok: true, value: 1500, currency: "EUR" });
    expect(parseDeal("1.500,50", "RON")).toEqual({ ok: true, value: 1500.5, currency: "RON" });
    expect(parseDeal("2 500", "USD")).toEqual({ ok: true, value: 2500, currency: "USD" });
  });

  it("rounds to two decimals", () => {
    expect(parseDeal("1.234,567", "EUR")).toEqual({ ok: true, value: 1234.57, currency: "EUR" });
  });

  it("clears on empty text, whatever the currency", () => {
    expect(parseDeal("  ", "EUR")).toEqual({ ok: true, value: null, currency: null });
  });

  it("refuses zero, negative, text, too large and unknown currencies", () => {
    for (const v of ["0", "-5", "abc", "1e5", "1000000001"]) expect(parseDeal(v, "EUR"), v).toEqual({ ok: false });
    expect(parseDeal("100", "GBP")).toEqual({ ok: false });
    expect(parseDeal("100", "")).toEqual({ ok: false });
  });

  it("accepts the largest value the database allows", () => {
    expect(parseDeal("1000000000", "EUR")).toEqual({ ok: true, value: 1_000_000_000, currency: "EUR" });
  });
});

describe("totals", () => {
  it("adds per currency and never mixes them", () => {
    const totals = totalsByCurrency([
      { deal_value: 1000, deal_currency: "EUR" },
      { deal_value: "250.50", deal_currency: "EUR" },
      { deal_value: 3000, deal_currency: "RON" },
      { deal_value: null, deal_currency: null },
      { deal_value: 50, deal_currency: "GBP" },
      {},
    ]);
    expect(totals).toEqual([
      { currency: "RON", total: 3000 },
      { currency: "EUR", total: 1250.5 },
    ]);
  });

  it("has no floating-point drift", () => {
    expect(totalsByCurrency([0.1, 0.2, 0.3].map((v) => ({ deal_value: v, deal_currency: "USD" })))).toEqual([{ currency: "USD", total: 0.6 }]);
  });

  it("is empty when nothing has a value", () => {
    expect(totalsByCurrency([{ deal_value: null }, {}])).toEqual([]);
    expect(dealOf({ deal_value: 5, deal_currency: null })).toBeNull();
    expect(dealOf({ deal_value: 0, deal_currency: "EUR" })).toBeNull();
  });

  it("formats whole amounts without decimals", () => {
    expect(formatMoney(1500, "EUR", "en-GB")).toBe("€1,500");
    expect(formatMoney(1500.5, "EUR", "en-GB")).toBe("€1,500.50");
  });
});

describe("csv with estimated value", () => {
  const head = "first_name,deal_value,deal_currency";

  it("reads value and currency", () => {
    const res = parseContactsCsv(`${head}\nAna,1500,eur\nBob,,`);
    if (!res.ok) throw new Error("not ok");
    expect(res.rows.map((r) => [r.contact.deal_value, r.contact.deal_currency])).toEqual([[1500, "EUR"], [null, null]]);
  });

  it("reads Romanian and common headers", () => {
    const res = parseContactsCsv("Prenume,Valoare,Moneda\nAna,\"1.500,50\",RON");
    if (!res.ok) throw new Error("not ok");
    expect([res.rows[0].contact.deal_value, res.rows[0].contact.deal_currency]).toEqual([1500.5, "RON"]);
  });

  it("flags a value without a currency, and a bad value", () => {
    const res = parseContactsCsv(`${head}\nAna,100,\nBob,abc,EUR\nCid,5,EUR`);
    if (!res.ok) throw new Error("not ok");
    expect(res.issues.map((i) => [i.row, i.code])).toEqual([[2, "value_invalid"], [3, "value_invalid"]]);
    expect(res.rows).toHaveLength(1);
  });

  it("writes the two columns last in the export header", () => {
    expect(buildCsv([]).split("\r\n")[0].endsWith(",tags,deal_value,deal_currency")).toBe(true);
  });
});

describe("estimated value text and migration", () => {
  it("has English and Romanian text for every key, and the row error", () => {
    for (const key of ["deal.label", "deal.hint", "deal.invalid", "deal.total", "data.rowerr.value_invalid"] as const) {
      expect(dictionaries.en[key], key).toBeTruthy();
      expect(dictionaries.ro[key], key).toBeTruthy();
    }
  });

  it("is a required migration", () => {
    expect(REQUIRED_MIGRATIONS).toContain("deal-value");
  });
});
