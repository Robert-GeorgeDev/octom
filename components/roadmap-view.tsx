"use client";

import Link from "@/components/loc-link";
import SitePage from "@/components/site-page";
import { useLanguage } from "@/components/language-provider";
import { DISCUSSING, SHIPPED } from "@/lib/roadmap";

function monthLabel(ym: string, locale: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(locale, { month: "long", year: "numeric", timeZone: "UTC" });
}

export default function RoadmapView() {
  const { lang } = useLanguage();
  const ro = lang === "ro";
  const l = ro ? "ro" : "en";
  const locale = ro ? "ro-RO" : "en-GB";

  return (
    <SitePage
      title="Roadmap"
      titleRo="Roadmap"
      intro="What changed recently and what we are thinking about. The second list has no dates and no promises: those ideas may change, or may never happen."
      introRo="Ce s-a schimbat recent și la ce ne gândim. A doua listă nu are date și nu promite nimic: ideile pot să se schimbe sau pot să nu se întâmple niciodată."
    >
      <section aria-labelledby="shipped">
        <h2 id="shipped" className="text-2xl font-semibold tracking-tight">{ro ? "Livrat recent" : "Shipped recently"}</h2>
        <ul className="mt-5 space-y-3">
          {SHIPPED.map((i) => (
            <li key={i.id} className="rounded-2xl border border-line bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{monthLabel(i.month, locale)}</p>
              <h3 className="mt-1 text-lg font-semibold">{i[l].title}</h3>
              <p className="mt-1 text-slate-600">{i[l].text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="discussing" className="mt-12">
        <h2 id="discussing" className="text-2xl font-semibold tracking-tight">{ro ? "În discuție" : "Under discussion"}</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {DISCUSSING.map((i) => (
            <li key={i.id} className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5">
              <h3 className="text-base font-semibold">{i[l].title}</h3>
              <p className="mt-1 text-sm text-slate-600">{i[l].text}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-12 text-slate-600">
        {ro ? "Ce te-ar ajuta cel mai mult? " : "What would help you most? "}
        <Link href="/contact" className="font-semibold text-brand hover:underline">
          {ro ? "Scrie-ne." : "Tell us."}
        </Link>
      </p>
    </SitePage>
  );
}
