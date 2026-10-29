"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, LayoutGrid, Plus, Users, UserCircle, Sparkles } from "lucide-react";
import Logo from "@/components/logo";
import AppSidebar from "@/components/app-sidebar";
import LanguageSwitcher from "@/components/language-switcher";
import AccountMenu from "@/components/account-menu";
import FeedbackButton from "@/components/feedback-button";
import CommandPalette, { SearchButton } from "@/components/command-palette";
import InstallPrompt from "@/components/install-prompt";
import ServiceWorker from "@/components/service-worker";
import { ToastProvider } from "@/components/toast";
import { useLanguage } from "@/components/language-provider";
import { BRAND } from "@/lib/brand";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const { t } = useLanguage();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const tab = (href: string, label: string, Icon: typeof Users) => (
    <Link
      key={href}
      href={href}
      aria-current={isActive(href) ? "page" : undefined}
      className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
        isActive(href) ? "text-brand" : "text-slate-600"
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {label}
    </Link>
  );

  return (
    <ToastProvider>
    <div className="relative isolate min-h-screen overflow-x-clip bg-[#F4F5FA]">
      {/* Soft backdrop in the brand colours. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(45% 40% at 100% 0%, rgba(165,180,252,.35), transparent 70%), radial-gradient(40% 35% at 0% 100%, rgba(125,211,252,.25), transparent 70%)",
        }}
      />
      <Suspense fallback={null}>
        <AppSidebar />
      </Suspense>

      {/* Phone top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white px-4 py-3 md:hidden">
        <Link href="/dashboard" aria-label={BRAND}><Logo /></Link>
        <div className="flex items-center gap-3">
          <SearchButton className="grid h-11 w-11 place-items-center rounded-xl text-slate-600" />
          <Link href="/assistant" aria-label={t("nav.assistant")} className="grid h-11 w-11 place-items-center rounded-xl text-slate-600">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </Link>
          <FeedbackButton compact />
          <LanguageSwitcher />
        </div>
      </header>

      <div className="pb-24 md:pb-0 md:pl-[108px]">
        {/* Desktop and laptop only: account menu, top right */}
        <div className="pointer-events-none sticky top-0 z-40 hidden h-0 md:block">
          <div className="mx-auto flex w-full max-w-[1400px] justify-end px-5 pt-4">
            <div className="pointer-events-auto flex items-center gap-3">
              <SearchButton className="grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-white/60 text-slate-700 transition hover:bg-white hover:text-brand" />
              <FeedbackButton />
              <AccountMenu />
            </div>
          </div>
        </div>
        <div className="mx-auto w-full min-w-0 max-w-[1400px] [overflow-wrap:anywhere] md:pt-14">
          {children}
        </div>
      </div>

      {/* Phone bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white md:hidden" aria-label="Main">
        <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-2 pt-1">
          {tab("/today", t("nav.today"), Sun)}
          {tab("/contacts", t("nav.contacts"), Users)}
          <Link
            href="/followups/new"
            aria-label={t("nav.addFollowUp")}
            className="-mt-6 mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-lift hover:bg-brand-dark"
          >
            <Plus className="h-6 w-6" aria-hidden="true" />
          </Link>
          {tab("/pipeline", t("nav.pipeline"), LayoutGrid)}
          {tab("/account", t("nav.account"), UserCircle)}
        </div>
      </nav>
      <CommandPalette />
      <InstallPrompt />
      <ServiceWorker />
    </div>
    </ToastProvider>
  );
}
