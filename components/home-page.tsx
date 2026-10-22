import Landing from "@/components/landing";
import JsonLd from "@/components/json-ld";
import { LangScope } from "@/components/language-provider";
import { dictionaries } from "@/lib/dictionaries";
import { faqLd, graph, organizationLd, softwareLd, websiteLd } from "@/lib/jsonld";
import type { Lang } from "@/lib/seo";

const FAQ_KEYS = [0, 1, 2, 3, 4, 5, 6] as const;

/** The home page in one language, with the site-wide structured data and the FAQ. */
export default function HomePage({ lang }: { lang: Lang }) {
  const d = dictionaries[lang] as Record<string, string>;
  const faq = FAQ_KEYS.map((n) => ({ q: d[`land.q${n}`], a: d[`land.a${n}`] }));
  return (
    <LangScope lang={lang}>
      <JsonLd data={graph(organizationLd(), websiteLd(), softwareLd(lang), faqLd(faq))} />
      <Landing />
    </LangScope>
  );
}
