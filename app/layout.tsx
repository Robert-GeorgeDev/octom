import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import { SITE_URL, siteConfigured } from "@/lib/site";
import { LanguageProvider } from "@/components/language-provider";
import Consent from "@/components/consent";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });
// Rounded letters for the wordmark only.
const nunito = Nunito({ subsets: ["latin", "latin-ext"], weight: ["900"], variable: "--font-nunito" });

export const metadata: Metadata = {
  metadataBase: siteConfigured ? new URL(SITE_URL) : undefined,
  title: {
    default: "OCTOM One – Know who to contact today",
    template: "%s | OCTOM One",
  },
  description:
    "OCTOM One is the simple CRM that tells you who to contact, when to contact them, and what to say.",
  openGraph: {
    title: "OCTOM One – Know who to contact today",
    description:
      "A simple CRM built around follow-ups for freelancers, consultants and small teams.",
    siteName: "OCTOM One",
    type: "website",
    url: "/",
    locale: "en_US",
    alternateLocale: ["ro_RO"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OCTOM One – Know who to contact today",
    description: "A simple CRM built around follow-ups for freelancers, consultants and small teams.",
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#0B1026" };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Octom",
      ...(siteConfigured ? { url: SITE_URL } : {}),
    },
    {
      "@type": "SoftwareApplication",
      name: "OCTOM One",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "A simple CRM built around follow-ups for freelancers, consultants and small teams.",
      inLanguage: ["en", "ro"],
      license: "https://www.gnu.org/licenses/agpl-3.0.html",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${nunito.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <LanguageProvider>
          {children}
          <Consent />
        </LanguageProvider>
      </body>
    </html>
  );
}
