/**
 * Cadences: a short series of follow-ups for a common situation.
 * Finishing one step schedules the next, counted from the day it was finished.
 * The person can stop a cadence at any time; a closed (Won/Lost) contact stops it too.
 */
import type { TemplateId } from "@/lib/templates";

export const CADENCE_IDS = ["offer", "quiet", "invoice", "meeting"] as const;
export type CadenceId = (typeof CADENCE_IDS)[number];

type Def = {
  /** Days from today to the first step. */
  first: number;
  /** Days from finishing a step to the next one. Steps = gaps.length + 1. */
  gaps: number[];
  /** Message template that fits each step. */
  templates: TemplateId[];
};

export const CADENCES: Record<CadenceId, Def> = {
  offer: { first: 3, gaps: [4, 7], templates: ["offer", "offer", "quiet"] },
  quiet: { first: 1, gaps: [7, 14], templates: ["quiet", "quiet", "quiet"] },
  invoice: { first: 1, gaps: [3, 7], templates: ["invoice", "invoice", "invoice"] },
  meeting: { first: 1, gaps: [6], templates: ["meeting", "quiet"] },
};

export function isCadenceId(v: unknown): v is CadenceId {
  return typeof v === "string" && (CADENCE_IDS as readonly string[]).includes(v);
}

export function totalSteps(id: CadenceId): number {
  return CADENCES[id].gaps.length + 1;
}

/** The step after `step` (1-based), or null when `step` was the last one. */
export function nextStep(id: CadenceId, step: number): { step: number; gapDays: number } | null {
  const gaps = CADENCES[id].gaps;
  if (!Number.isInteger(step) || step < 1 || step > gaps.length) return null;
  return { step: step + 1, gapDays: gaps[step - 1] };
}

/** Days from the start for each step, for example offer: 3, 7, 14. */
export function dayMarks(id: CadenceId): number[] {
  const d = CADENCES[id];
  const out = [d.first];
  for (const g of d.gaps) out.push(out[out.length - 1] + g);
  return out;
}

export function templateFor(id: CadenceId, step: number): TemplateId {
  const list = CADENCES[id].templates;
  return list[Math.min(Math.max(step, 1), list.length) - 1];
}
