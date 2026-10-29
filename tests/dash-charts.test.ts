import { describe, expect, it } from "vitest";
import {
  barHeights, countPerDay, countPerMonth, countPerWeek, donutSegments, lastMonthStarts, lastWeekStarts, mondayOf, niceMax,
} from "@/lib/dash-charts";

describe("weeks", () => {
  it("finds the Monday of a week", () => {
    expect(mondayOf("2026-10-29")).toBe("2026-10-26"); // Thursday
    expect(mondayOf("2026-10-26")).toBe("2026-10-26");
    expect(mondayOf("2026-11-01")).toBe("2026-10-26"); // Sunday belongs to the week before
  });

  it("lists the last weeks, oldest first, ending now", () => {
    expect(lastWeekStarts("2026-10-29", 3)).toEqual(["2026-10-12", "2026-10-19", "2026-10-26"]);
  });

  it("counts timestamps per week and ignores the rest", () => {
    const starts = lastWeekStarts("2026-10-29", 3);
    const at = (iso: string) => new Date(`${iso}T12:00:00`).toISOString();
    const counts = countPerWeek(starts, [at("2026-10-12"), at("2026-10-18"), at("2026-10-19"), at("2026-10-29"), at("2026-10-11"), at("2026-11-02"), "not a date"]);
    expect(counts).toEqual([2, 1, 1]);
  });
});

describe("days and months", () => {
  it("counts dates per day", () => {
    expect(countPerDay(["2026-10-28", "2026-10-29"], ["2026-10-29", "2026-10-29", "2026-10-28", "2026-10-30"])).toEqual([1, 2]);
  });

  it("lists months across a year change", () => {
    expect(lastMonthStarts("2026-01-15", 3)).toEqual(["2025-11-01", "2025-12-01", "2026-01-01"]);
  });

  it("counts timestamps per month", () => {
    const starts = lastMonthStarts("2026-10-29", 3);
    const at = (iso: string) => new Date(`${iso}T12:00:00`).toISOString();
    expect(countPerMonth(starts, [at("2026-08-31"), at("2026-10-01"), at("2026-10-29"), at("2026-07-01")])).toEqual([1, 0, 2]);
  });
});

describe("scales", () => {
  it("rounds the axis top to a tidy number", () => {
    expect(niceMax(0)).toBe(4);
    expect(niceMax(3)).toBe(4);
    expect(niceMax(5)).toBe(5);
    expect(niceMax(7)).toBe(8);
    expect(niceMax(9)).toBe(10);
    expect(niceMax(11)).toBe(20);
    expect(niceMax(130)).toBe(200);
  });

  it("scales bars to the tallest, keeping small values visible", () => {
    expect(barHeights([0, 0])).toEqual([0, 0]);
    expect(barHeights([10, 5, 0, 1])).toEqual([100, 50, 0, 12]);
  });
});

describe("donut", () => {
  it("has no segments when everything is zero", () => {
    expect(donutSegments([0, 0], 50)).toEqual([]);
  });

  it("splits the circle by value and leaves a gap between segments", () => {
    const r = 50;
    const c = 2 * Math.PI * r;
    const [a, b] = donutSegments([1, 3], r, 4);
    expect(a.fraction).toBeCloseTo(0.25);
    expect(a.length).toBeCloseTo(c * 0.25 - 4);
    expect(b.offset).toBeCloseTo(c * 0.25);
    expect(b.length).toBeCloseTo(c * 0.75 - 4);
  });

  it("does not leave a gap when there is one segment, and skips zero values", () => {
    const segs = donutSegments([0, 5, 0], 40, 6);
    expect(segs).toHaveLength(1);
    expect(segs[0].index).toBe(1);
    expect(segs[0].length).toBeCloseTo(2 * Math.PI * 40);
  });
});
