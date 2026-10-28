"use client";

import { PipelineSkeleton } from "@/components/skeleton";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/require-auth";
import { useLanguage } from "@/components/language-provider";
import { useOrgId } from "@/hooks/use-org-id";
import { supabase } from "@/lib/supabase";
import type { Key } from "@/lib/dictionaries";
import { STATUSES, type Status } from "@/types/contact";
import { dealOf, formatMoney, totalsByCurrency } from "@/lib/deal";

type Card = {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
  status: Status;
  deal_value?: number | string | null;
  deal_currency?: string | null;
};

const dot: Record<string, string> = {
  New: "bg-slate-400",
  Contacted: "bg-brand",
  Qualified: "bg-indigo-400",
  "Proposal Sent": "bg-today",
  Negotiation: "bg-orange-500",
  Won: "bg-success",
  Lost: "bg-overdue",
};

function PipelineView() {
  const { t, lang } = useLanguage();
  const locale = lang === "ro" ? "ro-RO" : "en-GB";
  const orgId = useOrgId();
  const [cards, setCards] = useState<Card[] | null>(null);
  const [error, setError] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    const query = (columns: string) =>
      supabase
        .from("contacts")
        .select(columns)
        .eq("organization_id", orgId)
        .order("updated_at", { ascending: false })
        .limit(500);
    let { data, error: failure } = await query("id, first_name, last_name, company, status, deal_value, deal_currency");
    // Without the estimated-value columns (database not updated yet) the pipeline still loads.
    if (failure) ({ data, error: failure } = await query("id, first_name, last_name, company, status"));
    if (failure) {
      setError(t("common.error"));
      return;
    }
    setCards((data ?? []) as unknown as Card[]);
  }, [orgId, t]);

  useEffect(() => {
    load();
  }, [load]);

  async function move(id: string, status: Status) {
    setError("");
    setCards((prev) => (prev ?? []).map((c) => (c.id === id ? { ...c, status } : c)));
    const { error: failure } = await supabase.from("contacts").update({ status }).eq("id", id);
    if (failure) {
      setError(t("common.error"));
      load();
    }
  }

  const label = (s: Status) => t(("status." + s) as Key);

  return (
    <main className="px-5 pb-10 pt-8">
      <h1 className="text-4xl font-semibold tracking-tight">{t("pipe.title")}</h1>
      <p className="mt-2 text-lg text-slate-500">{t("pipe.subtitle")}</p>
      {error && <p role="alert" className="mt-3 text-sm text-overdue">{error}</p>}
      {cards === null && !error && <PipelineSkeleton />}

      {cards !== null && (
        <div className="mt-6 flex snap-x gap-3 overflow-x-auto pb-4">
          {STATUSES.map((status) => {
            const inCol = cards.filter((c) => c.status === status);
            return (
              <section
                key={status}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragId) move(dragId, status);
                  setDragId(null);
                }}
                className="w-72 shrink-0 snap-start rounded-2xl border border-line/70 bg-white/60 p-3 backdrop-blur"
              >
                <h2 className="flex items-center gap-2 px-1 text-sm font-semibold">
                  <span className={`h-2.5 w-2.5 rounded-full ${dot[status]}`} aria-hidden="true" />
                  {label(status)}
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{inCol.length}</span>
                </h2>
                {totalsByCurrency(inCol).length > 0 && (
                  <p className="mt-1 px-1 text-xs text-slate-500" title={t("deal.total")}>
                    {totalsByCurrency(inCol)
                      .map((x) => formatMoney(x.total, x.currency, locale))
                      .join(" · ")}
                  </p>
                )}
                <ul className="mt-3 space-y-2">
                  {inCol.length === 0 && <li className="py-4 text-center text-xs text-slate-400">{t("pipe.empty")}</li>}
                  {inCol.map((c) => (
                    <li
                      key={c.id}
                      draggable
                      onDragStart={() => setDragId(c.id)}
                      onDragEnd={() => setDragId(null)}
                      className="cursor-grab rounded-xl border border-line/70 bg-white p-3.5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift active:cursor-grabbing"
                    >
                      <Link href={`/contacts/${c.id}`} className="block font-semibold hover:text-brand">
                        {`${c.first_name} ${c.last_name}`.trim()}
                      </Link>
                      {c.company && <p className="text-xs text-slate-600">{c.company}</p>}
                      {dealOf(c) && (
                        <p className="mt-0.5 text-xs font-semibold text-slate-700">
                          {formatMoney(dealOf(c)!.value, dealOf(c)!.currency, locale)}
                        </p>
                      )}
                      <select
                        aria-label={t("pipe.moveTo")}
                        value={c.status}
                        onChange={(e) => move(c.id, e.target.value as Status)}
                        className="mt-2 min-h-[44px] w-full rounded-lg border border-line bg-white px-2 text-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{label(s)}</option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function PipelinePage() {
  return (
    <RequireAuth>
      <PipelineView />
    </RequireAuth>
  );
}
