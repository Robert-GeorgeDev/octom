"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import ContactDetail from "@/components/contact-detail";
import { useLanguage } from "@/components/language-provider";

/** Slide-over panel with the full contact. Closes with Esc, the backdrop or the X. */
export default function ContactDrawer({
  id, orgId, onClose, onChanged,
}: {
  id: string;
  orgId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { t } = useLanguage();
  const [shown, setShown] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prev;
    };
  }, []);

  const close = useCallback(() => {
    setShown(false);
    window.setTimeout(onClose, 260);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={t("crm.contactPanel")}>
      <button
        type="button"
        aria-label={t("crm.close")}
        onClick={close}
        className={`absolute inset-0 cursor-default bg-navy/40 backdrop-blur-[2px] transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panel}
        tabIndex={-1}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[1000px] flex-col bg-white shadow-2xl outline-none transition-transform duration-[320ms] ease-[cubic-bezier(.22,1,.36,1)] sm:rounded-l-3xl ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5 sm:px-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("crm.contactPanel")}</p>
          <button
            type="button"
            onClick={close}
            aria-label={t("crm.close")}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <ContactDetail
            id={id}
            orgId={orgId}
            variant="drawer"
            onOpenFull={`/contacts/${id}`}
            onDeleted={() => {
              onChanged();
              close();
            }}
          />
        </div>
      </div>
    </div>
  );
}
