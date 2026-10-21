"use client";

import { useLanguage } from "@/components/language-provider";

export default function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex rounded-lg border p-0.5 text-xs font-semibold ${dark ? "border-white/15 bg-white/10" : "border-line bg-white"}`}
    >
      {(["en", "ro"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-md px-2.5 py-1 uppercase ${
            lang === l
              ? dark ? "bg-white text-ink" : "bg-ink text-white"
              : dark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-ink"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
