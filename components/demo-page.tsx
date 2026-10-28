import Link from "next/link";
import Logo from "@/components/logo";
import JsonLd from "@/components/json-ld";
import LanguageSwitcher from "@/components/language-switcher";
import { LangScope } from "@/components/language-provider";
import DemoApp from "@/components/demo-app";
import { DEMO_COPY } from "@/lib/demo";
import { localizedPath, pageMetadata, type Lang } from "@/lib/seo";
import { breadcrumbLd, faqLd, graph } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";

export function demoMetadata(lang: Lang) {
  const c = DEMO_COPY[lang];
  return pageMetadata({ title: c.title, description: c.desc, path: "/demo", lang });
}

/** The public demo page: a short introduction, the working demo, and real questions. */
export default function DemoPage({ lang }: { lang: Lang }) {
  const c = DEMO_COPY[lang];
  const here = localizedPath("/demo", lang);
  return (
    <LangScope lang={lang}>
      <JsonLd
        data={graph(
          { "@type": "WebPage", "@id": `${SITE_URL}${here}`, url: `${SITE_URL}${here}`, name: c.title, description: c.desc, inLanguage: lang },
          breadcrumbLd(lang, [
            { name: lang === "ro" ? "Acasă" : "Home", path: "/" },
            { name: c.title, path: "/demo" },
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

        <DemoApp />

        <h2 className="mt-14 text-xl font-semibold text-gray-900">{c.faqTitle}</h2>
        <dl className="mt-4 space-y-5">
          {c.faq.map((f) => (
            <div key={f.q}>
              <dt className="font-medium text-gray-900">{f.q}</dt>
              <dd className="mt-1 text-gray-600">{f.a}</dd>
            </div>
          ))}
        </dl>
      </main>
    </LangScope>
  );
}
