"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useOrgId } from "@/hooks/use-org-id";
import { supabase } from "@/lib/supabase";
import { filterCommands, safeSearchText, type Command } from "@/lib/command-filter";

const OPEN_EVENT = "octom:open-search";

/** Any button can open the palette without knowing about it. */
export function openSearch() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function SearchButton({ className = "" }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label={t("cmd.open")}
      title={`${t("cmd.open")} (Ctrl+K)`}
      className={className}
    >
      <Search className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

type Hit = Command & { group: "pages" | "contacts" };

/** Ctrl+K (or Cmd+K): jump to a page or find a contact by name or company. */
export default function CommandPalette() {
  const { t } = useLanguage();
  const router = useRouter();
  const orgId = useOrgId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [found, setFound] = useState<Command[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const seq = useRef(0);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setFound([]);
    setActive(0);
    returnTo.current?.focus?.();
  }, []);

  const show = useCallback(() => {
    returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, [open, close, show]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  const pages: Command[] = useMemo(
    () => [
      { id: "today", label: t("nav.today"), href: "/today", keywords: "today azi" },
      { id: "dash", label: t("nav.dashboard"), href: "/dashboard", keywords: "dashboard panou home" },
      { id: "contacts", label: t("nav.contacts"), href: "/contacts", keywords: "contacts contacte clienti" },
      { id: "pipeline", label: t("nav.pipeline"), href: "/pipeline", keywords: "pipeline" },
      { id: "assistant", label: t("nav.assistant"), href: "/assistant", keywords: "assistant asistent ai" },
      { id: "new", label: t("nav.addFollowUp"), href: "/followups/new", keywords: "new add follow-up adauga nou" },
      { id: "team", label: t("nav.team"), href: "/team", keywords: "team echipa" },
      { id: "data", label: t("nav.data"), href: "/data", keywords: "data export import date csv" },
      { id: "account", label: t("nav.account"), href: "/account", keywords: "account cont setari settings" },
    ],
    [t]
  );

  // Contact search, a little after typing stops. An older answer never replaces a newer one.
  useEffect(() => {
    const text = safeSearchText(query);
    if (!open || !orgId || text.length < 2) {
      setFound([]);
      return;
    }
    const mine = ++seq.current;
    const timer = setTimeout(async () => {
      const like = `%${text}%`;
      const { data, error } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, company")
        .eq("organization_id", orgId)
        .or(`first_name.ilike.${like},last_name.ilike.${like},company.ilike.${like}`)
        .limit(6);
      if (mine !== seq.current || error) return;
      setFound(
        (data ?? []).map((c) => ({
          id: c.id as string,
          label: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || (c.company as string) || "—",
          hint: (c.company as string) || undefined,
          href: `/contacts/${c.id}`,
        }))
      );
    }, 200);
    return () => clearTimeout(timer);
  }, [query, open, orgId]);

  const hits: Hit[] = useMemo(
    () => [
      ...filterCommands(pages, query).map((c) => ({ ...c, group: "pages" as const })),
      ...found.map((c) => ({ ...c, group: "contacts" as const })),
    ],
    [pages, query, found]
  );

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(hits.length - 1, 0)));
  }, [hits.length]);

  function go(h: Hit | undefined) {
    if (!h) return;
    close();
    router.push(h.href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (hits.length ? (a + 1) % hits.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (hits.length ? (a - 1 + hits.length) % hits.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(hits[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  if (!open) return null;

  const row = (h: Hit, i: number) => (
    <li
      key={`${h.group}-${h.id}`}
      id={`cmd-opt-${i}`}
      role="option"
      aria-selected={i === active}
      onMouseEnter={() => setActive(i)}
      onClick={() => go(h)}
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm ${
        i === active ? "bg-brand-soft text-brand" : "text-ink"
      }`}
    >
      <span className="truncate font-semibold">{h.label}</span>
      {h.hint && <span className="truncate text-xs text-slate-500">{h.hint}</span>}
    </li>
  );

  const firstContact = hits.findIndex((h) => h.group === "contacts");

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/40 px-4 pt-[12vh]" onMouseDown={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("cmd.title")}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/70 bg-white shadow-lift"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            ref={input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            aria-activedescendant={hits.length ? `cmd-opt-${active}` : undefined}
            aria-label={t("cmd.placeholder")}
            placeholder={t("cmd.placeholder")}
            autoComplete="off"
            className="min-h-[52px] w-full bg-transparent text-base outline-none placeholder:text-slate-400"
          />
        </div>
        <ul id="cmd-list" role="listbox" aria-label={t("cmd.title")} className="max-h-[50vh] overflow-y-auto p-2">
          {hits.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-500">{t("cmd.empty")}</li>}
          {hits.map((h, i) => (
            <Fragment key={`${h.group}-${h.id}`}>
              {(i === 0 || i === firstContact) && (
                <li role="presentation" className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {h.group === "pages" ? t("cmd.pages") : t("cmd.contacts")}
                </li>
              )}
              {row(h, i)}
            </Fragment>
          ))}
        </ul>
        <p className="hidden border-t border-line px-4 py-2.5 text-xs text-slate-500 md:block">{t("cmd.hint")}</p>
      </div>
    </div>
  );
}
