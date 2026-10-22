"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Clock, Plus, Sparkles, Trophy, Users } from "lucide-react";
import RequireAuth from "@/components/require-auth";
import LoadingScreen from "@/components/loading-screen";
import FollowUpCard, { type Group } from "@/components/followup-card";
import { useLanguage } from "@/components/language-provider";
import { useOrgId } from "@/hooks/use-org-id";
import { useAuth } from "@/components/auth-provider";
import { useFollowUps } from "@/hooks/use-followups";
import { notifyContactsChanged } from "@/hooks/use-contact-counts";
import { supabase } from "@/lib/supabase";
import { addDays, formatDate, toISODate, todayISO } from "@/lib/dates";
import { initials, needsAttention, type AttentionContact } from "@/lib/contact-utils";
import type { Key } from "@/lib/dictionaries";
import type { FollowUp } from "@/types/followup";
import { STATUSES, type Status } from "@/types/contact";
import { GetStartedCard, ExamplesBanner } from "@/components/get-started";

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

/** Frosted glass panel used for every section of the dashboard. */
const glass =
  "rounded-[28px] border border-white/70 bg-white/55 shadow-[0_10px_40px_-14px_rgba(79,70,229,.18)] backdrop-blur-xl";

/** Round icon button, like the controls in the reference design. */
const roundBtn =
  "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/80 bg-white/60 text-slate-700 transition duration-200 hover:bg-white hover:text-brand";

function compare(a: FollowUp, b: FollowUp): number {
  if (a.due_date !== b.due_date) return a.due_date < b.due_date ? -1 : 1;
  return (a.due_time || "99:99").localeCompare(b.due_time || "99:99");
}

