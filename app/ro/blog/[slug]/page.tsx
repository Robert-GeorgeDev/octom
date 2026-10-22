import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticlePage, { articleMetadata } from "@/components/article-page";
import { ARTICLES, articleBySlug } from "@/lib/articles";

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = articleBySlug(slug);
  return a ? articleMetadata(a) : {};
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) notFound();
  return <ArticlePage article={a} />;
}
