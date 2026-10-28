/**
 * Estimated value of a contact: the person's own estimate, in one currency per contact.
 * It is only added up per currency. Different currencies are never converted or mixed.
 */
import { parseAmount } from "@/lib/tools";

export const DEAL_CURRENCIES = ["RON", "EUR", "USD"] as const;
export type DealCurrency = (typeof DEAL_CURRENCIES)[number];

/** Matches the database rule (more than 0, at most one billion). */
export const MAX_DEAL_VALUE = 1_000_000_000;

export function isDealCurrency(x: unknown): x is DealCurrency {
  return typeof x === "string" && (DEAL_CURRENCIES as readonly string[]).includes(x);
}

export type ParsedDeal =
  | { ok: true; value: number | null; currency: DealCurrency | null }
  | { ok: false };

const cents = (n: number) => Math.round(n * 100) / 100;

/** Empty text clears the value. Anything else must be an amount above 0 and within the limit. */
export function parseDeal(valueText: string, currencyText: string): ParsedDeal {
  if (valueText.trim() === "") return { ok: true, value: null, currency: null };
  const n = parseAmount(valueText);
  const currency = currencyText.trim().toUpperCase();
  if (n === null || !isDealCurrency(currency)) return { ok: false };
  const value = cents(n);
  if (!(value > 0) || value > MAX_DEAL_VALUE) return { ok: false };
  return { ok: true, value, currency };
}

/** "€1,500", "2.500 RON": whole amounts without decimals. */
export function formatMoney(value: number, currency: DealCurrency, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

type Valued = { deal_value?: number | string | null; deal_currency?: string | null };

/** The stored value as a number, or null when empty or not usable (numeric columns can arrive as text). */
export function dealOf(c: Valued): { value: number; currency: DealCurrency } | null {
  if (c.deal_value === null || c.deal_value === undefined || !isDealCurrency(c.deal_currency)) return null;
  const value = Number(c.deal_value);
  if (!Number.isFinite(value) || value <= 0) return null;
  return { value, currency: c.deal_currency };
}

/** One total per currency in use, in a fixed order. Empty when nothing has a value. */
export function totalsByCurrency(items: Valued[]): { currency: DealCurrency; total: number }[] {
  const sums = new Map<DealCurrency, number>();
  for (const it of items) {
    const d = dealOf(it);
    if (d) sums.set(d.currency, cents((sums.get(d.currency) ?? 0) + d.value));
  }
  return DEAL_CURRENCIES.filter((c) => sums.has(c)).map((currency) => ({ currency, total: sums.get(currency)! }));
}
