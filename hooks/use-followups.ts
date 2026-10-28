"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { FollowUp, Priority } from "@/types/followup";

type ContactInfo = { first_name: string; last_name: string; company: string };

type Row = {
  id: string;
  organization_id: string;
  contact_id: string;
  due_date: string;
  due_time: string | null;
  priority: Priority;
  note: string;
  status: "open" | "done";
  assigned_to: string | null;
  cadence?: string | null;
  cadence_step?: number | null;
  contacts: ContactInfo | ContactInfo[] | null;
};

const BASE =
  "id, organization_id, contact_id, due_date, due_time, priority, note, status, assigned_to, contacts!follow_ups_contact_fk(first_name, last_name, company)";
// Cadence columns come from supabase/migrations/20261028_01_follow-up-cadences.sql.
const WITH_CADENCE = BASE.replace("assigned_to,", "assigned_to, cadence, cadence_step,");

export function useFollowUps(orgId: string | null) {
  const [followUps, setFollowUps] = useState<FollowUp[] | null>(null);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!orgId) return;
    const run = (select: string) =>
      supabase.from("follow_ups").select(select).eq("organization_id", orgId).order("due_date", { ascending: true });

    let { data, error: queryError } = await run(WITH_CADENCE);
    if (queryError) {
      // Until the cadence migration has been run, the columns do not exist: fall back to the old list.
      ({ data, error: queryError } = await run(BASE));
    }

    if (queryError) {
      setError("Could not load follow-ups. Please refresh the page.");
      return;
    }

    setError("");
    const rows = (data ?? []) as unknown as Row[];
    setFollowUps(
      rows.map((r) => {
        const c = Array.isArray(r.contacts) ? r.contacts[0] : r.contacts;
        return {
          id: r.id,
          organization_id: r.organization_id,
          contact_id: r.contact_id,
          contact_name: c ? `${c.first_name} ${c.last_name}`.trim() : "",
          company: c?.company ?? "",
          due_date: r.due_date,
          due_time: r.due_time ? r.due_time.slice(0, 5) : "",
          priority: r.priority,
          note: r.note,
          status: r.status,
          assigned_to: r.assigned_to,
          cadence: r.cadence ?? null,
          cadence_step: r.cadence_step ?? null,
        };
      })
    );
  }, [orgId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { followUps, error, reload };
}
