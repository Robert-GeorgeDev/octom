import type { Metadata } from "next";
import Landing from "@/components/landing";
import { LangScope } from "@/components/language-provider";

const title = "OCTOM One – Știi cui să scrii azi";
const description =
  "OCTOM One e CRM-ul simplu care îți spune pe cine contactezi, când și ce să-i spui. Pentru freelanceri, consultanți și echipe mici.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: "/ro",
    languages: { en: "/", ro: "/ro", "x-default": "/" },
  },
  openGraph: { title, description, siteName: "OCTOM One", type: "website", url: "/ro", locale: "ro_RO", alternateLocale: ["en_US"] },
  twitter: { card: "summary_large_image", title, description },
};

export default function Page() {
  return (
    <LangScope lang="ro">
      <Landing />
    </LangScope>
  );
}
