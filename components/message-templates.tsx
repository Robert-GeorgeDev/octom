"use client";

import { useState } from "react";
import { Copy, Mail, MessageCircle, RotateCcw } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { whatsappHref } from "@/lib/contact-utils";
import {
  TEMPLATE_IDS,
  fillTemplate,
  hasBlanks,
  type TemplateId,
  type TemplateLang,
} from "@/lib/templates";
import type { Key } from "@/lib/dictionaries";

const btn =
  "inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-sm font-semibold text-ink shadow-sm transition hover:border-brand/40 hover:text-brand";
const btnOff =
  "inline-flex min-h-[40px] cursor-not-allowed items-center gap-2 rounded-xl border border-dashed border-line bg-slate-50 px-3.5 text-sm font-semibold text-slate-400";

/**
 * Pick a situation, edit the text, then copy it or open it in WhatsApp or the email app.
 * The app never sends anything itself.
 */
export default function MessageTemplates({
  contact,
  onUse,
}: {
  contact: { first_name: string; email: string; phone: string };
  onUse: (kind: "email" | "message") => void;
}) {
  const { t, lang: uiLang } = useLanguage();
  const [id, setId] = useState<TemplateId>("offer");
  const [lang, setLang] = useState<TemplateLang>(uiLang === "ro" ? "ro" : "en");
  const [edited, setEdited] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const base = fillTemplate(id, lang, contact);
  const text = edited ?? base.text;
  const wa = whatsappHref(contact.phone, text);
  const mail = contact.email
    ? `mailto:${contact.email}?subject=${encodeURIComponent(base.subject)}&body=${encodeURIComponent(text)}`
    : "";

  function pick(next: TemplateId) {
    setId(next);
    setEdited(null);
  }
  function pickLang(next: TemplateLang) {
    setLang(next);
    setEdited(null);
  }

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
    <section aria-labelledby="tpl-title">
      <h3 id="tpl-title" className="text-base font-semibold">{t("tpl.title")}</h3>
      <p className="mt-1 text-sm text-slate-500">{t("tpl.subtitle")}</p>

      <div role="group" aria-label={t("tpl.situation")} className="mt-4 flex flex-wrap gap-2">
        {TEMPLATE_IDS.map((tid) => (
          <button
            key={tid}
            type="button"
            aria-pressed={id === tid}
            onClick={() => pick(tid)}
            className={`min-h-[36px] rounded-full px-3.5 text-sm font-semibold transition ${
              id === tid ? "bg-ink text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t(`tpl.n.${tid}` as Key)}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className="text-slate-500">{t("tpl.language")}</span>
        {(["ro", "en"] as const).map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={lang === l}
            onClick={() => pickLang(l)}
            className={`min-h-[32px] rounded-lg px-2.5 font-semibold uppercase transition ${
              lang === l ? "bg-slate-100 text-ink" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <label className="mt-4 block text-sm font-semibold" htmlFor="tpl-text">{t("tpl.message")}</label>
      <textarea
        id="tpl-text"
        value={text}
        onChange={(e) => setEdited(e.target.value)}
        rows={9}
        maxLength={2000}
        className="mt-1.5 w-full rounded-xl border border-line bg-white p-3 text-sm leading-relaxed outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      />

      {hasBlanks(text) && (
        <p role="status" className="mt-2 text-sm text-amber-700">{t("tpl.blanks")}</p>
      )}
      {failed && <p role="alert" className="mt-2 text-sm text-overdue">{t("common.error")}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={copy} className={btn}>
          <Copy className="h-4 w-4" aria-hidden="true" />
          {copied ? t("tpl.copied") : t("tpl.copy")}
        </button>
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => onUse("message")} className={btn}>
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {t("tpl.whatsapp")}
          </a>
        ) : (
          <span title={t("crm.addPhoneFirst")} aria-disabled="true" className={btnOff}>
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {t("tpl.whatsapp")}
          </span>
        )}
        {mail ? (
          <a href={mail} onClick={() => onUse("email")} className={btn}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            {t("tpl.email")}
          </a>
        ) : (
          <span title={t("crm.addEmailFirst")} aria-disabled="true" className={btnOff}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            {t("tpl.email")}
          </span>
        )}
        {edited !== null && (
          <button type="button" onClick={() => setEdited(null)} className="inline-flex min-h-[40px] items-center gap-1.5 px-2 text-sm font-semibold text-slate-500 hover:text-ink">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t("tpl.reset")}
          </button>
        )}
      </div>
    </section>
  );
}
