import type { Metadata } from "next";

// One place for how pages describe themselves to search engines and AI assistants.

export type Lang = "en" | "ro";
export const SITE_NAME = "OCTOM One";

/** "/privacy" becomes "/ro/privacy", "/" becomes "/ro". */
export function roPath(path: string): string {
  return path === "/" ? "/ro" : `/ro${path}`;
}

export function localizedPath(path: string, lang: Lang): string {
  return lang === "ro" ? roPath(path) : path;
}

type Options = {
  /** Page name without the site name; the layout adds " | OCTOM One". */
  title: string;
  description: string;
  /** English path of the page, e.g. "/privacy". */
  path: string;
  lang: Lang;
  /** Pages that exist in one language only. */
  singleLanguage?: boolean;
  /** The title already is the whole title (the home page): no " | OCTOM One" suffix. */
  wholeTitle?: boolean;
};

/** Title, description, canonical, language alternates, Open Graph and Twitter card for one page. */
export function pageMetadata({ title, description, path, lang, singleLanguage = false, wholeTitle = false }: Options): Metadata {
  const url = localizedPath(path, lang);
  const full = wholeTitle ? title : `${title} | ${SITE_NAME}`;
  const image = lang === "ro" ? "/ro/opengraph-image" : "/opengraph-image";
  return {
    title: wholeTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      ...(singleLanguage ? {} : { languages: { en: path, ro: roPath(path), "x-default": path } }),
    },
    openGraph: {
      title: full,
      description,
      siteName: SITE_NAME,
      type: "website",
      url,
      locale: lang === "ro" ? "ro_RO" : "en_US",
      alternateLocale: [lang === "ro" ? "en_US" : "ro_RO"],
      images: [{ url: image, width: 1200, height: 630, alt: `${SITE_NAME} – ${lang === "ro" ? "Știi cui să scrii azi" : "Know who to contact today"}` }],
    },
    twitter: { card: "summary_large_image", title: full, description, images: [image] },
  };
}
