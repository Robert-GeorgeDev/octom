export const STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
] as const;

export type Status = (typeof STATUSES)[number];

export type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  phone: string;
  status: Status;
  notes: string;
  // Contacts v2 (supabase/contacts-v2.sql). Optional so the app keeps working
  // until the SQL has been run.
  website?: string | null;
  location?: string | null;
  job_title?: string | null;
  source?: string | null;
  tags?: string[] | null;
  created_at?: string;
  assigned_to?: string | null;
};
