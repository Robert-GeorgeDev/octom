"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PenLine, Plus } from "lucide-react";
import RequireAuth from "@/components/require-auth";
import FollowUpCard, { type Group } from "@/components/followup-card";
import { DashboardSkeleton } from "@/components/skeleton";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";
import { useOrgId } from "@/hooks/use-org-id";
import { useFollowUps } from "@/hooks/use-followups";
import { notifyContactsChanged } from "@/hooks/use-contact-counts";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/dates";
import { daysLabel, rankToday, type Reason } from "@/lib/priority";
import { isCadenceId, templateFor } from "@/lib/cadences";
import type { Key } from "@/lib/dictionaries";

type ContactRow = { id: string; status: string; updated_at: string };

const TOP = 5;

function ReasonChips({ reasons }: { reasons: Reason[] }) {
  const { t, lang } = useLanguage();
  if (reasons.length === 0) return null;
  return (
    <ul aria-label={t("today.why")} className="mt-2 flex flex-wrap gap-1.5">
      {reasons.slice(0, 4).map((r) => (
        <li
          key={r.key}
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            r.key === "overdue"
              ? "bg-red-50 text-overdue"
              : r.key === "closed"
                ? "bg-slate-100 text-slate-500"
                : "bg-brand-soft text-brand"
          }`}
        >
          {t(`today.r.${r.key}` as Key).replace("{days}", daysLabel(r.n ?? 0, lang === "ro" ? "ro" : "en"))}
        </li>
      ))}
    </ul>
  );
}

function TodayView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const orgId = useOrgId();
  const { followUps, error, reload } = useFollowUps(orgId);
  const [contacts, setContacts] = useState<ContactRow[] | null>(null);
  const [contactsFailed, setContactsFailed] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    supabase
      .from("contacts")
      .select("id, status, updated_at")
      .eq("organization_id", orgId)
      .limit(1000)
      .then(({ data, error: failure }) => {
        if (cancelled) return;
        if (failure) setContactsFailed(true);
        else setContacts((data ?? []) as ContactRow[]);
      });
    return () => {
      cancelled = true;
    };
  }, [orgId, version]);

  const today = todayISO();
  const ranked = useMemo(() => {
    if (!followUps) return null;
    const byId = new Map((contacts ?? []).map((c) => [c.id, c]));
    const nowMs = Date.now();
    const mine = followUps
      .filter((f) => f.status === "open" && (f.assigned_to === null || f.assigned_to === user?.id))
      .map((f) => {
        const c = byId.get(f.contact_id);
        const quietDays = c ? Math.floor((nowMs - new Date(c.updated_at).getTime()) / 86_400_000) : null;
        return { ...f, contactStatus: c?.status ?? "", quietDays: Number.isFinite(quietDays) ? quietDays : null };
      });
    return rankToday(mine, today);
  }, [followUps, contacts, user?.id, today]);

  function changed() {
    reload();
    setVersion((v) => v + 1);
    notifyContactsChanged();
  }

  const group = (d: string): Group => (d < today ? "overdue" : "today");
  const loading = ranked === null || (contacts === null && !contactsFailed);

  const render = (list: NonNullable<typeof ranked>, offset: number) => (
    <ol className="mt-3 space-y-3">
      {list.map((f, i) => (
        <li key={f.id} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-4 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white"
          >
            {offset + i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <FollowUpCard
              item={f}
              group={group(f.due_date)}
              onChanged={changed}
              extra={
                <>
                  <ReasonChips reasons={f.reasons} />
                  <Link
                    href={`/contacts/${f.contact_id}?tab=templates${isCadenceId(f.cadence) && f.cadence_step !== null ? `&template=${templateFor(f.cadence, f.cadence_step)}` : ""}`}
                    className="mt-3 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-brand/30 bg-brand-soft px-3 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
                  >
                    <PenLine className="h-4 w-4" aria-hidden="true" />
                    {t("today.write")}
                  </Link>
                </>
              }
            />
          </div>
        </li>
      ))}
    </ol>
  );

  return (
    <main className="mx-auto max-w-3xl px-5 pb-12 pt-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("today.title")}</h1>
      <p className="mt-2 text-slate-500">{t("today.subtitle")}</p>

      {(error || contactsFailed) && (
        <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-overdue">
          {t("today.loadError")}
        </p>
      )}

      {loading && !error && <DashboardSkeleton />}

      {ranked && !loading && ranked.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300/70 bg-white/50 p-10 text-center">
          <p className="text-lg font-semibold">{t("today.empty")}</p>
          <p className="mt-1 text-slate-600">{t("today.emptyText")}</p>
          <Link href="/followups/new" className="btn-brand mt-5 !rounded-full px-6">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("today.add")}
          </Link>
        </div>
      )}

      {ranked && !loading && ranked.length > 0 && (
        <>
          <h2 className="mt-8 text-xs font-bold uppercase tracking-wide text-slate-400">{t("today.top")}</h2>
          {render(ranked.slice(0, TOP), 0)}
          {ranked.length > TOP && (
            <>
              <h2 className="mt-8 text-xs font-bold uppercase tracking-wide text-slate-400">{t("today.rest")}</h2>
              {render(ranked.slice(TOP), TOP)}
            </>
          )}
          <p className="mt-8 text-sm">
            <Link href="/review" className="font-semibold text-brand hover:underline">
              {t("review.link")}
            </Link>
          </p>
          <details className="mt-4 rounded-2xl border border-line bg-white/60 p-4 text-sm text-slate-600">
            <summary className="cursor-pointer font-semibold text-ink">{t("today.how")}</summary>
            <p className="mt-2">{t("today.howText")}</p>
          </details>
        </>
      )}
    </main>
  );
}

export default function TodayPage() {
  return (
    <RequireAuth>
      <TodayView />
    </RequireAuth>
  );
}
