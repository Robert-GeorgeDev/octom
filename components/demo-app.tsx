"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, PenLine, RotateCcw, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { totalSteps } from "@/lib/cadences";
import { completeDemo, demoItems, snoozeDemo, type DemoItem } from "@/lib/demo";
import { formatDate, todayISO } from "@/lib/dates";
import { daysLabel, rankToday, type Reason } from "@/lib/priority";
import { fillTemplate } from "@/lib/templates";
import type { Key } from "@/lib/dictionaries";

const UI = {
  en: {
    note: "Example data. Nothing you do here is saved or sent, and a reload starts over.",
    reset: "Start over",
    later: "Coming up",
    empty: "Everything is done. This is what an empty list looks like.",
    msgTitle: "Message to start from",
    msgNote: "In the app this opens in WhatsApp or your email app. You edit it and send it yourself.",
    copy: "Copy",
    copied: "Copied",
    close: "Close",
    cta: "Like it? Try it with your own contacts",
    ctaText: "Free during beta, no card needed. You can import a CSV file.",
    start: "Start free",
  },
  ro: {
    note: "Date-exemplu. Nimic din ce faci aici nu se salvează sau trimite, iar la reîncărcare se pornește de la zero.",
    reset: "Începe de la zero",
    later: "Urmează",
    empty: "Totul e gata. Așa arată o listă goală.",
    msgTitle: "Mesaj de la care să pornești",
    msgNote: "În aplicație se deschide în WhatsApp sau în aplicația ta de email. Îl editezi și îl trimiți tu.",
    copy: "Copiază",
    copied: "Copiat",
    close: "Închide",
    cta: "Îți place? Încearcă-l cu propriile contacte",
    ctaText: "Gratuit în beta, fără card. Poți importa un fișier CSV.",
    start: "Începe gratuit",
  },
} as const;

type Undo = { items: DemoItem[]; message: string };

