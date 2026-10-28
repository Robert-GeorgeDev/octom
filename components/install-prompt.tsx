"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const STORE = "octom.install-dismissed";
const QUIET_DAYS = 30;

function recentlyDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(STORE));
    return Number.isFinite(at) && at > 0 && Date.now() - at < QUIET_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

/**
 * A quiet offer to install the app, shown only when the browser says it can (Chrome on Android
 * and desktop). After "Not now" it stays away for 30 days. Browsers without the event show nothing.
 */
export default function InstallPrompt() {
  const { t } = useLanguage();
  const [event, setEvent] = useState<InstallEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      if (!recentlyDismissed()) setEvent(e as InstallEvent);
    };
    const onInstalled = () => setEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!event) return null;

  function later() {
    try {
      localStorage.setItem(STORE, String(Date.now()));
    } catch {
      /* storage unavailable: it will simply show again next visit */
    }
    setEvent(null);
  }

  async function install() {
    try {
      await event?.prompt();
      await event?.userChoice;
    } catch {
      /* the browser refused: nothing to do */
    }
    setEvent(null);
  }

  return (
    <section
      aria-label={t("install.title")}
      className="fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-lift [animation:crm-fade_.3s_ease-out] md:inset-x-auto md:bottom-6 md:right-6 md:mx-0"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
        <Download className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{t("install.title")}</p>
        <p className="text-xs text-slate-500">{t("install.text")}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <button type="button" onClick={install} className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">
          {t("install.button")}
        </button>
        <button type="button" onClick={later} className="rounded-lg px-3 py-1 text-xs font-semibold text-slate-500 hover:text-ink">
          {t("install.later")}
        </button>
      </div>
    </section>
  );
}
