"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight, Building2, Check, Globe, Mail, MapPin, MessageCircle, MoreHorizontal, Pencil,
  Phone, Plus, Tag, Trash2, X, Briefcase, Compass, AtSign, PhoneCall,
} from "lucide-react";
import ActivityTimeline from "@/components/activity-timeline";
import AiAssistant from "@/components/ai-assistant";
import FollowUpCard, { type Group } from "@/components/followup-card";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";
import { useFollowUps } from "@/hooks/use-followups";
import { notifyContactsChanged } from "@/hooks/use-contact-counts";
import { supabase } from "@/lib/supabase";
import { addDays, formatDate, todayISO } from "@/lib/dates";
import {
  CONTACT_KINDS, avatarGradient, fullName, initials, relativeTime, websiteHref, websiteLabel,
  whatsappHref, type ContactKind,
} from "@/lib/contact-utils";
import type { Key } from "@/lib/dictionaries";
import { STATUSES, type Contact, type Status } from "@/types/contact";
import type { FollowUp } from "@/types/followup";

const statusTone: Record<string, string> = {
  New: "bg-slate-100 text-slate-700",
  Contacted: "bg-indigo-50 text-brand",
  Qualified: "bg-sky-50 text-sky-700",
  "Proposal Sent": "bg-amber-50 text-amber-700",
  Negotiation: "bg-orange-50 text-orange-700",
  Won: "bg-emerald-50 text-done",
  Lost: "bg-red-50 text-overdue",
};

const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

type TextField = "job_title" | "company" | "email" | "phone" | "website" | "location" | "source";

