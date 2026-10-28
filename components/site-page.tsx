"use client";

import SocialLinks from "@/components/social-links";
import Link from "@/components/loc-link";
import Logo from "@/components/logo";
import AnpcSal from "@/components/anpc-sal";
import { CookieSettingsButton } from "@/components/consent";
import { useLanguage } from "@/components/language-provider";
import { LEGAL } from "@/lib/legal";

// Shared shell for public info pages (documentation, status).
export default function SitePage({
  title,
  titleRo,
  intro,
  introRo,
  children,
}: {
  title: string;
  titleRo: string;
  intro: string;
  introRo: string;
  children: React.ReactNode;
}) {
  const { lang } = useLanguage();
  const ro = lang === "ro";
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4">
          <Link href="/" aria-label="Home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-2 text-sm font-semibold" aria-label="Site">
            <Link href="/docs" className="hidden rounded-xl px-3 py-2 text-slate-600 hover:text-ink sm:block">
              {ro ? "Documentație" : "Docs"}
            </Link>
            <Link href="/status" className="hidden rounded-xl px-3 py-2 text-slate-600 hover:text-ink sm:block">
              Status
            </Link>
            <Link href="/login" className="rounded-xl border border-line bg-white px-4 py-2 text-ink hover:bg-brand-soft">
              {ro ? "Autentificare" : "Log in"}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-10">
        <h1 className="text-4xl font-bold tracking-tight text-ink">{ro ? titleRo : title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">{ro ? introRo : intro}</p>
        <div className="mt-10">{children}</div>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-between gap-4 px-5 py-6 text-sm text-slate-500">
          <div>
            <p>© {new Date().getFullYear()} {LEGAL.name}</p>
            <SocialLinks className="mt-4" />
            <AnpcSal className="mt-4" />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/docs" className="hover:text-ink">{ro ? "Documentație" : "Documentation"}</Link>
            <Link href="/roadmap" className="hover:text-ink">Roadmap</Link>
            <Link href="/status" className="hover:text-ink">Status</Link>
            <Link href="/privacy" className="hover:text-ink">{ro ? "Confidențialitate" : "Privacy"}</Link>
            <Link href="/terms" className="hover:text-ink">{ro ? "Termeni" : "Terms"}</Link>
            <Link href="/cookies" className="hover:text-ink">Cookies</Link>
            <CookieSettingsButton className="hover:text-ink" />
            <Link href="/security" className="hover:text-ink">{ro ? "Securitate" : "Security"}</Link>
            <Link href="/contact" className="hover:text-ink">Contact</Link>
            <Link href="/" className="hover:text-ink">{ro ? "Acasă" : "Home"}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
