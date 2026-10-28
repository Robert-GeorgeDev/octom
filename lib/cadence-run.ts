import { supabase } from "@/lib/supabase";
import { addDays, todayISO } from "@/lib/dates";
import { isCadenceId, nextStep } from "@/lib/cadences";
import type { FollowUp } from "@/types/followup";

export type CompleteResult = "done" | "done-next-scheduled" | "already-done" | "done-next-failed";

export type CompleteOutcome = {
  result: CompleteResult;
  /** Id of the follow-up scheduled as the next step, so Undo can remove it again. */
  nextId?: string;
  /** Days until that next step. */
  nextGapDays?: number;
};

/**
 * Marks a follow-up as done and, when it belongs to a cadence, schedules the next step.
 * The update only counts when the row was still open, so a double click or a second
 * device cannot schedule the next step twice.
 */
export async function completeFollowUp(item: FollowUp): Promise<CompleteOutcome> {
  const { data, error } = await supabase
    .from("follow_ups")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", item.id)
    .eq("status", "open")
    .select("id");
  if (error) throw error;
  if (!data || data.length === 0) return { result: "already-done" };

  if (!isCadenceId(item.cadence) || item.cadence_step === null) return { result: "done" };
  const next = nextStep(item.cadence, item.cadence_step);
  if (!next) return { result: "done" };

  try {
    const { data: contact, error: cErr } = await supabase
      .from("contacts")
      .select("status")
      .eq("id", item.contact_id)
      .eq("organization_id", item.organization_id)
      .maybeSingle();
    if (cErr) return { result: "done-next-failed" };
    if (!contact || contact.status === "Won" || contact.status === "Lost") return { result: "done" };

    // Another open step of the same cadence for this contact: do not add a second one.
    const { data: open, error: oErr } = await supabase
      .from("follow_ups")
      .select("id")
      .eq("organization_id", item.organization_id)
      .eq("contact_id", item.contact_id)
      .eq("status", "open")
      .eq("cadence", item.cadence)
      .limit(1);
    if (oErr) return { result: "done-next-failed" };
    if (open && open.length > 0) return { result: "done" };

    const { data: created, error: iErr } = await supabase.from("follow_ups").insert({
      organization_id: item.organization_id,
      contact_id: item.contact_id,
      due_date: addDays(todayISO(), next.gapDays),
      priority: item.priority,
      note: "",
      cadence: item.cadence,
      cadence_step: next.step,
      ...(item.assigned_to ? { assigned_to: item.assigned_to } : {}),
    }).select("id").maybeSingle();
    if (iErr) return { result: "done-next-failed" };
    return { result: "done-next-scheduled", nextId: created?.id as string | undefined, nextGapDays: next.gapDays };
  } catch {
    return { result: "done-next-failed" };
  }
}

/**
 * Puts a finished follow-up back on the list. A next step that Complete scheduled is removed
 * again, but only if it is still open (if the person already did it, it stays).
 */
export async function undoCompleteFollowUp(item: FollowUp, nextId?: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("follow_ups")
    .update({ status: "open", completed_at: null })
    .eq("id", item.id)
    .eq("status", "done")
    .select("id");
  if (error) return false;
  if (nextId && data && data.length > 0) {
    await supabase.from("follow_ups").delete().eq("id", nextId).eq("status", "open");
  }
  return true;
}
