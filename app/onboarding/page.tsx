"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/require-auth";
import AuthShell, { AuthTitle, authButton, authError, authInputDark, authLabel } from "@/components/auth-shell";
import Mark from "@/components/mark";
import { useLanguage } from "@/components/language-provider";
import { supabase } from "@/lib/supabase";

function OnboardingForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const workspaceName = name.trim();
    if (workspaceName.length === 0 || workspaceName.length > 80) {
      setError(t("onb.invalid"));
      return;
    }

    setError("");
    setBusy(true);
    const { error: failure } = await supabase.rpc("create_workspace", {
      workspace_name: workspaceName,
    });
    if (failure) {
      setError(t("common.error"));
      setBusy(false);
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <AuthShell>
      <Mark className="mx-auto mb-4 h-16 w-16" />
      <AuthTitle>{t("onb.title")}</AuthTitle>
      <p className="mt-3 text-center text-slate-300">{t("onb.sub")}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="workspace" className={authLabel}>
            {t("onb.label")}
          </label>
          <input
            id="workspace"
            type="text"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={authInputDark}
          />
        </div>

        {error && (
          <p role="alert" className={authError}>
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className={authButton}>
          {busy ? t("auth.wait") : t("onb.continue")}
        </button>
      </form>
    </AuthShell>
  );
}

export default function OnboardingPage() {
  return (
    <RequireAuth requireWorkspace={false}>
      <OnboardingForm />
    </RequireAuth>
  );
}
