"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell, { AuthTitle, authButton, authError, authLink } from "@/components/auth-shell";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";
import { supabase } from "@/lib/supabase";

export default function JoinPage() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [info, setInfo] = useState<{ organization_name: string; role: string } | null>(null);
  const [state, setState] = useState<"loading" | "invalid" | "ready">("loading");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  useEffect(() => {
    if (token === null || loading || !user) return;
    if (!token) {
      setState("invalid");
      return;
    }
    supabase.rpc("preview_invitation", { invite_token: token }).then(({ data, error: failure }) => {
      const row = Array.isArray(data) ? data[0] : null;
      if (failure || !row) {
        setState("invalid");
      } else {
        setInfo(row as { organization_name: string; role: string });
        setState("ready");
      }
    });
  }, [token, loading, user]);

  async function accept() {
    if (!token) return;
    setBusy(true);
    setError("");
    const { error: failure } = await supabase.rpc("accept_invitation", { invite_token: token });
    if (failure) {
      const m = String(failure.message);
      setError(
        m.includes("already_in_workspace") ? t("join.err.inWorkspace")
        : m.includes("plan_limit_seats") ? t("join.err.seats")
        : m.includes("already_member") ? t("join.err.already")
        : m.includes("invalid_invitation") ? t("join.invalid")
        : t("common.error")
      );
      setBusy(false);
      return;
    }
    router.replace("/dashboard");
  }

  const roleLabel: Record<string, string> = {
    admin: t("team.role.admin"),
    member: t("team.role.member"),
  };

  const secondary =
    "min-h-[44px] flex-1 rounded-xl border border-white/15 bg-white/[.06] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10";
  const primary = authButton.replace("w-full", "flex-1 text-center text-sm");
  const text = "mt-4 text-center text-slate-300";

  return (
    <AuthShell>
      <AuthTitle>{t("join.title")}</AuthTitle>

      {loading || token === null ? (
        <p className={text}>{t("common.loading")}</p>
      ) : !user ? (
        <>
          <p className={text}>{t("join.needLogin")}</p>
          <div className="mt-6 flex gap-3">
            <Link href="/login" className={primary}>
              {t("join.login")}
            </Link>
            <Link href="/signup" className={secondary}>
              {t("join.signup")}
            </Link>
          </div>
        </>
      ) : state === "loading" ? (
        <p className={text}>{t("common.loading")}</p>
      ) : state === "invalid" ? (
        <>
          <p className={text}>{t("join.invalid")}</p>
          <p className="mt-6 text-center text-sm">
            <Link href="/dashboard" className={authLink}>{t("nav.dashboard")}</Link>
          </p>
        </>
      ) : (
        <>
          <p className={text}>
            {t("join.invitedTo")} <strong className="text-white">{info?.organization_name}</strong>{" "}
            {t("join.asRole")} {roleLabel[info?.role ?? "member"]}.
          </p>
          {error && <p role="alert" className={`${authError} mt-4`}>{error}</p>}
          <button onClick={accept} disabled={busy} className={`${authButton} mt-6`}>
            {busy ? t("join.joining") : t("join.accept")}
          </button>
        </>
      )}
    </AuthShell>
  );
}
