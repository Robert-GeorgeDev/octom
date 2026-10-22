import Link from "next/link";
import Logo from "@/components/logo";
import JsonLd from "@/components/json-ld";
import { LangScope } from "@/components/language-provider";
import { ARTICLES, type Article } from "@/lib/articles";
import { pageMetadata } from "@/lib/seo";
import { articleLd, breadcrumbLd, faqLd, graph, softwareLd } from "@/lib/jsonld";

export function articleMetadata(a: Article) {
  return pageMetadata({ title: a.title, description: a.desc, path: `/blog/${a.slug}`, lang: "ro", singleLanguage: true });
}

export function blogIndexMetadata() {
  return pageMetadata({
    title: "Blog: follow-up și organizarea clienților",
    description: "Articole practice în română despre follow-up cu clienții, oferte, mesaje și organizarea contactelor pentru freelanceri și echipe mici.",
    path: "/blog",
    lang: "ro",
    singleLanguage: true,
  });
}

const dateFmt = new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const fmt = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00Z`));

function Header() {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link href="/ro" aria-label="OCTOM One">
        <Logo />
      </Link>
      <Link href="/ro/blog" className="text-sm font-medium text-brand hover:underline">
        Blog
      </Link>
    </div>
  );
}

export function BlogIndex() {
  return (
    <LangScope lang="ro">
      <JsonLd
        data={graph(
          { "@type": "CollectionPage", name: "Blog OCTOM One", url: "https://octom.eu/ro/blog", inLanguage: "ro" },
          breadcrumbLd("ro", [
            { name: "Acasă", path: "/" },
            { name: "Blog", path: "/blog" },
          ])
        )}
      />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
        <Header />
        <h1 className="mt-12 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Blog: follow-up și organizarea clienților</h1>
        <p className="mt-6 text-lg text-gray-600">
          Articole scurte și practice pentru freelanceri, consultanți și echipe mici: cum revii la clienți fără să uiți pe nimeni.
        </p>
        <ul className="mt-10 space-y-8">
          {ARTICLES.map((a) => (
            <li key={a.slug}>
              <h2 className="text-xl font-semibold text-gray-900">
                <Link href={`/ro/blog/${a.slug}`} className="hover:text-brand hover:underline">
                  {a.h1}
                </Link>
              </h2>
              <p className="mt-2 text-gray-600">{a.desc}</p>
              <p className="mt-1 text-xs text-gray-500">{fmt(a.published)}</p>
            </li>
          ))}
        </ul>
      </main>
    </LangScope>
  );
}

export default function ArticlePage({ article: a }: { article: Article }) {
  return (
    <LangScope lang="ro">
      <JsonLd
        data={graph(
          articleLd(a),
          softwareLd("ro"),
          breadcrumbLd("ro", [
            { name: "Acasă", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: a.h1, path: `/blog/${a.slug}` },
          ]),
          faqLd(a.faq)
        )}
      />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
        <Header />
        <article>
          <h1 className="mt-12 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">{a.h1}</h1>
          <p className="mt-3 text-sm text-gray-500">
            Actualizat <time dateTime={a.updated}>{fmt(a.updated)}</time>
          </p>
          <p className="mt-6 text-lg text-gray-600">{a.intro}</p>

          {a.blocks.map((b) => (
            <section key={b.h2}>
              <h2 className="mt-12 text-2xl font-semibold text-gray-900">{b.h2}</h2>
              {b.p?.map((t) => (
                <p key={t} className="mt-4 text-gray-600">
                  {t}
                </p>
              ))}
              {b.ul && (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-600">
                  {b.ul.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
              {b.ol && (
                <ol className="mt-4 list-decimal space-y-2 pl-6 text-gray-600">
                  {b.ol.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
              )}
              {b.templates?.map((t) => (
                <blockquote key={t} className="mt-4 whitespace-pre-line rounded-xl border-l-4 border-brand bg-indigo-50/60 px-4 py-3 text-gray-700">
                  {t}
                </blockquote>
              ))}
            </section>
          ))}

          <h2 className="mt-12 text-2xl font-semibold text-gray-900">Întrebări frecvente</h2>
          <dl className="mt-4 space-y-5">
            {a.faq.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-gray-900">{f.q}</dt>
                <dd className="mt-1 text-gray-600">{f.a}</dd>
              </div>
            ))}
          </dl>
        </article>

        <div className="mt-12 rounded-2xl bg-indigo-50 p-6">
          <p className="text-lg font-semibold text-gray-900">Știi cui să scrii azi</p>
          <p className="mt-1 text-gray-600">OCTOM One îți arată în fiecare dimineață pe cine contactezi azi. Gratuit în perioada beta.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-lg bg-brand px-5 py-3 text-sm font-medium text-white">
              Începe gratuit
            </Link>
            <Link href="/ro" className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700">
              Vezi cum funcționează
            </Link>
          </div>
        </div>

        <nav aria-label="Alte articole" className="mt-14 border-t border-gray-200 pt-6">
          <p className="text-sm font-medium text-gray-900">Alte articole</p>
          <ul className="mt-3 space-y-2 text-sm">
            {ARTICLES.filter((x) => x.slug !== a.slug).map((x) => (
              <li key={x.slug}>
                <Link href={`/ro/blog/${x.slug}`} className="text-brand hover:underline">
                  {x.h1}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </LangScope>
  );
}
