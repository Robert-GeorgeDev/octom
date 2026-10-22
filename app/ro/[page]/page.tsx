import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isSiteSlug, SitePageRoute, siteMetadata } from "@/components/site-routes";
import { SITE_SLUGS } from "@/lib/site-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return SITE_SLUGS.map((page) => ({ page }));
}

type Props = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  return isSiteSlug(page) ? siteMetadata(page, "ro") : {};
}

export default async function Page({ params }: Props) {
  const { page } = await params;
  if (!isSiteSlug(page)) notFound();
  return <SitePageRoute slug={page} lang="ro" />;
}
