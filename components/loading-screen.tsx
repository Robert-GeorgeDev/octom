"use client";

import Mark from "@/components/mark";
import { useLanguage } from "@/components/language-provider";

/** Full-area loading state: the Octom mark floats gently above a soft shadow. */
export default function LoadingScreen() {
  const { t } = useLanguage();
  return (
    <div role="status" aria-live="polite" className="grid min-h-[60vh] place-items-center px-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <span aria-hidden="true" className="absolute -inset-6 rounded-full bg-indigo-200/40 blur-2xl" />
          <Mark className="octom-float relative h-20 w-20" />
        </div>
        <span aria-hidden="true" className="octom-shadow h-2 w-14 rounded-full bg-indigo-300/40 blur-sm" />
        <p className="text-sm font-semibold text-slate-500">{t("common.loading")}</p>
      </div>
    </div>
  );
}
