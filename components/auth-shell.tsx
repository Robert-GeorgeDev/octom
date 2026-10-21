"use client";

import Link from "next/link";
import Logo from "@/components/logo";
import LanguageSwitcher from "@/components/language-switcher";

// Light inputs: still used by the contact form, which sits on a white page.
export const authInput =
  "mt-1 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

// Dark inputs, for the sign-in screens below.
export const authInputDark =
  "mt-1.5 w-full rounded-xl border border-white/15 bg-white/[.06] px-4 py-3 text-white placeholder:text-slate-400 outline-none transition focus:border-indigo-300 focus:bg-white/[.09] focus:ring-2 focus:ring-indigo-400/40";
export const authLabel = "block text-sm font-medium text-slate-200";
export const authButton =
  "w-full rounded-xl bg-gradient-to-b from-[#6C6FF5] to-[#3B6FF0] px-6 py-3 font-semibold text-white shadow-[0_8px_30px_-6px_rgba(79,70,229,.7),inset_0_1px_0_rgba(255,255,255,.25)] transition hover:brightness-110 active:translate-y-px disabled:opacity-60";
export const authError = "rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200";
export const authInfo = "rounded-xl border border-indigo-300/30 bg-indigo-400/10 px-4 py-3 text-sm text-indigo-100";
export const authLink = "font-semibold text-indigo-300 hover:text-white hover:underline";

/** Full-screen navy backdrop with a violet-blue light beam from the top. */
export function AuthBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#070B1E] text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(45% 55% at 50% 0%, rgba(99,102,241,.55), transparent 70%), radial-gradient(35% 40% at 50% 100%, rgba(59,130,246,.30), transparent 70%), radial-gradient(30% 50% at 0% 50%, rgba(79,70,229,.18), transparent 70%), radial-gradient(30% 50% at 100% 50%, rgba(79,70,229,.18), transparent 70%)",
        }}
      />
      {/* two soft light beams */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[70vh] w-[26vw] min-w-[160px] -translate-x-[70%] -skew-x-[14deg] bg-gradient-to-b from-indigo-300/25 to-transparent blur-2xl" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[60vh] w-[12vw] min-w-[90px] translate-x-[10%] skew-x-[14deg] bg-gradient-to-b from-sky-300/20 to-transparent blur-2xl" />
      {children}
    </div>
  );
}

/** Top row: logo left, language right (styled for the dark background). */
export function AuthTop() {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6">
      <Link href="/" aria-label="Home">
        <Logo light />
      </Link>
      <LanguageSwitcher dark />
    </div>
  );
}

/** The frosted glass card. */
export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[.08] to-white/[.02] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,.7)] backdrop-blur-xl sm:p-9 ${className}`}
    >
      {children}
    </div>
  );
}

/** Centered card layout: login, forgot password, reset password. */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthBackdrop>
      <AuthTop />
      <main className="mx-auto w-full max-w-[460px] px-5 pb-16 pt-10 sm:pt-16">
        <GlassCard>{children}</GlassCard>
      </main>
    </AuthBackdrop>
  );
}

/** Heading in the soft white-to-grey gradient used on the dark screens. */
export function AuthTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-center text-3xl font-semibold tracking-tight text-transparent sm:text-[34px]">
      {children}
    </h1>
  );
}
