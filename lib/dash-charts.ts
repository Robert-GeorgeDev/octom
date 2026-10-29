/**
 * Small, pure helpers for the dashboard charts: week buckets, bar heights and donut segments.
 * No data access and no React, so they are easy to test.
 */
import { addDays } from "@/lib/dates";

/** Monday of the week that contains an ISO date (YYYY-MM-DD). */
export function mondayOf(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dow = (new Date(y, m - 1, d).getDay() + 6) % 7; // Monday = 0
  return addDays(iso, -dow);
}

/** The Mondays of the last `n` weeks, oldest first, ending with the current week. */
export function lastWeekStarts(today: string, n: number): string[] {
  const current = mondayOf(today);
  return Array.from({ length: n }, (_, i) => addDays(current, -7 * (n - 1 - i)));
}

/** Local calendar date (YYYY-MM-DD) of a timestamp. Invalid values give an empty string. */
export function localDate(timestamp: string): string {
  const t = new Date(timestamp);
  if (Number.isNaN(t.getTime())) return "";
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${t.getFullYear()}-${m}-${d}`;
}

/** Counts how many timestamps fall in each week. Anything outside the weeks is ignored. */
export function countPerWeek(starts: string[], timestamps: string[]): number[] {
  const counts = starts.map(() => 0);
  if (starts.length === 0) return counts;
  const first = starts[0];
  const end = addDays(starts[starts.length - 1], 7); // exclusive
  for (const ts of timestamps) {
    const day = localDate(ts);
    if (!day || day < first || day >= end) continue;
    counts[starts.indexOf(mondayOf(day))] += 1;
  }
  return counts;
}

/** Counts ISO dates (YYYY-MM-DD) per given day. */
export function countPerDay(days: string[], dates: string[]): number[] {
  const index = new Map(days.map((d, i) => [d, i]));
  const counts = days.map(() => 0);
  for (const d of dates) {
    const i = index.get(d);
    if (i !== undefined) counts[i] += 1;
  }
  return counts;
}

/** The first day of each of the last `n` months, oldest first, ending with the current month. */
export function lastMonthStarts(today: string, n: number): string[] {
  const [y, m] = today.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(y, m - 1 - (n - 1 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
}

/** Counts timestamps per month, for the months given by lastMonthStarts. */
export function countPerMonth(starts: string[], timestamps: string[]): number[] {
  const counts = starts.map(() => 0);
  for (const ts of timestamps) {
    const day = localDate(ts);
    if (!day) continue;
    const i = starts.indexOf(`${day.slice(0, 7)}-01`);
    if (i >= 0) counts[i] += 1;
  }
  return counts;
}

/** A tidy top value for a chart axis: 1, 2, 4, 5, 8 or 10 times a power of ten. */
export function niceMax(n: number): number {
  if (!Number.isFinite(n) || n <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(n));
  for (const step of [1, 2, 2.5, 4, 5, 8, 10]) {
    if (n <= step * pow) return step * pow;
  }
  return 10 * pow;
}

/** Bar heights as whole percentages of the tallest bar. Zero stays zero, any other value is at least `floor`. */
export function barHeights(values: number[], floor = 12): number[] {
  const max = Math.max(0, ...values);
  if (max === 0) return values.map(() => 0);
  return values.map((v) => (v <= 0 ? 0 : Math.max(floor, Math.round((v / max) * 100))));
}

export type DonutSegment = { index: number; value: number; fraction: number; length: number; offset: number };

/**
 * Segments for a donut drawn with stroke-dasharray on a circle of radius `r`.
 * `gap` is the space left between neighbouring segments, in the same unit as the circle length.
 */
export function donutSegments(values: number[], r: number, gap = 0): DonutSegment[] {
  const total = values.reduce((a, b) => a + Math.max(0, b), 0);
  const circumference = 2 * Math.PI * r;
  if (total === 0) return [];
  const visible = values.filter((v) => v > 0).length;
  const useGap = visible > 1 ? gap : 0;
  let used = 0;
  const out: DonutSegment[] = [];
  values.forEach((v, index) => {
    if (v <= 0) return;
    const fraction = v / total;
    const full = fraction * circumference;
    out.push({ index, value: v, fraction, length: Math.max(0.5, full - useGap), offset: used });
    used += full;
  });
  return out;
}
