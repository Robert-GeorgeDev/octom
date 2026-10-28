import Link from "next/link";
import Logo from "@/components/logo";
import JsonLd from "@/components/json-ld";
import LanguageSwitcher from "@/components/language-switcher";
import { LangScope } from "@/components/language-provider";
import MessageGenerator from "@/components/message-generator";
import ForgottenCost from "@/components/forgotten-cost";
import { TOOL_SLUGS, toolCopy, type ToolSlug } from "@/lib/tools";
import { localizedPath, pageMetadata, type Lang } from "@/lib/seo";
import { breadcrumbLd, faqLd, graph } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";

export function toolMetadata(slug: ToolSlug, lang: Lang) {
  const c = toolCopy(slug, lang);
  return pageMetadata({ title: c.title, description: c.desc, path: `/tools/${slug}`, lang });
}

const UI = {
  en: { cta: "Keep your follow-ups in one place", ctaText: "OCTOM One shows you who to contact today. It is free during beta.", start: "Start free", others: "More free tools", home: "Home" },
  ro: { cta: "Ține follow-up-urile într-un singur loc", ctaText: "OCTOM One îți arată cui să scrii azi. Este gratuit în beta.", start: "Începe gratuit", others: "Alte instrumente gratuite", home: "Acasă" },
} as const;

/** A free tool page: the tool, real questions, and a quiet invitation to the app. */
export default function ToolPage({ slug, lang }: { slug: ToolSlug; lang: Lang }) {
  const c = toolCopy(slug, lang);
  const ui = UI[lang];
  const here = localizedPath(`/tools/${slug}`, lang);
  return (
    <LangScope lang={lang}>
      <JsonLd
        data={graph(
          { "@type": "WebPage", "@id": `${SITE_URL}${here}`, url: `${SITE_URL}${here}`, name: c.title, description: c.desc, inLanguage: lang },
          breadcrumbLd(lang, [
            { name: ui.home, path: "/" },
            { name: c.title, path: `/tools/${slug}` },
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

        {slug === "follow-up-message-generator" ? <MessageGenerator /> : <ForgottenCost />}

        <h2 className="mt-14 text-xl font-semibold text-gray-900">{c.faqTitle}</h2>
        <dl className="mt-4 space-y-5">
          {c.faq.map((f) => (
            <div key={f.q}>
              <dt className="font-medium text-gray-900">{f.q}</dt>
              <dd className="mt-1 text-gray-600">{f.a}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-14 rounded-2xl bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">{ui.cta}</h2>
          <p className="mt-1 text-gray-600">{ui.ctaText}</p>
          <Link href="/signup" className="mt-4 inline-block rounded-lg bg-brand px-5 py-3 text-sm font-medium text-white">
            {ui.start}
          </Link>
        </section>

        <nav aria-label={ui.others} className="mt-14 border-t border-gray-200 pt-6">
          <p className="text-sm font-medium text-gray-900">{ui.others}</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {TOOL_SLUGS.filter((s) => s !== slug).map((s) => (
              <li key={s}>
                <Link href={localizedPath(`/tools/${s}`, lang)} className="text-brand hover:underline">
                  {toolCopy(s, lang).h1}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </LangScope>
  );
}
