"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { TEMPLATE_IDS, fillTemplate, hasBlanks, type TemplateId, type TemplateLang } from "@/lib/templates";

const UI = {
  en: {
    situation: "Situation",
    name: "Their first name (optional)",
    namePh: "Maria",
    you: "Your name (optional)",
    youPh: "Alex",
    lang: "Message language",
    message: "Your message",
    copy: "Copy",
    copied: "Copied",
    blanks: "Fill in the parts in [square brackets] before you send.",
    failed: "Could not copy. Select the text and copy it by hand.",
    names: {
      offer: "After a proposal",
      "offer-late": "Proposal is late",
      invoice: "Invoice is due",
      quiet: "Gone quiet",
      meeting: "After a meeting",
      "no-answer": "No answer to a call",
      feedback: "Ask for feedback",
    } as Record<TemplateId, string>,
  },
  ro: {
    situation: "Situație",
    name: "Prenumele lui/ei (opțional)",
    namePh: "Maria",
    you: "Numele tău (opțional)",
    youPh: "Alex",
    lang: "Limba mesajului",
    message: "Mesajul tău",
    copy: "Copiază",
    copied: "Copiat",
    blanks: "Completează părțile din [paranteze pătrate] înainte să trimiți.",
    failed: "Nu am putut copia. Selectează textul și copiază-l manual.",
    names: {
      offer: "După o ofertă",
      "offer-late": "Oferta întârzie",
      invoice: "Factură scadentă",
      quiet: "A dispărut",
      meeting: "După o întâlnire",
      "no-answer": "Apel fără răspuns",
      feedback: "Cere o părere",
    } as Record<TemplateId, string>,
  },
} as const;

const input =
  "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

/** Free tool: pick a situation, get an editable message. Runs in the browser, stores and sends nothing. */
export default function MessageGenerator() {
  const { lang: pageLang } = useLanguage();
  const [id, setId] = useState<TemplateId>("offer");
  const [lang, setLang] = useState<TemplateLang>(pageLang === "ro" ? "ro" : "en");
  const [them, setThem] = useState("");
  const [you, setYou] = useState("");
  const [edited, setEdited] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const ui = UI[pageLang === "ro" ? "ro" : "en"];

  const base = fillTemplate(id, lang, { first_name: them.trim().slice(0, 60) });
  const signature = you.trim().slice(0, 60);
  const generated = signature ? `${base.text}\n${signature}` : base.text;
  const text = edited ?? generated;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div role="group" aria-label={ui.situation} className="flex flex-wrap gap-2">
        {TEMPLATE_IDS.map((tid) => (
          <button
            key={tid}
            type="button"
            aria-pressed={id === tid}
            onClick={() => {
              setId(tid);
              setEdited(null);
            }}
            className={`min-h-[40px] rounded-full px-4 text-sm font-semibold transition ${
              id === tid ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {ui.names[tid]}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="gen-them" className="block text-sm font-medium">{ui.name}</label>
          <input id="gen-them" value={them} maxLength={60} placeholder={ui.namePh} autoComplete="off"
            onChange={(e) => { setThem(e.target.value); setEdited(null); }} className={input} />
        </div>
        <div>
          <label htmlFor="gen-you" className="block text-sm font-medium">{ui.you}</label>
          <input id="gen-you" value={you} maxLength={60} placeholder={ui.youPh} autoComplete="off"
            onChange={(e) => { setYou(e.target.value); setEdited(null); }} className={input} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className="text-gray-600">{ui.lang}</span>
        {(["ro", "en"] as const).map((l) => (
          <button key={l} type="button" aria-pressed={lang === l}
            onClick={() => { setLang(l); setEdited(null); }}
            className={`min-h-[36px] rounded-lg px-3 font-semibold uppercase transition ${lang === l ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50"}`}>
            {l}
          </button>
        ))}
      </div>

      <label htmlFor="gen-text" className="mt-5 block text-sm font-medium">{ui.message}</label>
      <textarea id="gen-text" value={text} rows={10} maxLength={2000} onChange={(e) => setEdited(e.target.value)}
        className={`${input} leading-relaxed`} />
      {hasBlanks(text) && <p role="status" className="mt-2 text-sm text-amber-700">{ui.blanks}</p>}
      {failed && <p role="alert" className="mt-2 text-sm text-red-700">{ui.failed}</p>}

      <button type="button" onClick={copy}
        className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white hover:bg-brand-dark">
        <Copy className="h-4 w-4" aria-hidden="true" />
        {copied ? ui.copied : ui.copy}
      </button>
    </section>
  );
}
