"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { forgottenCost, parseAmount } from "@/lib/tools";

const UI = {
  en: {
    value: "What is a client worth to you?",
    valueHelp: "The average value of one client or project, in the currency below.",
    quiet: "How many clients or leads go quiet each month?",
    quietHelp: "People you did not follow up with, or followed up too late.",
    share: "What share would a follow-up win back? (%)",
    shareHelp: "Your own estimate, for example from the last clients you did follow up with.",
    currency: "Currency",
    resultTitle: "What your numbers add up to",
    month: "per month",
    year: "per year",
    clients: "clients won back per year",
    note: "This is arithmetic on the numbers you entered, not a forecast. Nothing you type leaves your browser.",
    empty: "Fill in the three numbers to see the result.",
    invalid: "Check the numbers: use positive values, and a share between 1 and 100.",
  },
  ro: {
    value: "Cât valorează un client pentru tine?",
    valueHelp: "Valoarea medie a unui client sau proiect, în moneda de mai jos.",
    quiet: "Câți clienți sau lead-uri tac în fiecare lună?",
    quietHelp: "Oameni cărora nu le-ai făcut follow-up sau le-ai făcut prea târziu.",
    share: "Ce cotă ar recâștiga un follow-up? (%)",
    shareHelp: "Estimarea ta, de exemplu pornind de la ultimii clienți cărora le-ai făcut follow-up.",
    currency: "Moneda",
    resultTitle: "Ce rezultă din cifrele tale",
    month: "pe lună",
    year: "pe an",
    clients: "clienți recâștigați pe an",
    note: "Este aritmetică pe cifrele introduse de tine, nu o prognoză. Nimic din ce scrii nu părăsește browserul.",
    empty: "Completează cele trei cifre ca să vezi rezultatul.",
    invalid: "Verifică cifrele: folosește valori pozitive și o cotă între 1 și 100.",
  },
} as const;

const input =
  "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

/** Free tool: multiplies three numbers the visitor types. No built-in averages; nothing is stored or sent. */
export default function ForgottenCost() {
  const { lang } = useLanguage();
  const ro = lang === "ro";
  const ui = UI[ro ? "ro" : "en"];
  const [value, setValue] = useState("");
  const [quiet, setQuiet] = useState("");
  const [share, setShare] = useState("");
  const [currency, setCurrency] = useState(ro ? "RON" : "EUR");

  const all = value.trim() !== "" && quiet.trim() !== "" && share.trim() !== "";
  const result = forgottenCost({ value: parseAmount(value), quietPerMonth: parseAmount(quiet), sharePercent: parseAmount(share) });

  const money = (n: number) =>
    new Intl.NumberFormat(ro ? "ro-RO" : "en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  const count = (n: number) =>
    new Intl.NumberFormat(ro ? "ro-RO" : "en-GB", { maximumFractionDigits: 1 }).format(n);

  const field = (id: string, label: string, help: string, v: string, set: (s: string) => void, ph: string) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <input id={id} inputMode="decimal" autoComplete="off" value={v} placeholder={ph} aria-describedby={`${id}-help`}
        onChange={(e) => set(e.target.value)} className={input} />
      <p id={`${id}-help`} className="mt-1 text-xs text-gray-500">{help}</p>
    </div>
  );

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("cost-value", ui.value, ui.valueHelp, value, setValue, "1500")}
        {field("cost-quiet", ui.quiet, ui.quietHelp, quiet, setQuiet, "4")}
        {field("cost-share", ui.share, ui.shareHelp, share, setShare, "10")}
        <div>
          <label htmlFor="cost-currency" className="block text-sm font-medium">{ui.currency}</label>
          <select id="cost-currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={input}>
            {["RON", "EUR", "USD", "GBP"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div aria-live="polite" className="mt-6 rounded-xl bg-gray-50 p-5">
        {result ? (
          <>
            <p className="text-sm font-medium text-gray-700">{ui.resultTitle}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {money(result.perMonth)} <span className="text-base font-normal text-gray-500">{ui.month}</span>
            </p>
            <p className="mt-1 text-xl font-semibold">
              {money(result.perYear)} <span className="text-base font-normal text-gray-500">{ui.year}</span>
            </p>
            <p className="mt-1 text-sm text-gray-600">{count(result.clientsPerYear)} {ui.clients}</p>
          </>
        ) : (
          <p className="text-sm text-gray-600">{all ? ui.invalid : ui.empty}</p>
        )}
        <p className="mt-3 text-xs text-gray-500">{ui.note}</p>
      </div>
    </section>
  );
}
