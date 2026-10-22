import type { Metadata } from "next";
import HomePage from "@/components/home-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "OCTOM One – Știi cui să scrii azi",
  description:
    "OCTOM One e CRM-ul simplu construit în jurul follow-up-urilor. În fiecare dimineață îți arată pe cine contactezi azi și ce să-i spui. Pentru freelanceri, consultanți și echipe mici. Gratuit în beta.",
  path: "/",
  lang: "ro",
  wholeTitle: true,
});


export default function Page() {
  return <HomePage lang="ro" />;
}
