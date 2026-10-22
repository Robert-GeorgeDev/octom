"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/language-provider";
import { addDays, todayISO } from "@/lib/dates";
import type { Key } from "@/lib/dictionaries";
import { STATUSES, type Status } from "@/types/contact";
import { Plus, X } from "lucide-react";

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
const labelClass = "block text-sm font-medium text-slate-700";
const sectionClass = "text-xs font-bold uppercase tracking-wide text-slate-400";
const MAX_TAGS = 10;

export default function AddContactForm({
  orgId,
  onDone,
}: {
  orgId: string;
  onDone: () => void;
}) {
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<Status>("New");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [error, setError] = useState("");
  const [partial, setPartial] = useState(false);
  const [busy, setBusy] = useState(false);

  function addTag() {
    const v = tagDraft.trim().replace(/,$/, "").trim();
    setTagDraft("");
    if (!v || tags.length >= MAX_TAGS || tags.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    setTags([...tags, v]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (firstName.trim().length === 0) {
      setError(t("form.firstNameRequired"));
      return;
    }
    setError("");
    setBusy(true);
    const pendingTag = tagDraft.trim();
    const allTags =
      pendingTag && tags.length < MAX_TAGS && !tags.some((x) => x.toLowerCase() === pendingTag.toLowerCase())
        ? [...tags, pendingTag]
        : tags;
    const id = crypto.randomUUID();
    const { error: failure } = await supabase.from("contacts").insert({
      id,
      organization_id: orgId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      status,
      notes: notes.trim(),
      // Only sent when filled in, so adding a contact keeps working
      // even before supabase/contacts-v2.sql has been run.
      ...(jobTitle.trim() ? { job_title: jobTitle.trim() } : {}),
      ...(website.trim() ? { website: website.trim() } : {}),
      ...(location.trim() ? { location: location.trim() } : {}),
      ...(source.trim() ? { source: source.trim() } : {}),
      ...(allTags.length > 0 ? { tags: allTags } : {}),
    });
    if (failure) {
      setError(t("common.error"));
      setBusy(false);
      return;
    }

    if (followUpDate) {
      const { error: followUpFailure } = await supabase.from("follow_ups").insert({
        organization_id: orgId,
        contact_id: id,
        due_date: followUpDate,
        note: followUpNote.trim(),
      });
      if (followUpFailure) {
        // The contact exists now, so do not offer to save it a second time.
        setPartial(true);
        setBusy(false);
        return;
      }
    }
    onDone();
  }

  const today = todayISO();
  const shortcuts: { label: Key; date: string }[] = [
    { label: "add.tomorrow", date: addDays(today, 1) },
    { label: "add.in3", date: addDays(today, 3) },
    { label: "add.nextWeek", date: addDays(today, 7) },
  ];

  if (partial) {
    return (
      <div className="mt-6 rounded-[28px] border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{t("add.savedPartial")}</p>
        <button type="button" onClick={onDone} className="btn-brand mt-4">{t("add.close")}</button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-7 rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_10px_40px_-14px_rgba(79,70,229,.18)] backdrop-blur-xl sm:p-7"
    >
      <h2 className="text-xl font-semibold">{t("form.newContact")}</h2>

      <fieldset className="space-y-4">
        <legend className={sectionClass}>{t("add.sec.who")}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className={labelClass}>{t("form.firstName")}</label>
            <input id="firstName" required maxLength={80} autoFocus value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>{t("form.lastName")}</label>
            <input id="lastName" maxLength={80} value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="company" className={labelClass}>{t("form.company")}</label>
            <input id="company" maxLength={120} value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="jobTitle" className={labelClass}>{t("crm.jobTitle")}</label>
            <input id="jobTitle" maxLength={120} value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputClass} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={sectionClass}>{t("add.sec.reach")}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className={labelClass}>{t("form.email")}</label>
            <input id="email" type="email" maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>{t("form.phone")}</label>
            <input id="phone" type="tel" maxLength={40} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="website" className={labelClass}>{t("crm.website")}</label>
            <input id="website" maxLength={200} placeholder="example.com" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="location" className={labelClass}>{t("crm.location")}</label>
            <input id="location" maxLength={200} value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={sectionClass}>{t("add.sec.about")}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="status" className={labelClass}>{t("form.status")}</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as Status)} className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{t(("status." + s) as Key)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="source" className={labelClass}>{t("crm.source")}</label>
            <input id="source" maxLength={120} placeholder={t("crm.sourcePlaceholder")} value={source} onChange={(e) => setSource(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="tag" className={labelClass}>{t("crm.tags")}</label>
          <div className="mt-1 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
            {tags.map((tg) => (
              <span key={tg} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-dark">
                {tg}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((x) => x !== tg))}
                  aria-label={`${t("crm.removeTag")} ${tg}`}
                  className="grid h-4 w-4 place-items-center rounded-full hover:bg-white"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            ))}
            {tags.length < MAX_TAGS && (
              <input
                id="tag"
                maxLength={40}
                value={tagDraft}
                placeholder={t("crm.addTag")}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="min-w-[10rem] flex-1 bg-transparent py-1 text-sm outline-none"
              />
            )}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className={labelClass}>{t("form.notes")}</label>
          <textarea id="notes" rows={3} maxLength={5000} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={sectionClass}>{t("add.sec.next")}</legend>
        <div>
          <label htmlFor="followUpDate" className={labelClass}>{t("add.followUpOn")}</label>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              id="followUpDate"
              type="date"
              min={today}
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="rounded-xl border border-line bg-white px-4 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            {shortcuts.map((s) => (
              <button
                key={s.label}
                type="button"
                aria-pressed={followUpDate === s.date}
                onClick={() => setFollowUpDate(s.date)}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold ${followUpDate === s.date ? "border-ink bg-ink text-white" : "border-line bg-white text-slate-700 hover:bg-brand-soft"}`}
              >
                {t(s.label)}
              </button>
            ))}
            {followUpDate && (
              <button type="button" onClick={() => setFollowUpDate("")} className="text-sm font-semibold text-slate-500 hover:text-ink">
                {t("add.noDate")}
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">{t("add.followUpHint")}</p>
        </div>
        {followUpDate && (
          <div>
            <label htmlFor="followUpNote" className={labelClass}>{t("add.followUpNote")}</label>
            <input id="followUpNote" maxLength={500} value={followUpNote} onChange={(e) => setFollowUpNote(e.target.value)} className={inputClass} />
          </div>
        )}
      </fieldset>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-overdue">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="btn-brand px-6">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {busy ? t("form.saving") : t("form.save")}
        </button>
        <button type="button" onClick={onDone} className="btn border border-line bg-white px-6 text-ink hover:bg-brand-soft">
          {t("form.cancel")}
        </button>
      </div>
    </form>
  );
}
