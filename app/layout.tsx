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
  applicationName: "OCTOM One",
  category: "business",
  // Lets search engines and AI assistants show full snippets and large images.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  // Search Console and Bing Webmaster ownership codes, if set in Vercel (otherwise nothing is added).
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "OCTOM One – Know who to contact today",
    description: "A simple CRM built around follow-ups for freelancers, consultants and small teams.",
  },
};

export const viewport: Viewport = { themeColor: "#0B1026" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${nunito.variable} font-sans`}>
        <LanguageProvider>
          {children}
          <Consent />
        </LanguageProvider>
      </body>
    </html>
  );
}
