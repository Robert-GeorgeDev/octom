"use client";

import Link from "next/link";
import { Gift } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

// Slim banner for the Early Feedback programme: a confirmed bug or an accepted
// idea earns one free month of Business through a 100% Stripe voucher. The rules
// are repeated on the contact form so the promise stays honest.
export default function FeedbackBanner({ showButton = true }: { showButton?: boolean }) {
  const { t } = useLanguage();
  return (
    <aside
      aria-label={t("banner.fb.title")}
      className="relative z-30 border-b border-white/10 bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#3B82F6] text-white"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/20">
            <Gift className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-sm leading-snug">
            <strong className="font-semibold">{t("banner.fb.title")}.</strong>{" "}
            <span className="text-white/90">{t("banner.fb.text")}</span>
          </p>
        </div>
        {showButton && (
          <Link
            href="/contact?topic=suggestion"
            className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#4F46E5] shadow-sm transition hover:bg-indigo-50"
          >
            {t("banner.fb.btn")}
          </Link>
        )}
      </div>
    </aside>
  );
}
