"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";
import { addDays, todayISO } from "@/lib/dates";

// Marks the example contacts so they can be found and removed again.
const EXAMPLE_SOURCE = "Example";

type Example = {
  first: string;
  last: string;
  company: string;
  status: string;
  days: number;
  priority: "High" | "Normal";
  note: { en: string; ro: string };
};

// Invented people and companies.
const EXAMPLES: Example[] = [
  { first: "Ana", last: "Popescu", company: "Studio Nord", status: "Proposal Sent", days: -2, priority: "High",
    note: { en: "Ask if she had time to read the proposal", ro: "Întreab-o dacă a apucat să citească oferta" } },
  { first: "Mihai", last: "Ionescu", company: "Brașov Digital", status: "Contacted", days: 0, priority: "Normal",
    note: { en: "Send the pricing we talked about", ro: "Trimite prețurile discutate" } },
  { first: "Elena", last: "Radu", company: "Radu & Co", status: "New", days: 3, priority: "Normal",
    note: { en: "Intro call: ask what she needs help with", ro: "Apel de cunoaștere: întreab-o cu ce are nevoie de ajutor" } },
];

/** Counts of all contacts and of example contacts in this workspace. */
function useCounts(orgId: string | null) {
  const [counts, setCounts] = useState<{ all: number; examples: number } | null>(null);

  const reload = useCallback(async () => {
    if (!orgId) return;
    const all = await supabase.from("contacts").select("id", { count: "exact", head: true }).eq("organization_id", orgId);
    const ex = await supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("source", EXAMPLE_SOURCE);
    // A failed count (for example before contacts-v2.sql) shows nothing rather than a wrong card.
    if (all.error) return;
    setCounts({ all: all.count ?? 0, examples: ex.error ? 0 : ex.count ?? 0 });
  }, [orgId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { counts, reload };
}

/** Empty dashboard: first contact or example data. When contacts already exist it shows `children` instead. */
export function GetStartedCard({
  orgId,
  onChange,
  children,
}: {
  orgId: string | null;
  onChange: () => void;
  children?: React.ReactNode;
}) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { counts, reload } = useCounts(orgId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!counts || !orgId) return null;
  if (counts.all > 0) return <>{children}</>;

  async function addExamples() {
    setBusy(true);
    setError("");
    const contacts = await supabase
      .from("contacts")
      .insert(
        EXAMPLES.map((e) => ({
          organization_id: orgId,
          first_name: e.first,
          last_name: e.last,
          company: e.company,
          status: e.status,
          notes: "",
          source: EXAMPLE_SOURCE,
        }))
      )
      .select("id, first_name");
    if (contacts.error || !contacts.data) {
      setError(t("start.error"));
      setBusy(false);
      return;
    }
    const today = todayISO();
    const rows = contacts.data.map((c) => {
      const e = EXAMPLES.find((x) => x.first === c.first_name)!;
      return {
        organization_id: orgId,
        contact_id: c.id,
        due_date: addDays(today, e.days),
        priority: e.priority,
        note: e.note[lang],
        assigned_to: user?.id ?? null,
      };
    });
    const followUps = await supabase.from("follow_ups").insert(rows);
    if (followUps.error) {
      setError(t("start.error"));
      setBusy(false);
      return;
    }
    setBusy(false);
    await reload();
    onChange();
  }

  return (
    <div className="mt-4 rounded-3xl border border-dashed border-slate-300/70 bg-white/40 p-8 text-center sm:p-10">
      <p className="text-lg font-semibold">{t("start.title")}</p>
      <p className="mx-auto mt-1 max-w-md text-slate-600">{t("start.text")}</p>
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/contacts?new=1" className="btn-brand !rounded-full px-6">
          {t("start.add")}
        </Link>
        <button
          type="button"
          onClick={addExamples}
          disabled={busy}
          className="btn !rounded-full border border-line bg-white px-6 text-ink hover:bg-brand-soft"
        >
          {busy ? t("start.adding") : t("start.examples")}
        </button>
      </div>
      {error && (
        <p role="alert" className="mx-auto mt-4 max-w-md rounded-xl bg-red-50 px-4 py-3 text-sm text-overdue">
          {error}
        </p>
      )}
    </div>
  );
}

/** Shown while example contacts exist, so they are easy to clear. */
export function ExamplesBanner({ orgId, onChange }: { orgId: string | null; onChange: () => void }) {
  const { t } = useLanguage();
  const { counts, reload } = useCounts(orgId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!counts || counts.examples === 0 || !orgId) return null;

  async function remove() {
    setBusy(true);
    setError("");
    // Follow-ups and notes of these contacts are removed with them.
    const { error: failure } = await supabase
      .from("contacts")
      .delete()
      .eq("organization_id", orgId)
      .eq("source", EXAMPLE_SOURCE);
    setBusy(false);
    if (failure) {
      setError(t("start.removeError"));
      return;
    }
    await reload();
    onChange();
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
      <span>{error || t("start.banner")}</span>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="rounded-full bg-white px-4 py-1.5 font-semibold text-indigo-700 shadow-sm hover:bg-indigo-100 disabled:opacity-60"
      >
        {busy ? t("start.removing") : t("start.remove")}
      </button>
    </div>
  );
}
