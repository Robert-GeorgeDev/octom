"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";
import type { Key } from "@/lib/dictionaries";

const TOPICS = ["bug", "suggestion", "other"] as const;

/** Button in the app that opens a small window to send a bug report or an idea. Goes to the same inbox as the contact form. */
export default function FeedbackButton({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("suggestion");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const area = useRef<HTMLTextAreaElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    area.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    if (state === "sent") {
      setMessage("");
      setState("idle");
    }
    opener.current?.focus();
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email || message.trim().length < 10) return;
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.email.split("@")[0],
          email: user.email,
          message,
          category: topic,
          source: "app",
          page: pathname,
          website: "",
        }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (!user?.email) return null;

  return (
    <>
      <button
        ref={opener}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("fb.button")}
        className={
          compact
            ? "grid h-11 w-11 place-items-center rounded-xl text-slate-600"
            : "inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 text-sm font-semibold text-ink shadow-soft backdrop-blur hover:bg-white"
        }
      >
        <MessageSquare className="h-4 w-4" aria-hidden="true" />
        {!compact && t("fb.button")}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-end bg-ink/50 p-0 sm:place-items-center sm:p-4" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fb-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="fb-title" className="text-lg font-semibold">{t("fb.title")}</h2>
              <button type="button" onClick={close} aria-label={t("fb.close")} className="grid h-9 w-9 place-items-center rounded-full text-slate-600 hover:bg-slate-100">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {state === "sent" ? (
              <>
                <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{t("fb.thanks")}</p>
                <button type="button" onClick={close} className="btn-brand mt-5 w-full">{t("fb.close")}</button>
              </>
            ) : (
              <form onSubmit={send} className="mt-4 space-y-4">
                <p className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-slate-700">{t("banner.fb.text")}</p>
                <div role="group" aria-label={t("contact.category")} className="flex flex-wrap gap-2">
                  {TOPICS.map((k) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={topic === k}
                      onClick={() => setTopic(k)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${topic === k ? "border-ink bg-ink text-white" : "border-line bg-white text-slate-700"}`}
                    >
                      {t(`contact.cat.${k}` as Key)}
                    </button>
                  ))}
                </div>
                <div>
                  <label htmlFor="fb-message" className="block text-sm font-medium">{t("fb.message")}</label>
                  <textarea
                    id="fb-message"
                    ref={area}
                    rows={5}
                    required
                    minLength={10}
                    maxLength={3000}
                    placeholder={t("fb.placeholder")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  <p className="mt-1 text-xs text-slate-500">{t("fb.note")}</p>
                </div>
                {state === "error" && (
                  <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-overdue">{t("fb.error")}</p>
                )}
                <button type="submit" disabled={state === "sending" || message.trim().length < 10} className="btn-brand w-full">
                  {state === "sending" ? t("fb.sending") : t("fb.send")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
