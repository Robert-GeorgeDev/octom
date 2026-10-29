"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Home, Sun, Users, LayoutGrid, Sparkles, UserPlus, Database,
  UserCircle, Plus, ChevronDown, Menu, Globe, Briefcase, LogOut,
} from "lucide-react";
import Mark from "@/components/mark";
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
  Won: "bg-emerald-400",
  Lost: "bg-red-400",
};

/** The menu closes by itself this long after the pointer leaves it. */
const CLOSE_DELAY_MS = 250;

export default function AppSidebar() {
  const { t, lang, setLang } = useLanguage();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const search = useSearchParams();
  const activeStatus = search?.get("status") ?? "";
  const orgId = useOrgId();
  const counts = useContactCounts(orgId);
  const [workspace, setWorkspace] = useState("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  // A narrow icon rail that opens while the pointer or keyboard focus is on it, and closes by
  // itself shortly after both have left. The burger button opens it on touch screens.
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  // When the menu opened, so that a tap on the burger right after a hover does not close it again.
  const openedAt = useRef(0);
  const openRef = useRef(false);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  const openNow = () => {
    cancelClose();
    if (!openRef.current) {
      openRef.current = true;
      openedAt.current = Date.now();
    }
    setOpen(true);
  };
  const closeSoon = () => {
    cancelClose();
    timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };
  useEffect(() => cancelClose, []);
  // Going to another page closes the menu.
  useEffect(() => {
    cancelClose();
    setOpen(false);
  }, [pathname, activeStatus]);
  // A tap or click anywhere else closes it (touch screens have no "pointer left").
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

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
    { id: "today", label: t("nav.today"), Icon: Sun, href: "/today", matches: under("/today") },
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
      matches: (p) => ["/team", "/data", "/account"].some((b) => under(b)(p)),
      children: [
        { href: "/team", label: t("nav.team") },
        { href: "/data", label: t("nav.data") },
        { href: "/account", label: t("nav.account") },
      ],
    },
  ];

  const childActive = (c: Child) => {
    const [base, query] = c.href.split("?");
    if (!query) return pathname === base && !activeStatus;
    return pathname === base && query === `status=${encodeURIComponent(activeStatus)}`;
  };
  const leafIcon: Record<string, Icon> = { "/team": UserPlus, "/data": Database, "/account": UserCircle };

  const expanded = (e: Entry) => openIds[e.id] ?? e.matches(pathname);
  const toggleGroup = (e: Entry) => setOpenIds((s) => ({ ...s, [e.id]: !expanded(e) }));

  // The icon sits at the same place whether the menu is open or closed, so nothing jumps.
  const row = "relative flex h-11 min-w-0 items-center gap-3 rounded-full px-3 text-sm font-semibold transition-colors duration-200";
  const tone = (active: boolean) => (active ? "bg-white text-navy" : "text-white/65 hover:bg-white/10 hover:text-white");
  const label = `min-w-0 flex-1 truncate whitespace-nowrap text-left transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`;

  return (
    <>
      <Link
        href="/dashboard"
        aria-label={BRAND}
        className="fixed left-5 top-5 z-30 hidden h-16 w-16 place-items-center rounded-full bg-navy shadow-lift transition-transform duration-300 hover:scale-105 md:grid"
      >
        <Mark className="h-9 w-9" />
      </Link>

      <aside
        ref={box}
        onMouseEnter={openNow}
        onMouseLeave={closeSoon}
        onFocus={(e) => {
          // Only keyboard focus opens it; a mouse click or a tap is handled by hover and the burger.
          if (e.target.matches(":focus-visible")) openNow();
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closeSoon();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className={`fixed bottom-5 left-5 top-[96px] z-30 hidden flex-col rounded-[32px] bg-navy p-2.5 shadow-lift transition-[width] duration-300 ease-[cubic-bezier(.4,0,.2,1)] md:flex ${
          open ? "w-[248px]" : "w-16"
        }`}
      >
        <button
          type="button"
          onClick={() => (open && Date.now() - openedAt.current > 500 ? setOpen(false) : openNow())}
          aria-label={open ? t("crm.collapseMenu") : t("crm.expandMenu")}
          aria-expanded={open}
          className={`${row} w-full text-white/65 hover:bg-white/10 hover:text-white`}
        >
          <Menu className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className={`${label} text-white`}>{workspace || BRAND}</span>
        </button>

        <nav aria-label="Main" className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {entries.map((e) => {
            const active = e.matches(pathname);
            const isOpen = open && expanded(e);
            const parentHref = e.href ?? e.children?.[0]?.href ?? "#";
            return (
              <div key={e.id}>
                <div className="flex items-center gap-1">
                  <Link
                    href={parentHref}
                    aria-label={e.label}
                    aria-current={active && !e.children ? "page" : undefined}
                    className={`${row} flex-1 ${tone(active && !isOpen)} ${active && isOpen ? "text-white" : ""}`}
                  >
                    <e.Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className={label}>{e.label}</span>
                  </Link>
                  {e.children && open && (
                    <button
                      type="button"
                      onClick={() => toggleGroup(e)}
                      aria-expanded={isOpen}
                      aria-label={e.label}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                    >
                      <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>

                {e.children && (
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    aria-hidden={!isOpen}
                  >
                    <div className="overflow-hidden">
                      <ul className="ml-[26px] mt-1 space-y-0.5 border-l border-white/15 pb-1 pl-3">
                        {e.children.map((c) => {
                          const on = childActive(c);
                          const LeafIcon = leafIcon[c.href];
                          return (
                            <li key={c.href}>
                              <Link
                                href={c.href}
                                tabIndex={isOpen ? 0 : -1}
                                aria-current={on ? "page" : undefined}
                                className={`flex min-h-[34px] items-center gap-2.5 rounded-full px-3 text-[13px] font-semibold transition-colors duration-200 ${
                                  on ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {c.dot ? <span className={`h-2 w-2 shrink-0 rounded-full ${c.dot}`} aria-hidden="true" /> : LeafIcon ? <LeafIcon className="h-4 w-4 shrink-0 text-white/40" aria-hidden="true" /> : null}
                                <span className="flex-1 truncate whitespace-nowrap">{c.label}</span>
                                {c.count !== undefined && <span className="text-xs font-medium tabular-nums text-white/40">{c.count}</span>}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="mt-2 space-y-1">
          <Link
            href="/followups/new"
            aria-label={t("nav.addFollowUp")}
            className={`${row} bg-gradient-to-br from-[#6366F1] to-[#3B82F6] text-white hover:brightness-110`}
          >
            <Plus className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={label}>{t("nav.addFollowUp")}</span>
          </Link>
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "ro" : "en")}
            aria-label="Language"
            className={`${row} w-full text-white/65 hover:bg-white/10 hover:text-white`}
          >
            <Globe className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={label}>{lang === "en" ? "Română" : "English"}</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace("/");
            }}
            aria-label={t("nav.signOut")}
            className={`${row} w-full text-white/65 hover:bg-red-500/20 hover:text-red-200`}
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={label}>{t("nav.signOut")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
