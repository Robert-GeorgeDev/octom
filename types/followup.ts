export const PRIORITIES = ["Low", "Normal", "High"] as const;

export type Priority = (typeof PRIORITIES)[number];

export type FollowUp = {
  id: string;
  organization_id: string;
  contact_id: string;
  contact_name: string;
  company: string;
  due_date: string;
  due_time: string;
  priority: Priority;
  note: string;
  status: "open" | "done";
  assigned_to: string | null;
  /** Cadence this follow-up belongs to (see lib/cadences.ts) and which step it is. */
  cadence: string | null;
  cadence_step: number | null;
};
