"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { addDays, formatDate, todayISO } from "@/lib/dates";
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

  function complete() {
    run(() =>
      supabase
        .from("follow_ups")
        .update({ status: "done", completed_at: new Date().toISOString() })
        .eq("id", item.id)
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
