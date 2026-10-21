"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, MapPin, Phone, Plus, Search } from "lucide-react";
import RequireAuth from "@/components/require-auth";
import AddContactForm from "@/components/add-contact-form";
import ContactDrawer from "@/components/contact-drawer";
import { useLanguage } from "@/components/language-provider";
import { useOrgId } from "@/hooks/use-org-id";
import { notifyContactsChanged } from "@/hooks/use-contact-counts";
import { supabase } from "@/lib/supabase";
import { avatarGradient, fullName, initials } from "@/lib/contact-utils";
import type { Key } from "@/lib/dictionaries";
import { STATUSES, type Contact } from "@/types/contact";

const statusTone: Record<string, string> = {
  New: "bg-slate-100 text-slate-700",
  Contacted: "bg-indigo-50 text-brand",
  Qualified: "bg-sky-50 text-sky-700",
  "Proposal Sent": "bg-amber-50 text-amber-700",
  Negotiation: "bg-orange-50 text-orange-700",
  Won: "bg-emerald-50 text-done",
  Lost: "bg-red-50 text-overdue",
};

type Sort = "recent" | "name" | "company";

function ContactsView() {
  const { t } = useLanguage();
  const orgId = useOrgId();
  const router = useRouter();
  const params = useSearchParams();
  const statusFilter = params.get("status") ?? "";
  const openId = params.get("c") ?? "";

  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!orgId) return;
    const { data, error: queryError } = await supabase
      .from("contacts")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });
    if (queryError) {
      setError("load");
      return;
    }
    setError("");
    setContacts((data ?? []) as Contact[]);
  }, [orgId]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep the list fresh after the panel changes something.
  useEffect(() => {
    window.addEventListener("octom:contacts", load);
    return () => window.removeEventListener("octom:contacts", load);
  }, [load]);

  const hrefWith = (next: { status?: string | null; c?: string | null }) => {
    const q = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    const s = q.toString();
    return s ? `/contacts?${s}` : "/contacts";
  };

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of contacts ?? []) out[c.status] = (out[c.status] ?? 0) + 1;
    return out;
  }, [contacts]);

  const filtered = useMemo(() => {
    if (!contacts) return [];
    const term = search.trim().toLowerCase();
    let list = contacts.filter((c) => !statusFilter || c.status === statusFilter);
    if (term) {
      list = list.filter((c) =>
        [c.first_name, c.last_name, c.company, c.email, c.phone, c.notes, c.job_title, c.location, c.website, c.source, ...(c.tags ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    if (sort === "name") list = [...list].sort((a, b) => fullName(a).localeCompare(fullName(b)));
    if (sort === "company") list = [...list].sort((a, b) => (a.company || "~").localeCompare(b.company || "~"));
    return list;
  }, [contacts, search, statusFilter, sort]);

  const errorText = error === "load" ? t("contacts.loadError") : "";

  return (
    <main className="mx-auto max-w-6xl px-5 pb-10 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">{t("contacts.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {contacts ? `${contacts.length} ${t("crm.people")}` : ""}
            {contacts ? " · " : ""}
            <Link href="/data" className="font-semibold text-brand hover:underline">
              {t("data.link")}
            </Link>
          </p>
        </div>
        {!showForm && (
          <button type="button" onClick={() => setShowForm(true)} className="btn-brand">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("contacts.addShort")}
          </button>
        )}
      </div>

      {errorText && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-overdue">{errorText}</p>
      )}

      {showForm && orgId && (
        <AddContactForm
          orgId={orgId}
          onDone={() => {
            setShowForm(false);
            load();
            notifyContactsChanged();
          }}
        />
      )}

      {contacts && contacts.length > 0 && (
        <>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <label htmlFor="search" className="sr-only">{t("contacts.searchLabel")}</label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="search"
                type="search"
                placeholder={t("contacts.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-line bg-white py-3 pl-11 pr-5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              <span className="whitespace-nowrap">{t("crm.sortBy")}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-xl border border-line bg-white px-3 py-3 text-sm font-semibold text-ink outline-none focus:border-brand"
              >
                <option value="recent">{t("crm.sort.recent")}</option>
                <option value="name">{t("crm.sort.name")}</option>
                <option value="company">{t("crm.sort.company")}</option>
              </select>
            </label>
          </div>

          <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label={t("profile.leadStatus")}>
            {[{ key: "", label: t("crm.all"), n: contacts.length }, ...STATUSES.map((s) => ({ key: s as string, label: t(("status." + s) as Key), n: counts[s] ?? 0 }))].map((f) => (
              <Link
                key={f.key || "all"}
                href={hrefWith({ status: f.key || null, c: null })}
                role="tab"
                aria-selected={statusFilter === f.key}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 ${
                  statusFilter === f.key ? "border-ink bg-ink text-white" : "border-line bg-white text-slate-600 hover:border-slate-300 hover:text-ink"
                }`}
              >
                {f.label}
                <span className={`text-xs tabular-nums ${statusFilter === f.key ? "text-white/70" : "text-slate-400"}`}>{f.n}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {contacts === null && !error && <p className="mt-8 text-slate-600">{t("common.loading")}</p>}

      {contacts && contacts.length === 0 && !showForm && (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-white/70 p-10 text-center">
          <p className="text-lg font-semibold">{t("contacts.emptyTitle")}</p>
          <p className="mt-1 text-slate-600">{t("contacts.emptyText")}</p>
          <button type="button" onClick={() => setShowForm(true)} className="btn-brand mt-5 px-6">
            {t("contacts.addShort")}
          </button>
        </div>
      )}

      {contacts && contacts.length > 0 && filtered.length === 0 && (
        <p className="mt-8 text-slate-600">{t("contacts.noMatch")}</p>
      )}

      {filtered.length > 0 && (
        <div className="card mt-5 overflow-hidden">
          <ul className="divide-y divide-line/70">
            {filtered.map((c) => {
              const name = fullName(c);
              const tags = c.tags ?? [];
              return (
                <li
                  key={c.id}
                  className={`group relative grid gap-x-6 gap-y-2 px-5 py-4 transition-colors duration-200 hover:bg-slate-50/80 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center ${
                    openId === c.id ? "bg-brand-soft/60" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${avatarGradient(c.id)} text-sm font-bold text-white`}
                    >
                      {initials(name)}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={hrefWith({ c: c.id })}
                        scroll={false}
                        className="block truncate font-semibold text-ink after:absolute after:inset-0 group-hover:text-brand"
                      >
                        {name}
                      </Link>
                      <p className="truncate text-sm text-slate-500">
                        {[c.job_title, c.company].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0 space-y-0.5 text-sm text-slate-600">
                    {c.email && <p className="truncate">{c.email}</p>}
                    {c.phone && <p className="truncate text-slate-500">{c.phone}</p>}
                  </div>

                  <div className="min-w-0 space-y-1 text-sm">
                    {c.location && (
                      <p className="flex items-center gap-1.5 truncate text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{c.location}</span>
                      </p>
                    )}
                    {tags.length > 0 && (
                      <p className="flex flex-wrap gap-1">
                        {tags.slice(0, 2).map((tg) => (
                          <span key={tg} className="rounded-full border border-line px-2 py-0.5 text-[11px] font-semibold text-slate-600">{tg}</span>
                        ))}
                        {tags.length > 2 && <span className="text-[11px] font-semibold text-slate-400">+{tags.length - 2}</span>}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`pill ${statusTone[c.status] ?? "bg-slate-100 text-slate-700"}`}>
                      {t(("status." + c.status) as Key)}
                    </span>
                    <span className="relative z-10 hidden items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100 md:flex">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} aria-label={`${t("crm.call")} ${name}`} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-white hover:text-brand hover:shadow-sm">
                          <Phone className="h-4 w-4" aria-hidden="true" />
                        </a>
                      )}
                      {c.email && (
                        <a href={`mailto:${c.email}`} aria-label={`${t("crm.email")} ${name}`} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-white hover:text-brand hover:shadow-sm">
                          <Mail className="h-4 w-4" aria-hidden="true" />
                        </a>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {openId && orgId && (
        <ContactDrawer
          key={openId}
          id={openId}
          orgId={orgId}
          onClose={() => router.replace(hrefWith({ c: null }), { scroll: false })}
          onChanged={load}
        />
      )}
    </main>
  );
}

export default function ContactsPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <ContactsView />
      </Suspense>
    </RequireAuth>
  );
}