/** A small, working copy of the Today page on made-up data. No account, no server, nothing stored. */
export default function DemoApp() {
  const { lang, t } = useLanguage();
  const ro = lang === "ro";
  const ui = UI[ro ? "ro" : "en"];
  const locale = ro ? "ro-RO" : "en-GB";
  const [today, setToday] = useState<string | null>(null);
  const [items, setItems] = useState<DemoItem[]>([]);
  const [undo, setUndo] = useState<Undo | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Dates depend on the visitor's day, so they are made after the page has loaded.
  useEffect(() => {
    const d = todayISO();
    setToday(d);
    setItems(demoItems(d));
  }, []);

  if (!today) return <div className="mt-10 h-64 rounded-2xl bg-gray-50" aria-hidden="true" />;

  const ranked = rankToday(items.map((i) => ({ ...i, contact_name: i.name })), today);
  const upcoming = items.filter((i) => i.due_date > today).sort((a, b) => (a.due_date < b.due_date ? -1 : 1));

  function complete(id: string) {
    const out = completeDemo(items, id, today as string);
    if (!out) return;
    const message = out.next
      ? t("cad.scheduled").replace("{days}", daysLabel(out.gapDays ?? 0, ro ? "ro" : "en"))
      : t("toast.done");
    setUndo({ items, message });
    setItems(out.items);
    setOpen(null);
  }

  function snooze(id: string) {
    setUndo({ items, message: t("card.tomorrow") });
    setItems(snoozeDemo(items, id, today as string));
    setOpen(null);
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the text is selectable on the page */
    }
  }

  const chip = (r: Reason) => (
    <li
      key={r.key}
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        r.key === "overdue" ? "bg-red-50 text-red-700" : r.key === "closed" ? "bg-gray-100 text-gray-500" : "bg-indigo-50 text-brand"
      }`}
    >
      {t(`today.r.${r.key}` as Key).replace("{days}", daysLabel(r.n ?? 0, ro ? "ro" : "en"))}
    </li>
  );

  return (
    <section className="mt-10" aria-label="Demo">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">{ui.note}</p>
        <button
          type="button"
          onClick={() => {
            setItems(demoItems(today));
            setUndo(null);
            setOpen(null);
          }}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {ui.reset}
        </button>
      </div>

      <div aria-live="polite">
        {undo && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-sm text-white">
            <span className="min-w-0 flex-1">{undo.message}</span>
            <button
              type="button"
              onClick={() => {
                setItems(undo.items);
                setUndo(null);
              }}
              className="rounded-lg px-2.5 py-1.5 font-semibold text-indigo-300 hover:bg-white/10"
            >
              {t("toast.undo")}
            </button>
            <button type="button" onClick={() => setUndo(null)} aria-label={ui.close} className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <h2 className="mt-8 text-xs font-bold uppercase tracking-wide text-gray-400">{t("today.top")}</h2>
      {ranked.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-600">{ui.empty}</p>
      ) : (
        <ol className="mt-3 space-y-3">
          {ranked.map((f, i) => {
            const msg = open === f.id ? fillTemplate(f.template, ro ? "ro" : "en", { first_name: f.firstName }).text : "";
            return (
              <li key={f.id} className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-4 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <article className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="flex flex-wrap items-baseline gap-x-2 font-semibold">
                    <span>{f.name}</span>
                    <span className="text-sm font-normal text-gray-500">· {f.company}</span>
                  </p>
                  <ul aria-label={t("today.why")} className="mt-2 flex flex-wrap gap-1.5">
                    {f.reasons.slice(0, 4).map(chip)}
                  </ul>
                  {f.cadence && f.step !== undefined && (
                    <p className="mt-1.5 text-xs font-semibold text-brand">
                      {t("cad.chip")
                        .replace("{name}", t(`cad.name.${f.cadence}` as Key))
                        .replace("{n}", String(f.step))
                        .replace("{total}", String(totalSteps(f.cadence)))}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => complete(f.id)} className="min-h-[40px] rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-gray-800">
                      {t("card.complete")}
                    </button>
                    <button type="button" onClick={() => snooze(f.id)} className="min-h-[40px] rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold hover:bg-gray-50">
                      {t("card.snooze")}
                    </button>
                    <button
                      type="button"
                      aria-expanded={open === f.id}
                      onClick={() => setOpen(open === f.id ? null : f.id)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-sm font-semibold text-brand hover:bg-indigo-100"
                    >
                      <PenLine className="h-4 w-4" aria-hidden="true" />
                      {t("today.write")}
                    </button>
                  </div>
                  {open === f.id && (
                    <div className="mt-3 rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{ui.msgTitle}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{msg}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button type="button" onClick={() => copy(msg)} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold hover:bg-gray-50">
                          <Copy className="h-4 w-4" aria-hidden="true" />
                          {copied ? ui.copied : ui.copy}
                        </button>
                        <p className="text-xs text-gray-500">{ui.msgNote}</p>
                      </div>
                    </div>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="mt-10 text-xs font-bold uppercase tracking-wide text-gray-400">{ui.later}</h2>
          <ul className="mt-3 space-y-2">
            {upcoming.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-300 bg-white/60 px-4 py-3 text-sm">
                <span className="min-w-0 truncate font-semibold">
                  {f.name} <span className="font-normal text-gray-500">· {f.company}</span>
                </span>
                <span className="shrink-0 text-gray-600">{formatDate(f.due_date, locale)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <section className="mt-12 rounded-2xl bg-gray-50 p-6">
        <h2 className="text-lg font-semibold text-gray-900">{ui.cta}</h2>
        <p className="mt-1 text-gray-600">{ui.ctaText}</p>
        <Link href="/signup" className="mt-4 inline-block rounded-lg bg-brand px-5 py-3 text-sm font-medium text-white">
          {ui.start}
        </Link>
      </section>
    </section>
  );
}
