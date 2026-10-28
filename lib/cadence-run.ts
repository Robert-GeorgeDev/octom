import { supabase } from "@/lib/supabase";
import { addDays, todayISO } from "@/lib/dates";
import { isCadenceId, nextStep } from "@/lib/cadences";
import type { FollowUp } from "@/types/followup";

export type CompleteResult = "done" | "done-next-scheduled" | "already-done" | "done-next-failed";

/**
 * Marks a follow-up as done and, when it belongs to a cadence, schedules the next step.
 * The update only counts when the row was still open, so a double click or a second
 * device cannot schedule the next step twice.
 */
export async function completeFollowUp(item: FollowUp): Promise<CompleteResult> {
  const { data, error } = await supabase
    .from("follow_ups")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", item.id)
    .eq("status", "open")
    .select("id");
  if (error) throw error;
  if (!data || data.length === 0) return "already-done";

  if (!isCadenceId(item.cadence) || item.cadence_step === null) return "done";
  const next = nextStep(item.cadence, item.cadence_step);
  if (!next) return "done";

  try {
    const { data: contact, error: cErr } = await supabase
      .from("contacts")
      .select("status")
      .eq("id", item.contact_id)
      .eq("organization_id", item.organization_id)
      .maybeSingle();
    if (cErr) return "done-next-failed";
    if (!contact || contact.status === "Won" || contact.status === "Lost") return "done";

    // Another open step of the same cadence for this contact: do not add a second one.
    const { data: open, error: oErr } = await supabase
      .from("follow_ups")
      .select("id")
      .eq("organization_id", item.organization_id)
      .eq("contact_id", item.contact_id)
      .eq("status", "open")
      .eq("cadence", item.cadence)
      .limit(1);
    if (oErr) return "done-next-failed";
    if (open && open.length > 0) return "done";

    const { error: iErr } = await supabase.from("follow_ups").insert({
      organization_id: item.organization_id,
      contact_id: item.contact_id,
      due_date: addDays(todayISO(), next.gapDays),
      priority: item.priority,
      note: "",
      cadence: item.cadence,
      cadence_step: next.step,
      ...(item.assigned_to ? { assigned_to: item.assigned_to } : {}),
    });
    return iErr ? "done-next-failed" : "done-next-scheduled";
  } catch {
    return "done-next-failed";
  }
}
