"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Clock, Plus, Trophy, Users } from "lucide-react";
import RequireAuth from "@/components/require-auth";
import { DashboardSkeleton } from "@/components/skeleton";
import FollowUpCard, { type Group } from "@/components/followup-card";
import { useLanguage } from "@/components/language-provider";
import { useOrgId } from "@/hooks/use-org-id";
import { useAuth } from "@/components/auth-provider";
import { useFollowUps } from "@/hooks/use-followups";
import { notifyContactsChanged } from "@/hooks/use-contact-counts";
import { supabase } from "@/lib/supabase";
import { addDays, toISODate, todayISO } from "@/lib/dates";
import { initials, needsAttention, type AttentionContact } from "@/lib/contact-utils";
import type { Key } from "@/lib/dictionaries";
import type { FollowUp } from "@/types/followup";
import { STATUSES, type Status } from "@/types/contact";
import { GetStartedCard, ExamplesBanner } from "@/components/get-started";
import { ActivityChart, AiOrb, MiniBars, STAGE_COLOR, StageDonut } from "@/components/dash-charts";
import { countPerDay, countPerMonth, countPerWeek, lastMonthStarts, lastWeekStarts } from "@/lib/dash-charts";

type PipeCard = { id: string; status: Status };

const FUNNEL = STATUSES.filter((s) => s !== "Lost");

const groupLabel: Record<Group, Key> = {
  overdue: "group.overdue",
  today: "group.today",
  upcoming: "group.upcoming",
};

const badge: Record<Group, string> = {
  overdue: "bg-red-50 text-overdue",
  today: "bg-amber-50 text-amber-700",
  upcoming: "bg-slate-100 text-slate-600",
};

const order: Group[] = ["overdue", "today", "upcoming"];

/** White rounded panel used for every section of the dashboard. */
const panel = "rounded-[28px] bg-white p-5 shadow-soft sm:p-6";

/** Round icon button. */
const roundBtn =
  "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition duration-200 hover:bg-brand hover:text-white";

const WEEKS = 10;
const MONTHS = 6;

function compare(a: FollowUp, b: FollowUp): number {
  if (a.due_date !== b.due_date) return a.due_date < b.due_date ? -1 : 1;
  return (a.due_time || "99:99").localeCompare(b.due_time || "99:99");
}

