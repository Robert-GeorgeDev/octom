"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Home, Users, LayoutGrid, Sparkles, UserPlus, Database, CreditCard,
  UserCircle, Plus, ChevronDown, PanelLeftClose, PanelLeftOpen, Briefcase, LogOut,
} from "lucide-react";
import Mascot from "@/components/mascot";
import LanguageSwitcher from "@/components/language-switcher";
import { useLanguage } from "@/components/language-provider";
import { useOrgId } from "@/hooks/use-org-id";
import { useContactCounts } from "@/hooks/use-contact-counts";
import { supabase } from "@/lib/supabase";
import { BRAND } from "@/lib/brand";
import { STATUSES } from "@/types/contact";
import type { Key } from "@/lib/dictionaries";

type Icon = typeof Users;
type Child = { href: string; label: string; count?: number; dot?: string };
type Entry = {
  id: string;
  label: string;
  Icon: Icon;
  href?: string;
  children?: Child[];
  matches: (path: string) => boolean;
};

const dotFor: Record<string, string> = {
  New: "bg-slate-400",
  Contacted: "bg-indigo-400",
  Qualified: "bg-sky-400",
  "Proposal Sent": "bg-amber-400",
  Negotiation: "bg-orange-400",
  Won: "bg-emerald-500",
  Lost: "bg-red-400",
};

