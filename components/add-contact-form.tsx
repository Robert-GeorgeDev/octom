"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/language-provider";
import type { Key } from "@/lib/dictionaries";
import { STATUSES, type Status } from "@/types/contact";

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

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
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("New");
  const [notes, setNotes] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("");
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (firstName.trim().length === 0) {
      setError(t("form.firstNameRequired"));
      return;
    }
    setError("");
    setBusy(true);
    const { error: failure } = await supabase.from("contacts").insert({
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
    });
    if (failure) {
      setError(t("common.error"));
      setBusy(false);
      return;
    }
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-4 rounded-xl border border-line bg-white p-5"
    >
      <h2 className="text-lg font-semibold">{t("form.newContact")}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium">
            {t("form.firstName")}
          </label>
          <input
            id="firstName"
            required
            maxLength={80}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium">
            {t("form.lastName")}
          </label>
          <input
            id="lastName"
            maxLength={80}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium">
          {t("form.company")}
        </label>
        <input
          id="company"
          maxLength={120}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            {t("form.email")}
          </label>
          <input
            id="email"
            type="email"
            maxLength={200}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            {t("form.phone")}
          </label>
          <input
            id="phone"
            type="tel"
            maxLength={40}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setMore((v) => !v)}
        aria-expanded={more}
        className="text-sm font-semibold text-brand hover:underline"
      >
        {more ? t("crm.fewerDetails") : t("crm.moreDetails")}
      </button>

      {more && (
        <div className="grid gap-4 sm:grid-cols-2 [animation:crm-fade_.25s_ease-out]">
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium">{t("crm.jobTitle")}</label>
            <input id="jobTitle" maxLength={120} value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium">{t("crm.website")}</label>
            <input id="website" maxLength={200} placeholder="example.com" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium">{t("crm.location")}</label>
            <input id="location" maxLength={200} value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="source" className="block text-sm font-medium">{t("crm.source")}</label>
            <input id="source" maxLength={120} placeholder={t("crm.sourcePlaceholder")} value={source} onChange={(e) => setSource(e.target.value)} className={inputClass} />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          {t("form.status")}
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          className={inputClass}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(("status." + s) as Key)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium">
          {t("form.notes")}
        </label>
        <textarea
          id="notes"
          rows={3}
          maxLength={5000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-overdue">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-cta px-6 py-3 font-semibold text-white hover:bg-cta-dark disabled:opacity-60"
        >
          {busy ? t("form.saving") : t("form.save")}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl border border-line bg-white px-6 py-3 font-semibold text-ink hover:bg-brand-soft"
        >
          {t("form.cancel")}
        </button>
      </div>
    </form>
  );
}
