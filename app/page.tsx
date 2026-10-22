import type { Metadata } from "next";
import Landing from "@/components/landing";
import { LangScope } from "@/components/language-provider";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { en: "/", ro: "/ro", "x-default": "/" },
  },
};

export default function Page() {
  return (
    <LangScope lang="en">
      <Landing />
    </LangScope>
  );
}