export default function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { t, lang, setLang } = useLanguage();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const search = useSearchParams();
  const activeStatus = search?.get("status") ?? "";
  const orgId = useOrgId();
  const counts = useContactCounts(orgId);
  const [workspace, setWorkspace] = useState("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    supabase.from("organizations").select("name").eq("id", orgId).maybeSingle().then(({ data }) => {
      if (!cancelled && data && typeof data.name === "string") setWorkspace(data.name);
    });
    return () => { cancelled = true; };
  }, [orgId]);

  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : undefined;
  const under = (base: string) => (p: string) => p === base || p.startsWith(base + "/");

  const entries: Entry[] = [
    { id: "home", label: t("nav.dashboard"), Icon: Home, href: "/dashboard", matches: under("/dashboard") },
    {
      id: "contacts", label: t("nav.contacts"), Icon: Users, href: "/contacts", matches: under("/contacts"),
      children: [
        { href: "/contacts", label: t("crm.all"), count: total },
        ...STATUSES.map((s) => ({
          href: `/contacts?status=${encodeURIComponent(s)}`,
          label: t(("status." + s) as Key),
          count: counts ? counts[s] ?? 0 : undefined,
          dot: dotFor[s],
        })),
      ],
    },
    { id: "pipeline", label: t("nav.pipeline"), Icon: LayoutGrid, href: "/pipeline", matches: under("/pipeline") },
    { id: "assistant", label: t("nav.assistant"), Icon: Sparkles, href: "/assistant", matches: under("/assistant") },
    {
      id: "workspace", label: t("crm.workspace"), Icon: Briefcase,
      matches: (p) => ["/team", "/data", "/plans", "/account"].some((b) => under(b)(p)),
      children: [
        { href: "/team", label: t("nav.team") },
        { href: "/data", label: t("nav.data") },
        { href: "/plans", label: t("nav.plans") },
        { href: "/account", label: t("nav.account") },
      ],
    },
  ];

  const childActive = (c: Child) => {
    const [base, query] = c.href.split("?");
    if (!query) return pathname === base && !activeStatus;
    return pathname === base && query === `status=${encodeURIComponent(activeStatus)}`;
  };
  const leafIcon: Record<string, Icon> = { "/team": UserPlus, "/data": Database, "/plans": CreditCard, "/account": UserCircle };

  const expanded = (e: Entry) => openIds[e.id] ?? e.matches(pathname);
  const toggleGroup = (e: Entry) => setOpenIds((s) => ({ ...s, [e.id]: !expanded(e) }));

  const rowBase =
    "group/row relative flex min-h-[40px] w-full items-center gap-3 rounded-xl text-sm font-semibold transition-colors duration-200";
  const rowTone = (active: boolean) =>
    active ? "bg-brand-soft text-brand" : "text-slate-600 hover:bg-slate-100 hover:text-ink";

  const indicator = (active: boolean) => (
    <span
      aria-hidden="true"
      className={`absolute -left-3 top-2 bottom-2 w-[3px] rounded-r-full bg-brand transition-all duration-300 ${active ? "opacity-100" : "scale-y-0 opacity-0"}`}
    />
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-white transition-[width] duration-300 ease-[cubic-bezier(.4,0,.2,1)] md:flex ${
        collapsed ? "w-[76px]" : "w-[272px]"
      }`}
    >
      {/* Header: mascot, workspace, collapse toggle */}
      <div className={`flex items-center gap-2 px-4 pb-3 pt-4 ${collapsed ? "flex-col" : ""}`}>
        <Link
          href="/dashboard"
          aria-label={BRAND}
          className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 transition-colors hover:bg-slate-50"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy shadow-soft transition-transform duration-300 group-hover:scale-105">
            <Mascot className="h-7 w-7" />
          </span>
          <span className={`min-w-0 overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-full opacity-100"}`}>
            <span className="block truncate text-sm font-extrabold leading-tight text-ink">{workspace || BRAND}</span>
            <span className="block truncate text-xs text-slate-500">{BRAND}</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? t("crm.expandMenu") : t("crm.collapseMenu")}
          aria-expanded={!collapsed}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-ink"
        >
          {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden="true" /> : <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden="true" />}
        </button>
      </div>

      <div className="px-4">
        <Link
          href="/followups/new"
          aria-label={t("nav.addFollowUp")}
          className={`flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#3B82F6] text-sm font-semibold text-white shadow-soft transition duration-200 hover:brightness-110 active:scale-[.98]`}
        >
          <Plus className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>{t("nav.addFollowUp")}</span>
        </Link>
      </div>

      {/* Navigation. Overflow is only clipped when expanded so hover flyouts can show in the rail. */}
      <nav
        aria-label="Main"
        className={`mt-4 flex-1 space-y-0.5 px-4 pb-4 ${collapsed ? "overflow-visible" : "overflow-y-auto"}`}
      >
        {entries.map((e) => {
          const active = e.matches(pathname);
          const isOpen = !collapsed && expanded(e);
          const parentHref = e.href ?? e.children?.[0]?.href ?? "#";
          const label = (
            <span className={`flex-1 truncate text-left transition-all duration-300 ${collapsed ? "w-0 flex-none opacity-0" : "opacity-100"}`}>{e.label}</span>
          );

          return (
            <div key={e.id} className="group/flyout relative">
              {e.children && !collapsed ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(e)}
                  aria-expanded={isOpen}
                  className={`${rowBase} px-3 ${rowTone(active && !isOpen)} ${active && isOpen ? "text-ink" : ""}`}
                >
                  {indicator(active)}
                  <e.Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {label}
                  <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <Link
                  href={parentHref}
                  aria-label={e.label}
                  aria-current={active && !e.children ? "page" : undefined}
                  className={`${rowBase} ${collapsed ? "justify-center px-0" : "px-3"} ${rowTone(active)}`}
                >
                  {indicator(active)}
                  <e.Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {!collapsed && label}
                </Link>
              )}

              {/* Expanded submenu: height animates with grid rows */}
              {e.children && !collapsed && (
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  aria-hidden={!isOpen}
                >
                  <div className="overflow-hidden">
                    <ul className="ml-[22px] mt-1 space-y-0.5 border-l border-line pb-1 pl-3">
                      {e.children.map((c, i) => {
                        const on = childActive(c);
                        const LeafIcon = leafIcon[c.href];
                        return (
                          <li
                            key={c.href}
                            style={{ transitionDelay: isOpen ? `${i * 25}ms` : "0ms" }}
                            className={`transition-all duration-300 ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"}`}
                          >
                            <Link
                              href={c.href}
                              tabIndex={isOpen ? 0 : -1}
                              aria-current={on ? "page" : undefined}
                              className={`flex min-h-[34px] items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-semibold transition-colors duration-200 ${
                                on ? "bg-slate-100 text-ink" : "text-slate-600 hover:bg-slate-50 hover:text-ink"
                              }`}
                            >
                              {c.dot ? <span className={`h-2 w-2 shrink-0 rounded-full ${c.dot}`} aria-hidden="true" /> : LeafIcon ? <LeafIcon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /> : null}
                              <span className="flex-1 truncate">{c.label}</span>
                              {c.count !== undefined && <span className="text-xs font-medium tabular-nums text-slate-400">{c.count}</span>}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {/* Rail mode: hover flyout with the label and the submenu */}
              {collapsed && (
                <div
                  className="pointer-events-none invisible absolute left-full top-0 z-50 pl-3 opacity-0 transition-all duration-200 group-focus-within/flyout:pointer-events-auto group-focus-within/flyout:visible group-focus-within/flyout:opacity-100 group-hover/flyout:pointer-events-auto group-hover/flyout:visible group-hover/flyout:opacity-100"
                >
                  <div className="min-w-[180px] -translate-x-1 rounded-xl border border-line bg-white p-1.5 shadow-lift transition-transform duration-200 group-hover/flyout:translate-x-0 group-focus-within/flyout:translate-x-0">
                    {e.children ? (
                      <>
                        <p className="px-2.5 pb-1 pt-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">{e.label}</p>
                        {e.children.map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            className={`flex min-h-[34px] items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-semibold ${childActive(c) ? "bg-slate-100 text-ink" : "text-slate-600 hover:bg-slate-50 hover:text-ink"}`}
                          >
                            {c.dot && <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden="true" />}
                            <span className="flex-1 whitespace-nowrap">{c.label}</span>
                            {c.count !== undefined && <span className="text-xs text-slate-400">{c.count}</span>}
                          </Link>
                        ))}
                      </>
                    ) : (
                      <p className="whitespace-nowrap px-2.5 py-1.5 text-[13px] font-semibold text-ink">{e.label}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className={`border-t border-line p-4 ${collapsed ? "flex flex-col items-center gap-3" : "flex items-center justify-between gap-2"}`}>
        {collapsed ? (
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "ro" : "en")}
            aria-label="Language"
            title={lang === "en" ? "Română" : "English"}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-xs font-bold uppercase text-slate-600 transition hover:bg-slate-100 hover:text-ink"
          >
            {lang}
          </button>
        ) : (
          <LanguageSwitcher />
        )}
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/");
          }}
          aria-label={t("nav.signOut")}
          title={t("nav.signOut")}
          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-overdue"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