/* ---------- one editable detail row ---------- */
function DetailRow({
  label, Icon, value, type = "text", maxLength, href, display, onSave, placeholder,
}: {
  label: string;
  Icon: typeof Phone;
  value: string;
  type?: string;
  maxLength: number;
  href?: string;
  display?: string;
  placeholder: string;
  onSave: (v: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  async function commit() {
    if (saving) return;
    const next = draft.trim();
    if (next === value.trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const ok = await onSave(next);
    setSaving(false);
    if (ok) setEditing(false);
  }

  return (
    <div className="group/row grid grid-cols-[110px_minmax(0,1fr)] items-center gap-3 py-1.5 text-sm">
      <span className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </span>
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            commit();
          }}
          className="flex items-center gap-1"
        >
          <input
            ref={ref}
            type={type}
            value={draft}
            maxLength={maxLength}
            disabled={saving}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setDraft(value);
                setEditing(false);
              }
            }}
            aria-label={label}
            className="min-w-0 flex-1 rounded-lg border border-brand/40 bg-white px-2.5 py-1.5 text-sm outline-none ring-2 ring-brand/15"
          />
        </form>
      ) : (
        <div className="flex min-w-0 items-center gap-1">
          {value ? (
            href ? (
              <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="min-w-0 truncate font-medium text-ink underline decoration-slate-300 decoration-dotted underline-offset-4 hover:text-brand hover:decoration-brand">
                {display ?? value}
              </a>
            ) : (
              <span className="min-w-0 truncate font-medium text-ink">{display ?? value}</span>
            )
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft("");
                setEditing(true);
              }}
              className="truncate text-left text-slate-400 hover:text-brand"
            >
              {placeholder}
            </button>
          )}
          {value && (
            <button
              type="button"
              onClick={() => {
                setDraft(value);
                setEditing(true);
              }}
              aria-label={`${label}: ${placeholder}`}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-ink focus:opacity-100 group-hover/row:opacity-100"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- main component ---------- */
export default function ContactDetail({
  id, orgId, variant, onDeleted, onOpenFull,
}: {
  id: string;
  orgId: string;
  variant: "page" | "drawer";
  onDeleted: () => void;
  onOpenFull?: string;
}) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const locale = lang === "ro" ? "ro-RO" : "en-GB";
  const { followUps, reload: reloadFollowUps } = useFollowUps(orgId);

  const [contact, setContact] = useState<Contact | null | undefined>(undefined);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"activity" | "followups" | "notes" | "ai">("activity");
  const [menu, setMenu] = useState(false);
  const [version, setVersion] = useState(0);
  const [lastContacted, setLastContacted] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", id)
      .eq("organization_id", orgId)
      .maybeSingle();
    if (queryError) {
      setLoadFailed(true);
      return;
    }
    setLoadFailed(false);
    setContact(data ? (data as Contact) : null);
  }, [id, orgId]);

  useEffect(() => {
    setContact(undefined);
    setTab("activity");
    setError("");
    load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("activities")
      .select("created_at")
      .eq("organization_id", orgId)
      .eq("contact_id", id)
      .eq("type", "contacted")
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (!cancelled) setLastContacted(data && data[0] ? String(data[0].created_at) : null);
      });
    return () => {
      cancelled = true;
    };
  }, [orgId, id, version]);

  const bump = () => setVersion((v) => v + 1);

  async function patch(values: Partial<Record<string, unknown>>): Promise<boolean> {
    setError("");
    const { error: failure } = await supabase.from("contacts").update(values).eq("id", id);
    if (failure) {
      setError(
        /column|schema cache/i.test(String(failure.message)) ? t("crm.needsUpdate") : t("common.error")
      );
      return false;
    }
    await load();
    bump();
    notifyContactsChanged();
    return true;
  }

  async function logActivity(kind: ContactKind | "message", text: string): Promise<boolean> {
    if (!user) return false;
    const base = { organization_id: orgId, contact_id: id, created_by: user.id };
    const row =
      kind === "note"
        ? { ...base, type: "note", description: text.slice(0, 900) }
        : { ...base, type: "contacted", description: text ? `${kind}|${text.slice(0, 900)}` : kind };
    const { error: failure } = await supabase.from("activities").insert(row);
    if (failure) {
      setError(t("common.error"));
      return false;
    }
    bump();
    return true;
  }

  async function remove() {
    if (!window.confirm(t("contacts.confirmDelete"))) return;
    const { error: failure } = await supabase.from("contacts").delete().eq("id", id);
    if (failure) {
      setError(t("contacts.deleteError"));
      return;
    }
    notifyContactsChanged();
    onDeleted();
  }

  if (loadFailed) return <p className="p-8 text-slate-600">{t("profile.loadError")}</p>;
  if (contact === undefined) {
    return (
      <div className="p-8" aria-busy="true">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }
  if (contact === null) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold">{t("profile.notFound")}</h1>
        <Link href="/contacts" className="btn-brand mt-5">{t("profile.backToContacts")}</Link>
      </div>
    );
  }

  const name = fullName(contact);
  const tags = contact.tags ?? [];
  const today = todayISO();
  const mine = (followUps ?? []).filter((f) => f.contact_id === id);
  const open = mine
    .filter((f) => f.status === "open")
    .sort((a, b) => (a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0));
  const done = mine.filter((f) => f.status === "done").slice(-5).reverse();
  const nextFu = open[0];
  const groupOf = (date: string): Group => (date < today ? "overdue" : date === today ? "today" : "upcoming");

  const web = websiteHref(contact.website);
  const wa = whatsappHref(contact.phone);

  const action = (
    key: string,
    label: string,
    Icon: typeof Phone,
    href: string,
    onUse: () => void,
    missing: string
  ) =>
    href ? (
      <a
        key={key}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        onClick={onUse}
        className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-sm font-semibold text-ink shadow-sm transition duration-200 hover:-translate-y-px hover:border-brand/40 hover:text-brand hover:shadow-soft active:translate-y-0"
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </a>
    ) : (
      <span
        key={key}
        title={missing}
        aria-disabled="true"
        className="inline-flex min-h-[40px] cursor-not-allowed items-center gap-2 rounded-xl border border-dashed border-line bg-slate-50 px-3.5 text-sm font-semibold text-slate-400"
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </span>
    );

  const tabs: { id: typeof tab; label: string; count?: number }[] = [
    { id: "activity", label: t("activity.title") },
    { id: "followups", label: t("profile.followUps"), count: open.length },
    { id: "notes", label: t("profile.notes") },
    { id: "ai", label: t("crm.tab.ai") },
  ];

  const detail = (key: TextField, label: string, Icon: typeof Phone, extra: Partial<Parameters<typeof DetailRow>[0]> = {}) => (
    <DetailRow
      label={label}
      Icon={Icon}
      value={(contact[key] as string | null | undefined) ?? ""}
      maxLength={key === "job_title" || key === "source" ? 120 : key === "email" ? 200 : key === "phone" ? 40 : key === "company" ? 120 : 200}
      placeholder={t("crm.add")}
      onSave={(v) => patch({ [key]: v })}
      {...extra}
    />
  );

  return (
    <div className={`flex min-h-full flex-col bg-white ${variant === "page" ? "overflow-hidden rounded-2xl border border-line shadow-soft" : ""}`}>
      {/* Header */}
      <header className="relative border-b border-line px-5 pb-5 pt-6 sm:px-7">
        <div className="flex flex-wrap items-start gap-x-5 gap-y-4">
          <span
            aria-hidden="true"
            className={`grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br ${avatarGradient(contact.id)} text-xl font-extrabold text-white shadow-soft ring-4 ring-brand-soft`}
          >
            {initials(name)}
          </span>

          <div className="min-w-0 flex-1 basis-60 pr-24 sm:pr-0">
            <h1 className="truncate text-2xl font-extrabold tracking-tight text-ink">{name}</h1>
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {[contact.job_title, contact.company].filter(Boolean).join(" · ") || contact.email || "—"}
              {contact.source ? ` · ${t("crm.via")} ${contact.source}` : ""}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="relative">
                <span className="sr-only">{t("profile.leadStatus")}</span>
                <select
                  value={contact.status}
                  onChange={(e) => patch({ status: e.target.value as Status })}
                  className={`cursor-pointer appearance-none rounded-full border-0 py-1 pl-3 pr-7 text-xs font-bold outline-none ring-1 ring-inset ring-black/5 transition focus:ring-2 focus:ring-brand/40 ${statusTone[contact.status] ?? statusTone.New}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{t(("status." + s) as Key)}</option>
                  ))}
                </select>
                <span aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] opacity-60">▼</span>
              </label>
              {tags.slice(0, 3).map((tg) => (
                <span key={tg} className="rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600">{tg}</span>
              ))}
              {tags.length > 3 && <span className="text-xs font-semibold text-slate-400">+{tags.length - 3}</span>}
            </div>
          </div>

          <div className="absolute right-4 top-4 flex items-start gap-2 sm:static">
            {variant === "drawer" && onOpenFull && (
              <Link href={onOpenFull} aria-label={t("crm.openFull")} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-ink">
                <span className="hidden sm:inline">{t("crm.openFull")}</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menu}
                aria-label={t("crm.more")}
                className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-slate-600 transition hover:bg-slate-50"
              >
                <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
              </button>
              {menu && (
                <>
                  <button type="button" aria-label="Close" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenu(false)} />
                  <div role="menu" className="absolute right-0 z-20 mt-2 w-52 origin-top-right rounded-xl border border-line bg-white p-1.5 shadow-lift">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenu(false);
                        remove();
                      }}
                      className="flex min-h-[40px] w-full items-center gap-2.5 rounded-lg px-3 text-sm font-semibold text-overdue hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      {t("contacts.delete")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {action("call", t("crm.call"), Phone, contact.phone ? `tel:${contact.phone}` : "", () => logActivity("call", ""), t("crm.addPhoneFirst"))}
          {action("email", t("crm.email"), Mail, contact.email ? `mailto:${contact.email}` : "", () => logActivity("email", ""), t("crm.addEmailFirst"))}
          {action("wa", t("crm.message"), MessageCircle, wa, () => logActivity("message", ""), t("crm.addPhoneFirst"))}
          {action("web", t("crm.website"), Globe, web, () => {}, t("crm.addWebsiteFirst"))}
          <span className="ml-auto hidden text-xs text-slate-500 sm:block">
            {lastContacted
              ? `${t("crm.lastContacted")} ${relativeTime(lastContacted, locale)}`
              : t("crm.neverContacted")}
            {nextFu && ` · ${t("crm.nextFollowUp")} ${formatDate(nextFu.due_date, locale)}`}
          </span>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-overdue">{error}</p>
        )}
      </header>

      {/* Body */}
      <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 px-5 py-5 sm:px-7">
          <div role="tablist" aria-label={name} className="-mx-1 flex gap-1 overflow-x-auto border-b border-line pb-3">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                type="button"
                role="tab"
                aria-selected={tab === tb.id}
                onClick={() => setTab(tb.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors duration-200 ${
                  tab === tb.id ? "bg-slate-100 text-ink" : "text-slate-500 hover:bg-slate-50 hover:text-ink"
                }`}
              >
                {tb.label}
                {tb.count ? <span className="rounded-full bg-brand px-1.5 text-[11px] leading-5 text-white">{tb.count}</span> : null}
              </button>
            ))}
          </div>

          <div key={tab} className="pt-5 [animation:crm-fade_.25s_ease-out]">
            {tab === "activity" && (
              <>
                <LogBox onLog={logActivity} t={t} />
                <ActivityTimeline bare orgId={orgId} contactId={id} refreshKey={`${version}|${contact.status}|${contact.notes}|${open.map((f) => f.id + f.due_date).join(",")}|${done.length}`} />
              </>
            )}

            {tab === "followups" && (
              <FollowUpsTab
                orgId={orgId}
                contactId={id}
                open={open}
                done={done}
                groupOf={groupOf}
                onChanged={() => {
                  reloadFollowUps();
                  bump();
                }}
                t={t}
                locale={locale}
              />
            )}

            {tab === "notes" && <NotesTab contact={contact} onSave={(v) => patch({ notes: v })} t={t} />}

            {tab === "ai" && <AiAssistant contactId={id} email={contact.email} />}
          </div>
        </div>

        {/* Details column */}
        <aside className="border-t border-line bg-slate-50/50 px-5 py-5 sm:px-7 lg:border-l lg:border-t-0 lg:px-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("crm.details")}</h2>
          <div className="mt-2 divide-y divide-line/60">
            {detail("job_title", t("crm.jobTitle"), Briefcase)}
            {detail("company", t("form.company"), Building2)}
            {detail("email", t("form.email"), AtSign, { type: "email", href: contact.email ? `mailto:${contact.email}` : undefined })}
            {detail("phone", t("form.phone"), PhoneCall, { type: "tel", href: contact.phone ? `tel:${contact.phone}` : undefined })}
            {detail("website", t("crm.website"), Globe, { href: web || undefined, display: websiteLabel(contact.website) })}
            {detail("location", t("crm.location"), MapPin)}
            {detail("source", t("crm.source"), Compass)}
          </div>

          <h2 className="mt-7 text-xs font-bold uppercase tracking-wide text-slate-400">{t("crm.tags")}</h2>
          <TagEditor tags={tags} onChange={(next) => patch({ tags: next })} t={t} />

          {contact.created_at && (
            <p className="mt-7 text-xs text-slate-400">
              {t("crm.added")} {new Date(contact.created_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ---------- activity composer ---------- */
function LogBox({
  onLog, t,
}: {
  onLog: (kind: ContactKind, text: string) => Promise<boolean>;
  t: (k: Key) => string;
}) {
  const [kind, setKind] = useState<ContactKind>("note");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    setBusy(true);
    const ok = await onLog(kind, v);
    setBusy(false);
    if (ok) setText("");
  }

  return (
    <form onSubmit={submit} className="mb-6 rounded-2xl border border-line bg-white p-3 shadow-sm transition focus-within:border-brand/40 focus-within:shadow-soft">
      <div className="mb-2 flex flex-wrap gap-1">
        {CONTACT_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${kind === k ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {t(("crm.kind." + k) as Key)}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={900}
        rows={2}
        placeholder={t("crm.logPlaceholder")}
        aria-label={t("crm.logPlaceholder")}
        className="w-full resize-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-slate-400"
      />
      <div className="flex justify-end">
        <button type="submit" disabled={busy || !text.trim()} className="btn-brand min-h-[36px] px-4 py-1.5">
          {busy ? t("form.saving") : t("crm.log")}
        </button>
      </div>
    </form>
  );
}

/* ---------- follow-ups tab ---------- */
function FollowUpsTab({
  orgId, contactId, open, done, groupOf, onChanged, t, locale,
}: {
  orgId: string;
  contactId: string;
  open: FollowUp[];
  done: FollowUp[];
  groupOf: (d: string) => Group;
  onChanged: () => void;
  t: (k: Key) => string;
  locale: string;
}) {
  const [date, setDate] = useState(addDays(todayISO(), 1));
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const quick = [
    { label: t("crm.tomorrow"), days: 1 },
    { label: t("crm.in3days"), days: 3 },
    { label: t("crm.nextWeek"), days: 7 },
    { label: t("crm.in2weeks"), days: 14 },
  ];

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    setBusy(true);
    setError("");
    const { error: failure } = await supabase.from("follow_ups").insert({
      organization_id: orgId,
      contact_id: contactId,
      due_date: date,
      priority: "Normal",
      note: note.trim(),
    });
    setBusy(false);
    if (failure) {
      setError(t("common.error"));
      return;
    }
    setNote("");
    onChanged();
  }

  return (
    <div>
      <form onSubmit={add} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold">{t("crm.scheduleFollowUp")}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {quick.map((q) => {
            const value = addDays(todayISO(), q.days);
            return (
              <button
                key={q.days}
                type="button"
                onClick={() => setDate(value)}
                aria-pressed={date === value}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${date === value ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {q.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[170px_minmax(0,1fr)_auto]">
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} aria-label={t("fu.date")} className={inputClass} />
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder={t("crm.followUpNote")} aria-label={t("crm.followUpNote")} className={inputClass} />
          <button type="submit" disabled={busy} className="btn-brand">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("crm.add")}
          </button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-overdue">{error}</p>}
      </form>

      <div className="mt-5 space-y-3">
        {open.length === 0 && <p className="text-sm text-slate-600">{t("profile.noFollowUps")}</p>}
        {open.map((f) => (
          <FollowUpCard key={f.id} item={f} group={groupOf(f.due_date)} onChanged={onChanged} />
        ))}
      </div>

      {done.length > 0 && (
        <>
          <h3 className="mb-2 mt-7 text-xs font-bold uppercase tracking-wide text-slate-400">{t("crm.completed")}</h3>
          <ul className="space-y-1.5">
            {done.map((f) => (
              <li key={f.id} className="flex items-center gap-2 text-sm text-slate-500">
                <Check className="h-4 w-4 text-done" aria-hidden="true" />
                <span>{formatDate(f.due_date, locale)}</span>
                {f.note && <span className="truncate">· {f.note}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* ---------- notes tab ---------- */
function NotesTab({
  contact, onSave, t,
}: {
  contact: Contact;
  onSave: (v: string) => Promise<boolean>;
  t: (k: Key) => string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const value = draft ?? contact.notes;
  const dirty = draft !== null && draft !== contact.notes;

  return (
    <div>
      <textarea
        rows={9}
        maxLength={5000}
        value={value}
        onChange={(e) => setDraft(e.target.value)}
        aria-label={t("profile.notes")}
        placeholder={t("crm.notesPlaceholder")}
        className={inputClass}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={!dirty || busy}
          onClick={async () => {
            setBusy(true);
            const ok = await onSave((draft ?? "").trim());
            setBusy(false);
            if (ok) setDraft(null);
          }}
          className="btn-brand"
        >
          {busy ? t("form.saving") : t("profile.saveNotes")}
        </button>
        {dirty && (
          <button type="button" onClick={() => setDraft(null)} className="text-sm font-semibold text-slate-500 hover:text-ink">
            {t("form.cancel")}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- tags ---------- */
function TagEditor({
  tags, onChange, t,
}: {
  tags: string[];
  onChange: (next: string[]) => Promise<boolean>;
  t: (k: Key) => string;
}) {
  const [draft, setDraft] = useState("");

  async function add() {
    const v = draft.trim().replace(/,+$/, "").slice(0, 24);
    setDraft("");
    if (!v || tags.some((x) => x.toLowerCase() === v.toLowerCase()) || tags.length >= 10) return;
    await onChange([...tags, v]);
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tg) => (
          <span key={tg} className="group/tag inline-flex items-center gap-1 rounded-full border border-line bg-white py-0.5 pl-2.5 pr-1 text-xs font-semibold text-slate-700">
            {tg}
            <button
              type="button"
              onClick={() => onChange(tags.filter((x) => x !== tg))}
              aria-label={`${t("crm.removeTag")} ${tg}`}
              className="grid h-4 w-4 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-overdue"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>
      {tags.length < 10 && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-line bg-white px-2.5 py-1.5 focus-within:border-brand/50">
          <Tag className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <input
            value={draft}
            maxLength={24}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add();
              }
            }}
            onBlur={add}
            placeholder={t("crm.addTag")}
            aria-label={t("crm.addTag")}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      )}
    </div>
  );
}
