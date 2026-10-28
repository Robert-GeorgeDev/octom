import type { Metadata } from "next";
import LegalLayout from "@/components/legal-layout";
import LegalDoc from "@/components/legal-doc";
import ContactForm from "@/components/contact-form";
import DocsView from "@/components/docs-view";
import StatusView from "@/components/status-view";
import RoadmapView from "@/components/roadmap-view";
import JsonLd from "@/components/json-ld";
import { LangScope } from "@/components/language-provider";
import { LEGAL_SLUGS, loadLegalDoc } from "@/lib/legal-content";
import { SITE_PAGES, SITE_SLUGS, type SiteSlug } from "@/lib/site-pages";
import { pageMetadata, type Lang } from "@/lib/seo";
import { breadcrumbLd, graph } from "@/lib/jsonld";

export function isSiteSlug(value: string): value is SiteSlug {
  return (SITE_SLUGS as readonly string[]).includes(value);
}

export function siteMetadata(slug: SiteSlug, lang: Lang): Metadata {
  const page = SITE_PAGES[slug];
  const meta = pageMetadata({ ...page[lang], path: `/${slug}`, lang });
  return page.noindex ? { ...meta, robots: { index: false, follow: true } } : meta;
}

/** One public information page in one language, with its breadcrumb data. */
export function SitePageRoute({ slug, lang }: { slug: SiteSlug; lang: Lang }) {
  const page = SITE_PAGES[slug];
  let body: React.ReactNode;
  const legalSlug = (LEGAL_SLUGS as readonly string[]).find((s) => s === slug) as (typeof LEGAL_SLUGS)[number] | undefined;
  if (page.legal && legalSlug) {
    const doc = loadLegalDoc(legalSlug);
    body = (
      <LegalLayout title={page.en.title} titleRo={page.ro.title}>
        <LegalDoc ro={doc.ro} en={doc.en} />
      </LegalLayout>
    );
  } else if (slug === "contact") body = <ContactForm />;
  else if (slug === "docs") body = <DocsView />;
  else if (slug === "roadmap") body = <RoadmapView />;
  else body = <StatusView />;

  return (
    <LangScope lang={lang}>
      <JsonLd
        data={graph(
          breadcrumbLd(lang, [
            { name: lang === "ro" ? "Acasă" : "Home", path: "/" },
            { name: page[lang].title, path: `/${slug}` },
          ])
        )}
      />
      {body}
    </LangScope>
  );
}