/** Tile colours: dark for overdue, brand gradient for today, soft glass for later. */
const tile: Record<Group, { box: string; sub: string; chip: string; ring: string }> = {
  overdue: { box: "bg-navy text-white", sub: "text-white/65", chip: "bg-white/15 text-white", ring: "border-white/30 text-white hover:bg-white hover:text-navy" },
  today: { box: "bg-gradient-to-br from-[#5B5BF0] to-[#3B82F6] text-white", sub: "text-white/75", chip: "bg-white/20 text-white", ring: "border-white/40 text-white hover:bg-white hover:text-brand" },
  upcoming: { box: "border border-white/80 bg-white/70 text-ink", sub: "text-slate-500", chip: "bg-slate-100 text-slate-600", ring: "border-slate-200 text-slate-600 hover:bg-brand hover:text-white" },
};

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

  const stats = [
    { label: t("dash.overdue"), value: groups.overdue.length, Icon: AlertCircle, accent: groups.overdue.length > 0 ? "text-overdue" : "text-ink" },
    { label: t("dash.dueToday"), value: groups.today.length, Icon: Clock, accent: "text-ink" },
    { label: t("dash.openLeads"), value: openLeads, Icon: Users, accent: "text-ink" },
    { label: t("dash.wonThisMonth"), value: wonCount, Icon: Trophy, accent: "text-ink" },
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

  // The six most pressing follow-ups, shown as tiles.
  const tiles = open.slice(0, 6);

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

  // Funnel: number of contacts per stage, widest at the top.
  const funnel = FUNNEL.map((s) => ({ status: s, n: (pipe ?? []).filter((c) => c.status === s).length }));
  const funnelTotal = funnel.reduce((a, b) => a + b.n, 0);
  const funnelMax = Math.max(1, ...funnel.map((f) => f.n));
  const funnelTone = ["bg-white/80", "bg-indigo-100/90", "bg-indigo-200/90", "bg-[#A5B4FC]", "bg-[#818CF8] text-white", "bg-brand text-white"];

  return (
    <main className="mx-auto max-w-[1360px] px-5 pb-12 pt-6 md:px-8">
      {/* Header: greeting on the left, key numbers on the right */}
      <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
        <div className="min-w-0">
          <h1 className="text-[34px] font-bold leading-[1.1] tracking-tight sm:text-[42px]">
            {firstName ? `${greeting},` : greeting}
            {firstName && <span className="block">{firstName}.</span>}
          </h1>
          <p className="mt-2 text-base text-slate-500">{followUps === null ? t("dash.subtitle") : summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 lg:flex lg:pt-2">
          {stats.map(({ label, value, Icon, accent }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/80 bg-white/60 text-slate-700 backdrop-blur">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className={`text-[26px] font-bold leading-none tracking-tight ${accent}`}>{value ?? "–"}</p>
                <p className="mt-1 truncate text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {teamSize > 1 && (
          <div role="group" className="inline-flex rounded-full border border-white/80 bg-white/60 p-1 text-sm font-semibold backdrop-blur">
            {(["mine", "all"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                aria-pressed={scope === s}
                className={`min-h-[34px] rounded-full px-4 transition ${scope === s ? "bg-ink text-white" : "text-slate-600"}`}
              >
                {s === "mine" ? t("dash.mine") : t("dash.all")}
              </button>
            ))}
          </div>
        )}
        <Link href="/followups/new" className="btn-dark !rounded-full px-5 sm:ml-auto">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("nav.addFollowUp")}
        </Link>
      </div>


      {error && (
        <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-overdue">
          {t("dash.loadError")}
        </p>
      )}

      {followUps === null && !error && (
        <div className="mt-8">
          <LoadingScreen />
        </div>
      )}

      {followUps !== null && (
        <>
          <ExamplesBanner orgId={orgId} onChange={refreshAll} />
          {/* Next up: colourful tiles */}
          <section className={`${glass} mt-6 p-5 sm:p-6`} aria-label={t("dash.nextUp")}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{t("dash.nextUp")}</h2>
              <Link href="/contacts" className={roundBtn} aria-label={t("nav.contacts")}>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {tiles.length === 0 ? (
              <GetStartedCard orgId={orgId} onChange={refreshAll}>
              <div className="mt-4 rounded-3xl border border-dashed border-slate-300/70 bg-white/40 p-10 text-center">
                <p className="text-lg font-semibold">{t("dash.emptyTitle")}</p>
                <p className="mt-1 text-slate-600">{t("dash.emptyText")}</p>
                <Link href="/followups/new" className="btn-brand mt-5 !rounded-full px-6">
                  {t("nav.addFollowUp")}
                </Link>
              </div>
              </GetStartedCard>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {tiles.map((f, i) => {
                  const g = groupOf(f);
                  const c = tile[g];
                  return (
                    <li
                      key={f.id}
                      style={{ animationDelay: `${i * 60}ms` }}
                      className={`group relative flex min-h-[132px] flex-col justify-between rounded-3xl p-4 shadow-soft transition duration-300 [animation:crm-fade_.4s_ease-out_both] hover:-translate-y-0.5 hover:shadow-lift ${c.box}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-xs ${c.sub}`}>
                            {formatDate(f.due_date, locale)}
                            {f.due_time ? ` · ${f.due_time}` : ""}
                          </p>
                          <Link
                            href={`/contacts?c=${f.contact_id}`}
                            className="mt-1 block truncate text-[15px] font-semibold after:absolute after:inset-0 after:rounded-3xl"
                          >
                            {f.contact_name}
                          </Link>
                          <p className={`mt-0.5 line-clamp-2 text-sm ${c.sub}`}>{f.note || f.company || "—"}</p>
                        </div>
                        <span aria-hidden="true" className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition ${c.ring}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>

                      <div className="mt-4 flex items-end justify-between">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.chip}`}>
                          {g === "overdue" ? t("dash.tag.overdue") : g === "today" ? t("dash.tag.today") : t("dash.tag.soon")}
                          {f.priority === "High" ? " · !" : ""}
                        </span>
                        <button
                          type="button"
                          onClick={() => complete(f)}
                          disabled={busyId === f.id}
                          aria-label={`${t("card.complete")}: ${f.contact_name}`}
                          title={t("card.complete")}
                          className={`relative z-10 grid h-9 w-9 place-items-center rounded-full border transition disabled:opacity-60 ${c.ring}`}
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Calendar, funnel and today's side column */}
          <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px]">
            <section className={`${glass} p-5 sm:p-6`} aria-label={t("dash.calendar")}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold capitalize">
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
                  if (!iso) return <span key={i} className="aspect-square lg:aspect-auto lg:h-8" />;
                  const n = byDay.get(iso) ?? 0;
                  const isToday = iso === today;
                  const late = n > 0 && iso < today;
                  return (
                    <span
                      key={iso}
                      title={n ? String(n) : undefined}
                      className={`relative grid aspect-square place-items-center rounded-lg text-xs lg:aspect-auto lg:h-8 font-semibold transition ${
                        isToday
                          ? "bg-gradient-to-br from-[#5B5BF0] to-[#3B82F6] text-white shadow-soft"
                          : late
                          ? "bg-navy text-white"
                          : n > 0
                          ? "bg-indigo-100 text-brand"
                          : "bg-white/50 text-slate-500"
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

            <section className={`${glass} p-5 sm:p-6`} aria-label={t("dash.funnel")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold">{t("dash.funnel")}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    <span className="text-2xl font-bold text-ink">{pipe === null ? "–" : funnelTotal}</span> {t("dash.inPipeline")}
                  </p>
                </div>
                <Link href="/pipeline" className={roundBtn} aria-label={t("nav.pipeline")}>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {pipe !== null && funnelTotal === 0 ? (
                <p className="mt-6 text-sm text-slate-600">{t("dash.funnelEmpty")}</p>
              ) : (
                <ul className="mt-5 space-y-2">
                  {funnel.map((f, i) => (
                    <li key={f.status} className="flex justify-center">
                      <Link
                        href={`/contacts?status=${encodeURIComponent(f.status)}`}
                        style={{ width: `${Math.max(46, 100 - i * 9)}%`, animationDelay: `${i * 70}ms` }}
                        className={`flex min-h-[44px] items-center justify-between gap-3 rounded-full px-4 text-sm font-semibold transition duration-200 [animation:crm-fade_.4s_ease-out_both] hover:scale-[1.02] hover:shadow-soft ${funnelTone[i]} ${funnelTone[i].includes("text-white") ? "" : "text-ink"}`}
                      >
                        <span className="truncate">{t(("status." + f.status) as Key)}</span>
                        <span className="tabular-nums">{f.n}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <span className="sr-only">{funnelMax}</span>
            </section>

            <aside className="space-y-5 lg:col-span-2 xl:col-span-1">
              {attention.length > 0 && (
                <section className={`${glass} p-5 sm:p-6`} aria-label={t("dash.attention")}>
                  <h2 className="text-base font-semibold">{t("dash.attention")}</h2>
                  <p className="mt-1 text-sm text-slate-600">{t("dash.attentionHelp")}</p>
                  <ul className="mt-3 space-y-1">
                    {attention.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/contacts?c=${c.id}`}
                          className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl px-2 text-sm transition hover:bg-white/60"
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
              <section className={`${glass} p-5 sm:p-6`}>
                <h2 className="text-base font-semibold">{t("dash.schedule")}</h2>
                {groups.today.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-600">{t("dash.scheduleEmpty")}</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {groups.today.map((f) => (
                      <li key={f.id}>
                        <Link
                          href={`/contacts?c=${f.contact_id}`}
                          className="flex items-center gap-3 rounded-2xl bg-white/60 p-2.5 transition hover:bg-white"
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

              <Link
                href="/assistant"
                className="group relative block overflow-hidden rounded-[28px] bg-navy p-6 text-white shadow-lift transition duration-300 hover:-translate-y-0.5"
              >
                <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#6366F1]/40 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
                <span className="relative flex items-center gap-2 font-semibold">
                  <Sparkles className="h-4 w-4 text-indigo-300" aria-hidden="true" />
                  {t("chat.title")}
                </span>
                <span className="relative mt-2 block text-sm text-slate-300">{t("chat.subtitle")}</span>
                <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-200">
                  {t("dash.seeAll")} <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </aside>
          </div>

          {/* Full list with all actions (snooze, delete) */}
          {open.length > 0 && (
            <section className={`${glass} mt-5 p-5 sm:p-6`} aria-label={t("dash.allFollowUps")}>
              <h2 className="text-base font-semibold">{t("dash.allFollowUps")}</h2>
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
                    <div className="grid gap-2.5 xl:grid-cols-2">
                      {list.map((item) => (
                        <FollowUpCard key={item.id} item={item} group={g} onChanged={reload} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          )}
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
