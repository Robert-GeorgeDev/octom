import type { Metadata } from "next";
import HomePage from "@/components/home-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "OCTOM One – Know who to contact today",
  description:
    "OCTOM One is the simple CRM built around follow-ups. Every morning it shows who to contact today and what to say. For freelancers, consultants and small teams. Free during beta.",
  path: "/",
  lang: "en",
  wholeTitle: true,
});


export default function Page() {
  return <HomePage lang="en" />;
}
