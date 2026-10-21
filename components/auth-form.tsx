"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";
import AuthShell, {
  AuthBackdrop,
  AuthTop,
  AuthTitle,
  GlassCard,
  authButton,
  authError,
  authInfo,
  authInputDark,
  authLabel,
  authLink,
} from "@/components/auth-shell";
import { useLanguage } from "@/components/language-provider";
import type { Key } from "@/lib/dictionaries";

function errorKey(code: string | undefined): Key {
  switch (code) {
    case "user_already_exists":
      return "auth.err.exists";
    case "validation_failed":
    case "email_address_invalid":
      return "auth.err.email";
    case "weak_password":
      return "auth.err.weak";
    case "invalid_credentials":
      return "auth.err.credentials";
    case "email_not_confirmed":
      return "auth.err.notConfirmed";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "auth.err.rate";
    default:
      return "common.error";
  }
}

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      const result = isSignup
        ? await supabase.auth.signUp({ email, password, options: {
              data: {
                lang,
                marketing_consent: marketing,
                ...(marketing ? { marketing_consent_at: new Date().toISOString() } : {}),
              },
            } })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setError(t(errorKey(result.error.code)));
        setBusy(false);
        return;
      }

      if (isSignup && !result.data.session) {
        setInfo(t("auth.checkEmail"));
        setBusy(false);
        return;
      }

      router.replace("/dashboard");
    } catch {
      setError(t("common.error"));
      setBusy(false);
    }
  }

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className={authLabel}>{t("auth.email")}</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInputDark}
        />
      </div>
      <div>
        <label htmlFor="password" className={authLabel}>{t("auth.password")}</label>
        <div className="relative">
          <input
            id="password"
            type={show ? "text" : "password"}
            required
            minLength={8}
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${authInputDark} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? t("auth.hide") : t("auth.show")}
            aria-pressed={show}
            className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
          >
            {show ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        {isSignup && <p className="mt-1.5 text-xs text-slate-400">{t("auth.min8")}</p>}
        {!isSignup && (
          <p className="mt-2 text-right text-sm">
            <Link href="/forgot-password" className={authLink}>{t("auth.forgot")}</Link>
          </p>
        )}
      </div>

      {isSignup && (
        <label className="flex items-start gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 accent-indigo-500"
          />
          <span>{t("auth.marketing")}</span>
        </label>
      )}

      {error && <p role="alert" className={authError}>{error}</p>}
      {info && <p role="status" className={authInfo}>{info}</p>}

      <button type="submit" disabled={busy} className={authButton}>
        {busy ? t("auth.wait") : isSignup ? t("auth.createBtn") : t("auth.loginBtn")}
      </button>

      {isSignup && (
        <p className="text-center text-xs text-slate-400">
          {t("legal.agree")}{" "}
          <Link href="/terms" className={authLink}>{t("legal.terms")}</Link>{" "}
          {t("legal.and")}{" "}
          <Link href="/privacy" className={authLink}>{t("legal.privacy")}</Link>.
        </p>
      )}
    </form>
  );

  const switchLink = (
    <p className="mt-6 text-center text-sm text-slate-300">
      {isSignup ? t("auth.haveAccount") : t("auth.newHere")}{" "}
      <Link href={isSignup ? "/login" : "/signup"} className={authLink}>
        {isSignup ? t("auth.loginBtn") : t("auth.createLink")}
      </Link>
    </p>
  );

  if (!isSignup) {
    return (
      <AuthShell>
        <AuthTitle>{t("auth.welcomeBack")}</AuthTitle>
        <p className="mb-8 mt-3 text-center text-sm text-slate-300">{t("auth.loginSub")}</p>
        {form}
        {switchLink}
      </AuthShell>
    );
  }

  const demo: { name: string; co: string; note: Key; tag: Key; tone: string }[] = [
    { name: "Maria Ionescu", co: "Studio Nord", note: "lp.demo.r1", tag: "lp.demo.tagToday", tone: "bg-amber-400/20 text-amber-200" },
    { name: "Andrei Pop", co: "Pop & Co", note: "lp.demo.r2", tag: "lp.demo.tagDue", tone: "bg-amber-400/20 text-amber-200" },
    { name: "Elena Radu", co: "Radu Design", note: "lp.demo.r3", tag: "lp.demo.tagDone", tone: "bg-emerald-400/20 text-emerald-200" },
  ];

  return (
    <AuthBackdrop>
      <AuthTop />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-5 pb-16 pt-8 lg:grid-cols-[1.05fr_1fr] lg:items-stretch lg:pt-10">
        {/* Left: what you get */}
        <section className="hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[.06] to-white/[.015] p-9 backdrop-blur-xl lg:flex lg:flex-col">
          <h2 className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-4xl font-semibold leading-tight tracking-tight text-transparent">
            {t("auth.side.title")}
          </h2>
          <p className="mt-3 max-w-md text-slate-300">{t("auth.side.sub")}</p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-[#0B1026]/70 p-4 shadow-xl" aria-hidden="true">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{t("auth.side.today")}</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <ul className="space-y-2">
              {demo.map((d) => (
                <li key={d.name} className="flex items-center gap-3 rounded-xl bg-white/[.05] px-3 py-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#6366F1] to-[#3B82F6] text-xs font-bold text-white">
                    {d.name.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{d.name} <span className="font-normal text-slate-400">· {d.co}</span></span>
                    <span className="block truncate text-xs text-slate-400">{t(d.note)}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${d.tone}`}>{t(d.tag)}</span>
                </li>
              ))}
            </ul>
          </div>

          <ul className="mt-auto space-y-3 pt-8 text-sm text-slate-200">
            {(["auth.side.b1", "auth.side.b2", "auth.side.b3"] as Key[]).map((k) => (
              <li key={k} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-indigo-400/25 text-[11px] text-indigo-200">✓</span>
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Right: the form */}
        <GlassCard className="mx-auto w-full max-w-[520px] lg:max-w-none">
          <AuthTitle>{t("auth.createTitle")}</AuthTitle>

          <p className="mb-6 mt-3 text-center text-sm text-slate-300">{t("auth.createSub")}</p>

          {form}
          {switchLink}
        </GlassCard>
      </main>
    </AuthBackdrop>
  );
}
