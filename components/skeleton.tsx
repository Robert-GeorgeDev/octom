"use client";

import { useLanguage } from "@/components/language-provider";

/** One grey block with a soft moving shine. Decorative; the wrapper announces "Loading". */
export function Sk({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`octom-sk block ${className}`} />;
}

function Frame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { t } = useLanguage();
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{t("common.loading")}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

const card = "rounded-3xl border border-white/70 bg-white/60 p-5 shadow-sm sm:p-6";

function Row() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white/70 p-4">
      <Sk className="h-10 w-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Sk className="h-3.5 w-2/5 rounded-full" />
        <Sk className="h-3 w-3/5 rounded-full" />
      </div>
      <Sk className="h-6 w-16 rounded-full" />
    </div>
  );
}

/** Dashboard: four number cards, a chart panel and a short table. */
export function DashboardSkeleton() {
  return (
    <Frame className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-[28px] bg-white p-5 shadow-soft">
              <Sk className="h-11 w-11 rounded-2xl" />
              <Sk className="mt-5 h-3 w-16 rounded-full" />
              <Sk className="mt-3 h-8 w-14 rounded-xl" />
            </div>
          ))}
        </div>
        <section className="rounded-[28px] bg-white p-5 shadow-soft sm:p-6">
          <Sk className="h-5 w-40 rounded-full" />
          <Sk className="mt-5 h-48 w-full rounded-2xl" />
        </section>
        <section className="space-y-3 rounded-[28px] bg-white p-5 shadow-soft sm:p-6">
          <Sk className="h-5 w-28 rounded-full" />
          <Row />
          <Row />
          <Row />
        </section>
      </div>
      <div className="min-w-0 space-y-5">
        <section className="rounded-[28px] bg-white p-5 shadow-soft sm:p-6">
          <Sk className="h-5 w-36 rounded-full" />
          <Sk className="mx-auto mt-5 h-44 w-44 rounded-full" />
        </section>
      </div>
    </Frame>
  );
}

/** Contacts list: a few rows. */
export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Frame className="mt-6 space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <Row key={i} />
      ))}
    </Frame>
  );
}

/** Pipeline: columns with a few cards each. */
export function PipelineSkeleton() {
  return (
    <Frame className="mt-6">
      <div className="flex gap-3 overflow-hidden pb-4">
        {[3, 2, 2, 1].map((n, c) => (
          <div key={c} className="w-72 shrink-0 rounded-3xl border border-white/70 bg-white/50 p-4">
            <Sk className="h-4 w-24 rounded-full" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: n }, (_, i) => (
                <div key={i} className="rounded-2xl border border-line bg-white/80 p-3">
                  <Sk className="h-3.5 w-3/4 rounded-full" />
                  <Sk className="mt-2 h-3 w-1/2 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/** Contact page: header with avatar, details block, timeline. */
export function DetailSkeleton() {
  return (
    <Frame className="space-y-5">
      <div className="flex items-center gap-4">
        <Sk className="h-16 w-16 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <Sk className="h-6 w-1/2 rounded-full" />
          <Sk className="h-3.5 w-1/3 rounded-full" />
        </div>
      </div>
      <div className={`${card} space-y-3`}>
        {[0, 1, 2, 3].map((i) => (
          <Sk key={i} className="h-4 w-full rounded-full" />
        ))}
      </div>
      <div className={`${card} space-y-3`}>
        <Sk className="h-4 w-28 rounded-full" />
        <Row />
        <Row />
      </div>
    </Frame>
  );
}
