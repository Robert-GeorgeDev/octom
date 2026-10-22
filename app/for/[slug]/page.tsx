import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ForPage, { forMetadata } from "@/components/for-page";
import { PAGES } from "@/lib/seo-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return PAGES.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = PAGES.find((x) => x.slug === slug);
  return p ? forMetadata(p, "en") : {};
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const p = PAGES.find((x) => x.slug === slug);
  if (!p) notFound();
  return <ForPage page={p} lang="en" />;
}
