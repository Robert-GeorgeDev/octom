"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/require-auth";
import { DashboardSkeleton } from "@/components/skeleton";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";
import { useOrgId } from "@/hooks/use-org-id";
import { useFollowUps } from "@/hooks/use-followups";
import { supabase } from "@/lib/supabase";
import { addDays, formatDate, todayISO } from "@/lib/dates";
import { formatMoney } from "@/lib/deal";
import { daysLabel } from "@/lib/priority";
import { buildReview, lateDays, type ReviewContact, type ReviewFollowUp } from "@/lib/weekly";

const SHOW = 8;

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{label}</p>
    </div>
  );
}

function ReviewView() {
  const { t, lang } = useLanguage();
  const ro = lang === "ro";
  const locale = ro ? "ro-RO" : "en-GB";
  const { user } = useAuth();
  const orgId = useOrgId();
  const { followUps, error } = useFollowUps(orgId);
  const [contacts, setContacts] = useState<ReviewContact[] | null>(null);
  const [doneCount, setDoneCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    (async () => {
      const columns = "id, first_name, last_name, company, status, updated_at";
      const load = (select: string) => supabase.from("contacts").select(select).eq("organization_id", orgId).limit(1000);
      let { data, error: failure } = await load(`${columns}, deal_value, deal_currency`);
      // Without the estimated-value columns (database not updated yet) the review still loads.
      if (failure) ({ data, error: failure } = await load(columns));
      const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
      const done = await supabase
        .from("follow_ups")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "done")
        .gte("completed_at", since);
      if (cancelled) return;
      if (failure || done.error) {
        setFailed(true);
        return;
      }
      setContacts((data ?? []) as unknown as ReviewContact[]);
      setDoneCount(done.count ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  const today = todayISO();
  const review = useMemo(() => {
    if (!followUps || !contacts || doneCount === null) return null;
    return buildReview({
      openFollowUps: followUps.map<ReviewFollowUp>((f) => ({
        id: f.id,
        contact_id: f.contact_id,
        contact_name: f.contact_name,
        company: f.company,
        due_date: f.due_date,
        status: f.status,
        assigned_to: f.assigned_to,
      })),
      doneCount,
      contacts,
      today,
      nowMs: Date.now(),
      userId: user?.id ?? null,
    });
  }, [followUps, contacts, doneCount, today, user?.id]);

  const more = (n: number) => (n > SHOW ? <p className="mt-2 text-sm text-slate-500">{t("review.more").replace("{n}", String(n - SHOW))}</p> : null);
  const row = "flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 rounded-xl border border-line bg-white px-4 py-3 text-sm";
  const heading = "mt-10 text-xs font-bold uppercase tracking-wide text-slate-400";
  const kind = ro ? "ro" : "en";

  return (
    <main className="mx-auto max-w-3xl px-5 pb-12 pt-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("review.title")}</h1>
      <p className="mt-2 text-slate-500">{t("review.subtitle")}</p>

      {(error || failed) && (
        <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-overdue">
          {t("review.loadError")}
        </p>
      )}
      {!review && !error && !failed && <DashboardSkeleton />}

      {review && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label={t("review.stat.done")} value={review.doneCount} />
            <Stat label={t("review.stat.overdue")} value={review.overdue.length} />
            <Stat label={t("review.stat.upcoming")} value={review.upcoming.length} />
            <Stat label={t("review.stat.nonext")} value={review.noNextStep.length} />
          </div>

          <h2 className={heading}>{t("review.overdue.title")}</h2>
          {review.overdue.length === 0 ? (
            <p className="mt-3 text-slate-600">{t("review.overdue.none")}</p>
          ) : (
            <>
              <ul className="mt-3 space-y-2">
                {review.overdue.slice(0, SHOW).map((f) => (
                  <li key={f.id}>
                    <Link href={`/contacts/${f.contact_id}`} className={`${row} hover:border-brand/40`}>
                      <span className="font-semibold">
                        {f.contact_name}
                        {f.company ? <span className="font-normal text-slate-500"> · {f.company}</span> : null}
                      </span>
                      <span className="text-overdue">
                        {t("today.r.overdue").replace("{days}", daysLabel(lateDays(f.due_date, today), kind))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {more(review.overdue.length)}
            </>
          )}

          <h2 className={heading}>{t("review.upcoming.title")}</h2>
          {review.upcoming.length === 0 ? (
            <p className="mt-3 text-slate-600">{t("review.upcoming.none")}</p>
          ) : (
            <>
              <ul className="mt-3 space-y-2">
                {review.upcoming.slice(0, SHOW).map((f) => (
                  <li key={f.id}>
                    <Link href={`/contacts/${f.contact_id}`} className={`${row} hover:border-brand/40`}>
                      <span className="font-semibold">
                        {f.contact_name}
                        {f.company ? <span className="font-normal text-slate-500"> · {f.company}</span> : null}
                      </span>
                      <span className="text-slate-600">{formatDate(f.due_date, locale)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {more(review.upcoming.length)}
            </>
          )}

          <h2 className={heading}>{t("review.nonext.title")}</h2>
          <p className="mt-2 text-sm text-slate-600">{t("review.nonext.text")}</p>
          {review.noNextStep.length === 0 ? (
            <p className="mt-3 text-slate-600">{t("review.nonext.none")}</p>
          ) : (
            <>
              <ul className="mt-3 space-y-2">
                {review.noNextStep.slice(0, SHOW).map(({ contact: c, quietDays }) => (
                  <li key={c.id} className={row}>
                    <span className="min-w-0">
                      <Link href={`/contacts/${c.id}`} className="font-semibold hover:text-brand">
                        {`${c.first_name} ${c.last_name}`.trim()}
                      </Link>
                      {c.company ? <span className="text-slate-500"> · {c.company}</span> : null}
                      {quietDays !== null && quietDays >= 7 ? (
                        <span className="block text-xs text-slate-500">
                          {t("today.r.quiet").replace("{days}", daysLabel(quietDays, kind))}
                        </span>
                      ) : null}
                    </span>
                    <Link href={`/followups/new?contact=${c.id}`} className="font-semibold text-brand hover:underline">
                      {t("review.plan")}
                    </Link>
                  </li>
                ))}
              </ul>
              {more(review.noNextStep.length)}
            </>
          )}

          <h2 className={heading}>{t("review.value.title")}</h2>
          {review.value.length === 0 ? (
            <p className="mt-3 text-slate-600">{t("review.value.none")}</p>
          ) : (
            <>
              <p className="mt-3 text-2xl font-semibold tracking-tight">
                {review.value.map((x) => formatMoney(x.total, x.currency, locale)).join(" · ")}
              </p>
              <p className="mt-1 text-sm text-slate-600">{t("review.value.text")}</p>
            </>
          )}
        </>
      )}
    </main>
  );
}

export default function ReviewPage() {
  return (
    <RequireAuth>
      <ReviewView />
    </RequireAuth>
  );
}
