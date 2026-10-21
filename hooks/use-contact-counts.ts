"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/** Dispatch after adding, deleting or changing the status of a contact. */
export const CONTACTS_CHANGED = "octom:contacts";

export function notifyContactsChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CONTACTS_CHANGED));
}

/** Number of contacts per status, for the sidebar. null while loading. */
export function useContactCounts(orgId: string | null) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    const { data, error } = await supabase
      .from("contacts")
      .select("status")
      .eq("organization_id", orgId);
    if (error) return;
    const next: Record<string, number> = {};
    for (const row of data ?? []) {
      const s = String((row as { status: string }).status);
      next[s] = (next[s] ?? 0) + 1;
    }
    setCounts(next);
  }, [orgId]);

  useEffect(() => {
    load();
    window.addEventListener(CONTACTS_CHANGED, load);
    return () => window.removeEventListener(CONTACTS_CHANGED, load);
  }, [load]);

  return counts;
}
