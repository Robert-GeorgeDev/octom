import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolPage, { toolMetadata } from "@/components/tool-page";
import { TOOL_SLUGS, isToolSlug } from "@/lib/tools";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOL_SLUGS.map((tool) => ({ tool }));
}

type Props = { params: Promise<{ tool: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  return isToolSlug(tool) ? toolMetadata(tool, "ro") : {};
}

export default async function Page({ params }: Props) {
  const { tool } = await params;
  if (!isToolSlug(tool)) notFound();
  return <ToolPage slug={tool} lang="ro" />;
}
