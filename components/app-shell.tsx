"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LayoutGrid, Plus, Users, UserCircle, Sparkles } from "lucide-react";
import Logo from "@/components/logo";
import AppSidebar from "@/components/app-sidebar";
import LanguageSwitcher from "@/components/language-switcher";
import AccountMenu from "@/components/account-menu";
import FeedbackButton from "@/components/feedback-button";
import { useLanguage } from "@/components/language-provider";
import { BRAND } from "@/lib/brand";

const STORE = "octom.sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const { t } = useLanguage();

  // Desktop sidebar: expanded or icon rail. The choice is remembered on this device.
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE);
      if (saved === "1" || saved === "0") setCollapsed(saved === "1");
      else setCollapsed(window.innerWidth < 1024);
    } catch {
      /* storage unavailable: keep default */
    }
  }, []);
  const toggle = () =>
    setCollapsed((v) => {
      try { localStorage.setItem(STORE, v ? "0" : "1"); } catch { /* ignore */ }
      return !v;
    });

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
    <div className="relative isolate min-h-screen bg-[#EEF1FA]">
      {/* Soft blurred backdrop in the brand colours. Panels on top use frosted glass. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 8% 0%, rgba(165,180,252,.55), transparent 70%), radial-gradient(50% 45% at 100% 10%, rgba(196,181,253,.45), transparent 70%), radial-gradient(55% 50% at 90% 100%, rgba(125,211,252,.45), transparent 70%), radial-gradient(45% 40% at 20% 100%, rgba(199,210,254,.5), transparent 70%)",
        }}
      />
      <Suspense fallback={null}>
        <AppSidebar collapsed={collapsed} onToggle={toggle} />
      </Suspense>

      {/* Phone top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white px-4 py-3 md:hidden">
        <Link href="/dashboard" aria-label={BRAND}><Logo /></Link>
        <div className="flex items-center gap-3">
          <Link href="/assistant" aria-label={t("nav.assistant")} className="grid h-11 w-11 place-items-center rounded-xl text-slate-600">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </Link>
          <FeedbackButton compact />
          <LanguageSwitcher />
        </div>
      </header>

      <div className={`pb-24 transition-[padding] duration-300 ease-[cubic-bezier(.4,0,.2,1)] md:pb-0 ${collapsed ? "md:pl-[76px]" : "md:pl-[272px]"}`}>
        {/* Desktop and laptop only: account menu, top right */}
        <div className="pointer-events-none sticky top-0 z-40 hidden h-0 md:block">
          <div className="mx-auto flex w-full max-w-[1400px] justify-end px-5 pt-4">
            <div className="pointer-events-auto flex items-center gap-3">
              <FeedbackButton />
              <AccountMenu />
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1400px] md:pt-14">
          {children}
        </div>
      </div>

      {/* Phone bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white md:hidden" aria-label="Main">
        <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-2 pt-1">
          {tab("/dashboard", t("nav.dashboard"), LayoutDashboard)}
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
    </div>
  );
}
