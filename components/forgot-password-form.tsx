"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell, { AuthTitle, authButton, authError, authInfo, authInputDark, authLabel, authLink } from "@/components/auth-shell";
import { useLanguage } from "@/components/language-provider";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { error: failure } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (
        failure?.code === "over_email_send_rate_limit" ||
        failure?.code === "over_request_rate_limit"
      ) {
        setError(t("auth.err.rate"));
      } else {
        // Same answer whether or not the account exists, so nobody can probe for emails.
        setSent(true);
      }
    } catch {
      setError(t("common.error"));
    }
    setBusy(false);
  }

  return (
    <AuthShell>
      <AuthTitle>{t("forgot.title")}</AuthTitle>
      <p className="mb-6 mt-3 text-center text-sm text-slate-300">{t("forgot.sub")}</p>

      {sent ? (
        <p role="status" className={`${authInfo} mt-6`}>
          {t("forgot.sent")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={authLabel}>
              {t("auth.email")}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputDark}
            />
          </div>
          {error && (
            <p role="alert" className={authError}>
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className={authButton}>
            {busy ? t("auth.wait") : t("forgot.btn")}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className={authLink}>
          {t("forgot.back")}
        </Link>
      </p>
    </AuthShell>
  );
}
