import Link from "next/link";
import Logo from "@/components/logo";
import JsonLd from "@/components/json-ld";
import LanguageSwitcher from "@/components/language-switcher";
import { LangScope } from "@/components/language-provider";
import { PAGES, type SeoPage } from "@/lib/seo-pages";
import { TOOL_SLUGS, toolCopy } from "@/lib/tools";
import { localizedPath, pageMetadata, type Lang } from "@/lib/seo";
import { breadcrumbLd, faqLd, graph, softwareLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";

export function forMetadata(page: SeoPage, lang: Lang) {
  const c = page[lang];
  return pageMetadata({ title: c.title, description: c.desc, path: `/for/${page.slug}`, lang });
}

const UI = {
  en: { start: "Start free", how: "See how it works", others: "OCTOM One for other teams", home: "Home", for: "For" },
  ro: { start: "Începe gratuit", how: "Vezi cum funcționează", others: "OCTOM One pentru alte echipe", home: "Acasă", for: "Pentru" },
} as const;

/** An audience page with a problem, a solution, steps and real questions, plus structured data. */
export default function ForPage({ page, lang }: { page: SeoPage; lang: Lang }) {
  const c = page[lang];
  const ui = UI[lang];
  const here = localizedPath(`/for/${page.slug}`, lang);
  return (
    <LangScope lang={lang}>
      <JsonLd
        data={graph(
          { "@type": "WebPage", "@id": `${SITE_URL}${here}`, url: `${SITE_URL}${here}`, name: c.title, description: c.desc, inLanguage: lang, about: { "@id": `${SITE_URL}/#software` } },
          softwareLd(lang),
          breadcrumbLd(lang, [
            { name: ui.home, path: "/" },
            { name: c.title, path: `/for/${page.slug}` },
          ]),
          faqLd(c.faq)
        )}
      />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
        <div className="flex items-center justify-between gap-3">
          <Link href={localizedPath("/", lang)} aria-label="OCTOM One">
            <Logo />
          </Link>
          <LanguageSwitcher />
        </div>

        <h1 className="mt-12 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">{c.h1}</h1>
        <p className="mt-6 text-lg text-gray-600">{c.intro}</p>

        <h2 className="mt-12 text-xl font-semibold text-gray-900">{c.problemsTitle}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-600">
          {c.problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <h2 className="mt-12 text-xl font-semibold text-gray-900">{c.pointsTitle}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {c.points.map((x) => (
            <div key={x.t}>
              <h3 className="font-medium text-gray-900">{x.t}</h3>
              <p className="mt-2 text-sm text-gray-600">{x.d}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-semibold text-gray-900">{c.stepsTitle}</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-gray-600">
          {c.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>

        <h2 className="mt-12 text-xl font-semibold text-gray-900">{c.faqTitle}</h2>
        <dl className="mt-4 space-y-5">
          {c.faq.map((f) => (
            <div key={f.q}>
              <dt className="font-medium text-gray-900">{f.q}</dt>
              <dd className="mt-1 text-gray-600">{f.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-lg bg-brand px-5 py-3 text-sm font-medium text-white">
            {ui.start}
          </Link>
          <Link href={localizedPath("/", lang)} className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700">
            {ui.how}
          </Link>
        </div>

        <nav aria-label={ui.others} className="mt-14 border-t border-gray-200 pt-6">
          <p className="text-sm font-medium text-gray-900">{ui.others}</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {PAGES.filter((p) => p.slug !== page.slug).map((p) => (
              <li key={p.slug}>
                <Link href={localizedPath(`/for/${p.slug}`, lang)} className="text-brand hover:underline">
                  {p[lang].h1}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-medium text-gray-900">{lang === "ro" ? "Instrumente gratuite" : "Free tools"}</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {TOOL_SLUGS.map((s) => (
              <li key={s}>
                <Link href={localizedPath(`/tools/${s}`, lang)} className="text-brand hover:underline">
                  {toolCopy(s, lang).h1}
                </Link>
              </li>
            ))}
          </ul>
          {lang === "ro" && (
            <p className="mt-4 text-sm">
              <Link href="/ro/blog" className="text-brand hover:underline">
                Articole despre follow-up și organizarea clienților
              </Link>
            </p>
          )}
        </nav>
      </main>
    </LangScope>
  );
}
