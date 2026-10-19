"use client";

import { useCallback, useEffect, useState } from "react";
import SitePage from "@/components/site-page";
import { useLanguage } from "@/components/language-provider";

type State = "checking" | "up" | "down";
type Health = { website: State; app: State; database: State; checkedAt: string | null };

const START: Health = { website: "checking", app: "checking", database: "checking", checkedAt: null };

export default function StatusView() {
  const { lang } = useLanguage();
  const ro = lang === "ro";
  const [h, setH] = useState<Health>(START);

  const check = useCallback(async () => {
    setH((p) => ({ ...p, website: "checking", app: "checking", database: "checking" }));
    let website: State = "down";
    let database: State = "down";
    let app: State = "down";
    let checkedAt: string | null = null;
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (res.ok) {
        const j = await res.json();
        website = j.website ? "up" : "down";
        database = j.database ? "up" : "down";
        app = j.app ? "up" : "down";
        checkedAt = j.checkedAt ?? null;
      }
    } catch {}
    setH({ website, app, database, checkedAt });
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  const rows: { key: keyof Omit<Health, "checkedAt">; en: string; ro: string; hintEn: string; hintRo: string }[] = [
    { key: "website", en: "Website", ro: "Site", hintEn: "octom.eu", hintRo: "octom.eu" },
    { key: "app", en: "App", ro: "Aplicația", hintEn: "one.octom.eu", hintRo: "one.octom.eu" },
    { key: "database", en: "Database and sign-in", ro: "Baza de date și autentificarea", hintEn: "Your contacts and accounts", hintRo: "Contactele și conturile tale" },
  ];
  const states = rows.map((r) => h[r.key]);
  const checking = states.includes("checking");
  const allUp = states.every((s) => s === "up");

  const label = (s: State) =>
    s === "up" ? (ro ? "Funcționează" : "Operational") : s === "down" ? (ro ? "Probleme" : "Issue detected") : ro ? "Se verifică…" : "Checking…";
  const dot = (s: State) => (s === "up" ? "bg-emerald-500" : s === "down" ? "bg-red-500" : "bg-slate-300");
  const text = (s: State) => (s === "up" ? "text-emerald-700" : s === "down" ? "text-red-700" : "text-slate-500");

  return (
    <SitePage
      title="Status"
      titleRo="Status"
      intro="Live check of the parts of OCTOM One that you depend on."
      introRo="Verificare în timp real a părților din OCTOM One de care depinzi."
    >
      <div className="max-w-3xl">
        <div
          role="status"
          className={`rounded-2xl border px-5 py-4 text-lg font-semibold ${
            checking
              ? "border-line bg-white text-slate-600"
              : allUp
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {checking
            ? ro ? "Se verifică serviciile…" : "Checking services…"
            : allUp
              ? ro ? "Toate sistemele funcționează" : "All systems operational"
              : ro ? "Unele servicii au probleme" : "Some services have issues"}
        </div>

        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">
          {rows.map((r) => (
            <li key={r.key} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-semibold text-ink">{ro ? r.ro : r.en}</p>
                <p className="text-sm text-slate-500">{ro ? r.hintRo : r.hintEn}</p>
              </div>
              <span className={`flex items-center gap-2 text-sm font-semibold ${text(h[r.key])}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${dot(h[r.key])}`} aria-hidden="true" />
                {label(h[r.key])}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <p>
            {h.checkedAt
              ? `${ro ? "Ultima verificare" : "Last checked"}: ${new Date(h.checkedAt).toLocaleTimeString(ro ? "ro-RO" : "en-GB")}`
              : ""}
          </p>
          <button
            type="button"
            onClick={() => void check()}
            className="rounded-xl border border-line bg-white px-4 py-2 font-semibold text-ink hover:bg-brand-soft"
          >
            {ro ? "Verifică din nou" : "Check again"}
          </button>
        </div>

        <p className="mt-8 text-sm text-slate-600">
          {ro
            ? "Verificarea se face acum, din browserul tău. Dacă vezi probleme care persistă, scrie-ne pe pagina de contact."
            : "This check runs now, from your browser. If a problem persists, write to us on the contact page."}
        </p>
      </div>
    </SitePage>
  );
}
