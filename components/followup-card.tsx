"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { addDays, formatDate, todayISO } from "@/lib/dates";
import { isCadenceId, nextStep, totalSteps } from "@/lib/cadences";
import { daysLabel } from "@/lib/priority";
import { completeFollowUp } from "@/lib/cadence-run";
import type { Key } from "@/lib/dictionaries";
import { useLanguage } from "@/components/language-provider";
import type { FollowUp } from "@/types/followup";

export type Group = "overdue" | "today" | "upcoming";

const dots: Record<Group, string> = {
  overdue: "bg-overdue",
  today: "bg-today",
  upcoming: "bg-upcoming",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

export default function FollowUpCard({
  item,
  group,
  onChanged,
  extra,
}: {
  item: FollowUp;
  group: Group;
  onChanged: () => void;
  /** Optional extra content under the name (for example the reasons on the Today page). */
  extra?: React.ReactNode;
}) {
  const { t, lang } = useLanguage();
  const [mode, setMode] = useState<"none" | "snooze" | "custom">("none");
  const [customDate, setCustomDate] = useState(item.due_date);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function run(action: () => PromiseLike<{ error: unknown }>) {
    setBusy(true);
    setError("");
    const { error: failure } = await action();
    if (failure) {
      setError(t("common.error"));
    } else {
      setMode("none");
      onChanged();
    }
    setBusy(false);
  }

  async function complete() {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const result = await completeFollowUp(item);
      if (result === "done-next-failed") setError(t("cad.nextFailed"));
      else if (result === "done-next-scheduled" && isCadenceId(item.cadence) && item.cadence_step !== null) {
        const gap = nextStep(item.cadence, item.cadence_step)?.gapDays ?? 0;
        setInfo(t("cad.scheduled").replace("{days}", daysLabel(gap, lang === "ro" ? "ro" : "en")));
      }
      setMode("none");
      onChanged();
    } catch {
      setError(t("common.error"));
    }
    setBusy(false);
  }

  function stopCadence() {
    run(() =>
      supabase.from("follow_ups").update({ cadence: null, cadence_step: null }).eq("id", item.id)
    );
  }

  function moveTo(date: string) {
    if (!date) return;
    run(() =>
      supabase.from("follow_ups").update({ due_date: date }).eq("id", item.id)
    );
  }

  function remove() {
    if (!window.confirm(t("card.confirmDelete"))) return;
    run(() => supabase.from("follow_ups").delete().eq("id", item.id));
  }

  const locale = lang === "ro" ? "ro-RO" : "en-GB";

  return (
    <article className="min-w-0 rounded-2xl border border-line bg-white p-4 transition duration-200 hover:shadow-soft">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-bold text-ink"
        >
          {initials(item.contact_name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-semibold">
            <span className={`h-2 w-2 shrink-0 rounded-full ${dots[group]}`} aria-hidden="true" />
            <span className="truncate">{item.contact_name}</span>
            {item.company && <span className="truncate text-sm font-normal text-slate-500">· {item.company}</span>}
          </p>
          {item.note && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.note}</p>}
          {isCadenceId(item.cadence) && item.cadence_step !== null && (
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-brand">
              <span>
                {t("cad.chip")
                  .replace("{name}", t(`cad.name.${item.cadence}` as Key))
                  .replace("{n}", String(item.cadence_step))
                  .replace("{total}", String(totalSteps(item.cadence)))}
              </span>
              <button
                type="button"
                onClick={stopCadence}
                disabled={busy}
                className="text-slate-500 underline-offset-2 hover:text-ink hover:underline disabled:opacity-60"
              >
                {t("cad.stop")}
              </button>
            </p>
          )}
          {extra}
          {item.priority === "High" && (
            <p className="mt-1 text-xs font-semibold text-overdue">{t("card.high")}</p>
          )}
        </div>
        <div className="shrink-0 text-right text-sm">
          <p className="font-medium">{formatDate(item.due_date, locale)}</p>
          {item.due_time && <p className="text-slate-500">{item.due_time}</p>}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-overdue">
          {error}
        </p>
      )}
      {info && (
        <p role="status" className="mt-3 rounded-xl bg-brand-soft px-3 py-2 text-sm text-brand">
          {info}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 pl-[52px]">
        <button
          type="button"
          onClick={complete}
          disabled={busy}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {t("card.complete")}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "none" ? "snooze" : "none")}
          disabled={busy}
          className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50 disabled:opacity-60"
        >
          {t("card.snooze")}
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="px-2 py-2 text-sm font-semibold text-overdue hover:underline disabled:opacity-60"
        >
          {t("card.delete")}
        </button>
      </div>

      {mode !== "none" && (
        <div className="ml-[52px] mt-3 rounded-xl bg-surface p-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => moveTo(addDays(todayISO(), 1))}
              className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:bg-brand-soft disabled:opacity-60"
            >
              {t("card.tomorrow")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => moveTo(addDays(todayISO(), 7))}
              className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:bg-brand-soft disabled:opacity-60"
            >
              {t("card.nextWeek")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setMode("custom")}
              className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:bg-brand-soft disabled:opacity-60"
            >
              {t("card.pickDate")}
            </button>
          </div>

          {mode === "custom" && (
            <div className="mt-3 flex items-center gap-2">
              <label htmlFor={`date-${item.id}`} className="sr-only">
                {t("card.newDate")}
              </label>
              <input
                id={`date-${item.id}`}
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <button
                type="button"
                disabled={busy || !customDate}
                onClick={() => moveTo(customDate)}
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {t("card.save")}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