function DashboardView() {
  const { t, lang } = useLanguage();
  const locale = lang === "ro" ? "ro-RO" : "en-GB";
  const orgId = useOrgId();
  const { user } = useAuth();
  const { followUps, error, reload } = useFollowUps(orgId);
  const [openLeads, setOpenLeads] = useState<number | null>(null);
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [teamSize, setTeamSize] = useState(1);
  const [wonCount, setWonCount] = useState<number | null>(null);
  const [pipe, setPipe] = useState<PipeCard[] | null>(null);
  const [quiet, setQuiet] = useState<AttentionContact[]>([]);
  const [activity, setActivity] = useState<{ planned: number[]; finished: number[] } | null>(null);
  const [wonSeries, setWonSeries] = useState<number[] | null>(null);
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [busyId, setBusyId] = useState("");
  // Bumped to reload the numbers, funnel and "needs attention" list (not only the follow-ups).
  const [statsVersion, setStatsVersion] = useState(0);
  const refreshAll = () => {
    reload();
    setStatsVersion((v) => v + 1);
    notifyContactsChanged();
  };

  useEffect(() => {
    supabase.rpc("list_members").then(({ data }) => {
      setTeamSize(Array.isArray(data) ? data.length : 1);
    });
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .not("status", "in", "(Won,Lost)")
      .then(({ count }) => {
        if (!cancelled) setOpenLeads(count ?? 0);
      });
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "Won")
      .gte("won_at", monthStart)
      .then(({ count }) => {
        if (!cancelled) setWonCount(count ?? 0);
      });
    supabase
      .from("contacts")
      .select("id, status")
      .eq("organization_id", orgId)
      .limit(1000)
      .then(({ data }) => {
        if (!cancelled) setPipe((data ?? []) as PipeCard[]);
      });
    // Open contacts that have been quiet the longest (see needsAttention).
    supabase
      .from("contacts")
      .select("id, first_name, last_name, company, status, updated_at")
      .eq("organization_id", orgId)
      .not("status", "in", "(Won,Lost)")
      .order("updated_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (!cancelled) setQuiet((data ?? []) as AttentionContact[]);
      });
    // Weekly activity: follow-ups planned (created) and finished in the last weeks.
    const weekStarts = lastWeekStarts(todayISO(), WEEKS);
    const since = new Date(`${weekStarts[0]}T00:00:00`).toISOString();
    Promise.all([
      supabase.from("follow_ups").select("created_at").eq("organization_id", orgId).gte("created_at", since).limit(2000),
      supabase.from("follow_ups").select("completed_at").eq("organization_id", orgId).eq("status", "done").gte("completed_at", since).limit(2000),
    ]).then(([made, done]) => {
      if (cancelled) return;
      const madeAt = ((made.data ?? []) as { created_at: string }[]).map((r) => r.created_at);
      const doneAt = ((done.data ?? []) as { completed_at: string }[]).map((r) => r.completed_at).filter(Boolean);
      setActivity({ planned: countPerWeek(weekStarts, madeAt), finished: countPerWeek(weekStarts, doneAt) });
    });
    // Contacts won in the last months.
    const monthStarts = lastMonthStarts(todayISO(), MONTHS);
    supabase
      .from("contacts")
      .select("won_at")
      .eq("organization_id", orgId)
      .eq("status", "Won")
      .gte("won_at", new Date(`${monthStarts[0]}T00:00:00`).toISOString())
      .limit(1000)
      .then(({ data }) => {
        if (cancelled) return;
        setWonSeries(countPerMonth(monthStarts, ((data ?? []) as { won_at: string }[]).map((r) => r.won_at).filter(Boolean)));
      });
    return () => {
      cancelled = true;
    };
  }, [orgId, statsVersion]);

  const today = todayISO();
  const open = (followUps ?? [])
    .filter(
      (f) =>
        f.status === "open" &&
        (teamSize <= 1 || scope === "all" || f.assigned_to === user?.id || f.assigned_to === null)
    )
    .sort(compare);
  const groups: Record<Group, FollowUp[]> = {
    overdue: open.filter((f) => f.due_date < today),
    today: open.filter((f) => f.due_date === today),
    upcoming: open.filter((f) => f.due_date > today),
  };
  const attention = useMemo(
    () => needsAttention(quiet, new Set((followUps ?? []).filter((f) => f.status === "open").map((f) => f.contact_id))),
    [quiet, followUps]
  );
  const groupOf = (f: FollowUp): Group => (f.due_date < today ? "overdue" : f.due_date === today ? "today" : "upcoming");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("dash.morning") : hour < 18 ? t("dash.afternoon") : t("dash.evening");

  // Small series next to the numbers: real counts, never invented.
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 7));
  const next7 = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const openStages = FUNNEL.filter((st) => st !== "Won");
  const stats = [
    {
      label: t("dash.overdue"), value: groups.overdue.length, Icon: AlertCircle, caption: t("dash.stat.overdueCap"),
      chip: "from-[#F87171] to-[#D92D3A]", tone: "bg-red-300", accent: groups.overdue.length > 0 ? "text-overdue" : "text-ink",
      series: countPerDay(last7, groups.overdue.map((f) => f.due_date)),
    },
    {
      label: t("dash.dueToday"), value: groups.today.length, Icon: Clock, caption: t("dash.stat.todayCap"),
      chip: "from-[#6366F1] to-[#818CF8]", tone: "bg-indigo-300", accent: "text-ink",
      series: countPerDay(next7, open.map((f) => f.due_date)),
    },
    {
      label: t("dash.openLeads"), value: openLeads, Icon: Users, caption: t("dash.stat.leadsCap"),
      chip: "from-[#3B82F6] to-[#38BDF8]", tone: "bg-sky-300", accent: "text-ink",
      series: openStages.map((st) => (pipe ?? []).filter((c) => c.status === st).length),
    },
    {
      label: t("dash.wonThisMonth"), value: wonCount, Icon: Trophy, caption: t("dash.stat.wonCap"),
      chip: "from-[#10B981] to-[#34D399]", tone: "bg-emerald-300", accent: "text-ink",
      series: wonSeries ?? Array.from({ length: MONTHS }, () => 0),
    },
  ];

  const urgent = groups.overdue.length + groups.today.length;
  const summary =
    urgent === 0
      ? t("dash.count.none")
      : urgent === 1
      ? t("dash.count.one")
      : t("dash.count.many").replace("{n}", String(urgent));

  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const fullName = typeof meta?.full_name === "string" ? meta.full_name : typeof meta?.name === "string" ? meta.name : "";
  const firstName = fullName.trim().split(/\s+/)[0] ?? "";

  // The most pressing follow-ups, shown as a table.
  const rows = open.slice(0, 6);
  const weekStarts = useMemo(() => lastWeekStarts(todayISO(), WEEKS), []);
  const weekLabels = weekStarts.map((w) => {
    const [y, m, d] = w.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(locale, { day: "numeric", month: "short" });
  });
  const planned = activity?.planned ?? weekStarts.map(() => 0);
  const finished = activity?.finished ?? weekStarts.map(() => 0);
  const plannedTotal = planned.reduce((a, b) => a + b, 0);
  const finishedTotal = finished.reduce((a, b) => a + b, 0);

  async function complete(f: FollowUp) {
    setBusyId(f.id);
    const { error: failure } = await supabase
      .from("follow_ups")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", f.id);
    setBusyId("");
    if (!failure) {
      reload();
      notifyContactsChanged();
    }
  }

  // Calendar: follow-ups per day for the visible month.
  const byDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of open) m.set(f.due_date, (m.get(f.due_date) ?? 0) + 1);
    return m;
  }, [open]);
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const lead = (first.getDay() + 6) % 7; // week starts on Monday
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const out: (string | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= days; d++) out.push(toISODate(new Date(month.getFullYear(), month.getMonth(), d)));
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [month]);
  const weekdays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "narrow" })),
    [locale]
  );

  // Contacts per stage, for the donut and its legend.
  const funnel = FUNNEL.map((st) => ({ status: st, n: (pipe ?? []).filter((c) => c.status === st).length }));
  const funnelTotal = funnel.reduce((a, b) => a + b.n, 0);

  const tag: Record<Group, { text: string; cls: string }> = {
    overdue: { text: t("dash.tag.overdue"), cls: "bg-red-50 text-overdue" },
    today: { text: t("dash.tag.today"), cls: "bg-amber-50 text-amber-700" },
    upcoming: { text: t("dash.tag.soon"), cls: "bg-indigo-50 text-brand" },
  };
  const shortDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(locale, { day: "numeric", month: "short" });
  };
  const columns = "md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.3fr)_88px_104px_76px]";

  return (
    <main className="mx-auto max-w-[1360px] px-5 pb-12 pt-6 md:px-8">
      {/* Header: greeting on the left, controls on the right */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-extrabold leading-tight tracking-tight">
            {firstName ? `${greeting}, ${firstName}` : greeting}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{followUps === null ? t("dash.subtitle") : summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {teamSize > 1 && (
            <div role="group" className="inline-flex rounded-full bg-white p-1 text-sm font-semibold shadow-soft">
              {(["mine", "all"] as const).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setScope(sc)}
                  aria-pressed={scope === sc}
                  className={`min-h-[34px] rounded-full px-4 transition ${scope === sc ? "bg-ink text-white" : "text-slate-600"}`}
                >
                  {sc === "mine" ? t("dash.mine") : t("dash.all")}
                </button>
              ))}
            </div>
          )}
          <Link href="/followups/new" className="btn-dark !rounded-full px-5">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("nav.addFollowUp")}
          </Link>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-overdue">
          {t("dash.loadError")}
        </p>
      )}

      {followUps === null && !error && <DashboardSkeleton />}

      {followUps !== null && (
        <>
          <ExamplesBanner orgId={orgId} onChange={refreshAll} />

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-5">
              {/* Four numbers, each with a small series of real counts */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map(({ label, value, Icon, caption, chip, tone, accent, series }, i) => (
                  <div
                    key={label}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className="rounded-[28px] bg-white p-5 shadow-soft [animation:crm-fade_.4s_ease-out_both]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white ${chip}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <MiniBars values={series} tone={tone} />
                    </div>
                    <p className="mt-5 text-xs font-semibold text-slate-500">{label}</p>
                    <p className={`mt-1 text-[32px] font-extrabold leading-none tracking-tight ${accent}`}>{value ?? "–"}</p>
                    <p className="mt-2 text-xs text-slate-400">{caption}</p>
                  </div>
                ))}
              </div>

              {/* Weekly activity */}
              <section className={panel} aria-label={t("dash.activity.title")}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold">{t("dash.activity.title")}</h2>
                    <p className="mt-0.5 text-xs text-slate-500">{t("dash.activity.sub")}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#C7D0FF]" />{t("dash.activity.planned")}</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand" />{t("dash.activity.finished")}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <ActivityChart
                    labels={weekLabels}
                    planned={planned}
                    finished={finished}
                    ariaLabel={t("dash.activity.label").replace("{p}", String(plannedTotal)).replace("{f}", String(finishedTotal))}
                  />
                </div>
                {activity !== null && plannedTotal + finishedTotal === 0 && (
                  <p className="mt-2 text-center text-sm text-slate-500">{t("dash.activity.empty")}</p>
                )}
              </section>

              {/* Next up: the most pressing follow-ups */}
              <section className={panel} aria-label={t("dash.nextUp")}>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold">{t("dash.nextUp")}</h2>
                  <Link href="/contacts" className="text-sm font-semibold text-brand hover:underline">{t("dash.seeAll")}</Link>
                </div>

                {rows.length === 0 ? (
                  <GetStartedCard orgId={orgId} onChange={refreshAll}>
                    <div className="mt-4 rounded-3xl border border-dashed border-slate-300/70 bg-slate-50 p-10 text-center">
                      <p className="text-lg font-semibold">{t("dash.emptyTitle")}</p>
                      <p className="mt-1 text-slate-600">{t("dash.emptyText")}</p>
                      <Link href="/followups/new" className="btn-brand mt-5 !rounded-full px-6">
                        {t("nav.addFollowUp")}
                      </Link>
                    </div>
                  </GetStartedCard>
                ) : (
                  <>
                    <div className={`mt-3 hidden gap-4 pb-2 text-xs font-semibold text-slate-400 md:grid ${columns}`}>
                      <span>{t("dash.table.contact")}</span>
                      <span>{t("dash.table.note")}</span>
                      <span>{t("dash.table.due")}</span>
                      <span>{t("dash.table.status")}</span>
                      <span />
                    </div>
                    <ul>
                      {rows.map((f, i) => {
                        const g = groupOf(f);
                        return (
                          <li
                            key={f.id}
                            style={{ animationDelay: `${i * 50}ms` }}
                            className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-t border-slate-100 py-3 [animation:crm-fade_.4s_ease-out_both] md:gap-4 ${columns}`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#6366F1] to-[#3B82F6] text-xs font-bold text-white">
                                {initials(f.contact_name)}
                              </span>
                              <span className="min-w-0">
                                <Link href={`/contacts?c=${f.contact_id}`} className="block truncate text-sm font-semibold hover:text-brand">
                                  {f.contact_name}
                                </Link>
                                <span className="block truncate text-xs text-slate-500">{f.company || f.note || "—"}</span>
                                <span className="mt-1 flex items-center gap-2 md:hidden">
                                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tag[g].cls}`}>{tag[g].text}</span>
                                  <span className="text-xs text-slate-500">{shortDate(f.due_date)}{f.due_time ? ` · ${f.due_time}` : ""}</span>
                                </span>
                              </span>
                            </div>
                            <p className="hidden truncate text-sm text-slate-600 md:block">
                              {f.note || f.company || "—"}
                              {f.priority === "High" && <span className="ml-2 rounded-full bg-amber-50 px-1.5 text-[11px] font-bold text-amber-700">!</span>}
                            </p>
                            <p className="hidden text-sm text-slate-600 md:block">{shortDate(f.due_date)}</p>
                            <span className={`hidden w-fit rounded-full px-2.5 py-1 text-xs font-semibold md:inline-flex ${tag[g].cls}`}>{tag[g].text}</span>
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => complete(f)}
                                disabled={busyId === f.id}
                                aria-label={`${t("card.complete")}: ${f.contact_name}`}
                                title={t("card.complete")}
                                className={`${roundBtn} disabled:opacity-60`}
                              >
                                <Check className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <Link href={`/contacts?c=${f.contact_id}`} aria-label={f.contact_name} className={roundBtn}>
                                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                              </Link>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </section>
            </div>

            <aside className="min-w-0 space-y-5">
              {/* Contacts by stage */}
              <section className={panel} aria-label={t("dash.stages.title")}>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-bold">{t("dash.stages.title")}</h2>
                  <Link href="/pipeline" className={roundBtn} aria-label={t("nav.pipeline")}>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
                <div className="mt-3 flex justify-center">
                  <StageDonut
                    stages={funnel.map((f) => ({ key: f.status, value: f.n }))}
                    total={funnelTotal}
                    totalLabel={t("dash.stages.total")}
                    ariaLabel={`${t("dash.stages.title")}: ${funnelTotal}`}
                  />
                </div>
                {pipe !== null && funnelTotal === 0 && <p className="mt-2 text-center text-sm text-slate-500">{t("dash.funnelEmpty")}</p>}
                <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  {funnel.map((f) => (
                    <li key={f.status}>
                      <Link href={`/contacts?status=${encodeURIComponent(f.status)}`} className="flex items-center gap-2.5 rounded-lg transition hover:opacity-80">
                        <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: STAGE_COLOR[f.status] }} aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{t(("status." + f.status) as Key)}</span>
                          <span className="block text-xs tabular-nums text-slate-500">{pipe === null ? "–" : f.n}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Assistant */}
              <section className={panel} aria-label={t("dash.ai.title")}>
                <h2 className="text-base font-bold">{t("dash.ai.title")}</h2>
                <AiOrb />
                <p className="mt-4 text-center text-sm font-semibold">{t("dash.ai.help")}</p>
                <p className="mt-1 text-center text-xs text-slate-500">{t("dash.ai.note")}</p>
                <Link
                  href="/assistant"
                  className="mt-4 flex items-center gap-2 rounded-full bg-[#EEF0FF] p-1.5 pl-3 transition hover:bg-[#E4E8FF]"
                >
                  <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-white text-slate-500">
                    <Plus className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm text-slate-500">{t("dash.ai.ask")}</span>
                  <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-brand text-white">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </section>

              {attention.length > 0 && (
                <section className={panel} aria-label={t("dash.attention")}>
                  <h2 className="text-base font-bold">{t("dash.attention")}</h2>
                  <p className="mt-1 text-sm text-slate-600">{t("dash.attentionHelp")}</p>
                  <ul className="mt-3 space-y-1">
                    {attention.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/contacts?c=${c.id}`}
                          className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl px-2 text-sm transition hover:bg-slate-50"
                        >
                          <span className="min-w-0 truncate font-semibold">
                            {`${c.first_name} ${c.last_name}`.trim()}
                            {c.company ? <span className="font-normal text-slate-500"> · {c.company}</span> : null}
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-today">
                            {t("dash.quietDays").replace("{n}", String(c.days))}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className={panel}>
                <h2 className="text-base font-bold">{t("dash.schedule")}</h2>
                {groups.today.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-600">{t("dash.scheduleEmpty")}</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {groups.today.map((f) => (
                      <li key={f.id}>
                        <Link
                          href={`/contacts?c=${f.contact_id}`}
                          className="flex items-center gap-3 rounded-2xl bg-slate-50 p-2.5 transition hover:bg-[#EEF0FF]"
                        >
                          <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#6366F1] to-[#3B82F6] text-xs font-bold text-white">
                            {initials(f.contact_name)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{f.contact_name}</span>
                            <span className="block text-xs text-slate-500">{f.due_time || t("dash.anytime")}</span>
                          </span>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </aside>
          </div>

          {/* Calendar and the full list with all actions (snooze, delete) */}
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
            <section className={`${panel} self-start`} aria-label={t("dash.calendar")}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold capitalize">
                  {month.toLocaleDateString(locale, { month: "long", year: "numeric" })}
                </h2>
                <div className="flex gap-2">
                  <button type="button" className={roundBtn} aria-label="‹" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" className={roundBtn} aria-label="›" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold uppercase text-slate-400">
                {weekdays.map((w, i) => (
                  <span key={i}>{w}</span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1.5">
                {cells.map((iso, i) => {
                  if (!iso) return <span key={i} className="aspect-square lg:aspect-auto lg:h-9" />;
                  const n = byDay.get(iso) ?? 0;
                  const isToday = iso === today;
                  const late = n > 0 && iso < today;
                  return (
                    <span
                      key={iso}
                      title={n ? String(n) : undefined}
                      className={`relative grid aspect-square place-items-center rounded-xl text-xs font-semibold transition lg:aspect-auto lg:h-9 ${
                        isToday
                          ? "bg-gradient-to-br from-[#5B5BF0] to-[#3B82F6] text-white shadow-soft"
                          : late
                          ? "bg-navy text-white"
                          : n > 0
                          ? "bg-indigo-100 text-brand"
                          : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      {Number(iso.slice(8))}
                      {n > 1 && (
                        <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] font-bold text-brand shadow">
                          {n}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </section>

            {open.length > 0 && (
              <section className={panel} aria-label={t("dash.allFollowUps")}>
                <h2 className="text-base font-bold">{t("dash.allFollowUps")}</h2>
                {groups.today.length === 0 && <p className="mt-2 text-sm text-slate-600">{t("dash.nothingToday")}</p>}
                {order.map((g) => {
                  const list = groups[g];
                  if (list.length === 0) return null;
                  return (
                    <div key={g} className="mt-5">
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {t(groupLabel[g])}
                        <span className={`rounded-full px-2 py-0.5 text-xs ${badge[g]}`}>{list.length}</span>
                      </h3>
                      <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 2xl:grid-cols-2">
                        {list.map((item) => (
                          <FollowUpCard key={item.id} item={item} group={g} onChanged={reload} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            )}
          </div>
        </>
      )}
    </main>
  );
}

export default function Dashboard() {
  return (
    <RequireAuth>
      <DashboardView />
    </RequireAuth>
  );
}
