"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell, { AuthTitle, authButton, authError, authInfo, authInputDark, authLabel, authLink } from "@/components/auth-shell";
import { useLanguage } from "@/components/language-provider";
import { supabase } from "@/lib/supabase";

type State = "checking" | "confirm" | "ready" | "invalid" | "done";

export default function ResetPasswordForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [state, setState] = useState<State>("checking");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // The link in the email signs the visitor in briefly; wait for that session.
  useEffect(() => {
    // New-style link: /reset-password?token_hash=...&type=recovery. The token is only
    // spent when the person presses the button, so email scanners that open links
    // in advance cannot use it up.
    const params = new URLSearchParams(window.location.search);
    if (params.get("token_hash") && params.get("type") === "recovery") {
      setState("confirm");
      return;
    }
    let settled = false;
    const settle = (next: State) => {
      settled = true;
      setState((current) => (current === "done" ? current : next));
    };
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) settle("ready");
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session) settle("ready");
    });
    const timer = setTimeout(() => {
      if (!settled) settle("invalid");
    }, 5000);
    return () => {
      clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, []);

  async function confirmLink() {
    setBusy(true);
    const tokenHash = new URLSearchParams(window.location.search).get("token_hash") ?? "";
    const { error: failure } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });
    setBusy(false);
    setState(failure ? "invalid" : "ready");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (password !== repeat) {
      setError(t("reset.mismatch"));
      return;
    }
    setBusy(true);
    try {
      const { error: failure } = await supabase.auth.updateUser({ password });
      if (failure) {
        setError(failure.code === "weak_password" ? t("auth.err.weak") : t("common.error"));
        setBusy(false);
        return;
      }
      setState("done");
      setTimeout(() => router.replace("/dashboard"), 1500);
    } catch {
      setError(t("common.error"));
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <AuthTitle>{t("reset.title")}</AuthTitle>

      {state === "checking" && <p className="mt-4 text-center text-sm text-slate-300">{t("reset.checking")}</p>}

      {state === "confirm" && (
        <>
          <p className="mb-6 mt-3 text-center text-sm text-slate-300">{t("reset.verify")}</p>
          <button type="button" onClick={confirmLink} disabled={busy} className={`${authButton} mt-6 block text-center`}>
            {busy ? t("auth.wait") : t("reset.verifyBtn")}
          </button>
        </>
      )}

      {state === "invalid" && (
        <>
          <p role="alert" className={`${authError} mt-6`}>
            {t("reset.invalid")}
          </p>
          <Link href="/forgot-password" className={`${authButton} mt-6 block text-center`}>
            {t("reset.invalidBtn")}
          </Link>
        </>
      )}

      {state === "done" && (
        <p role="status" className={`${authInfo} mt-6`}>
          {t("reset.done")}
        </p>
      )}

      {state === "ready" && (
        <>
          <p className="mb-6 mt-3 text-center text-sm text-slate-300">{t("reset.sub")}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className={authLabel}>
                {t("reset.new")}
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={authInputDark}
              />
            </div>
            <div>
              <label htmlFor="repeat" className={authLabel}>
                {t("reset.confirm")}
              </label>
              <input
                id="repeat"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                className={authInputDark}
              />
            </div>
            {error && (
              <p role="alert" className={authError}>
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className={authButton}>
              {busy ? t("auth.wait") : t("reset.btn")}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
