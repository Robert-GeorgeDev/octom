import { describe, expect, it } from "vitest";
import { dictionaries } from "@/lib/dictionaries";
import { CADENCE_IDS, CADENCES, dayMarks, isCadenceId, nextStep, templateFor, totalSteps } from "@/lib/cadences";
import { TEMPLATE_IDS } from "@/lib/templates";

describe("cadences", () => {
  it("knows which ids are valid", () => {
    expect(isCadenceId("offer")).toBe(true);
    expect(isCadenceId("nope")).toBe(false);
    expect(isCadenceId(null)).toBe(false);
  });

  it("counts steps as gaps + 1", () => {
    expect(totalSteps("offer")).toBe(3);
    expect(totalSteps("meeting")).toBe(2);
  });

  it("gives the day marks from the start (offer: 3, 7, 14)", () => {
    expect(dayMarks("offer")).toEqual([3, 7, 14]);
    expect(dayMarks("quiet")).toEqual([1, 8, 22]);
    expect(dayMarks("meeting")).toEqual([1, 7]);
  });

  it("schedules the next step and stops after the last one", () => {
    expect(nextStep("offer", 1)).toEqual({ step: 2, gapDays: 4 });
    expect(nextStep("offer", 2)).toEqual({ step: 3, gapDays: 7 });
    expect(nextStep("offer", 3)).toBeNull();
    expect(nextStep("meeting", 2)).toBeNull();
  });

  it("refuses odd step values instead of guessing", () => {
    expect(nextStep("offer", 0)).toBeNull();
    expect(nextStep("offer", -1)).toBeNull();
    expect(nextStep("offer", 1.5)).toBeNull();
    expect(nextStep("offer", 99)).toBeNull();
  });

  it("has one message template for every step, all of them real templates", () => {
    for (const id of CADENCE_IDS) {
      expect(CADENCES[id].templates).toHaveLength(totalSteps(id));
      for (let s = 1; s <= totalSteps(id); s++) expect(TEMPLATE_IDS).toContain(templateFor(id, s));
    }
  });

  it("stays inside the database rule (step 1 to 10, id of lowercase letters and dashes)", () => {
    for (const id of CADENCE_IDS) {
      expect(id).toMatch(/^[a-z-]{1,30}$/);
      expect(totalSteps(id)).toBeLessThanOrEqual(10);
    }
  });

  it("has names in both languages", () => {
    for (const lang of ["en", "ro"] as const) {
      const d = dictionaries[lang] as Record<string, string>;
      for (const id of CADENCE_IDS) expect(d[`cad.name.${id}`]).toBeTruthy();
    }
  });
});
