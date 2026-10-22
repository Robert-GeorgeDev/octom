"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLanguage } from "@/components/language-provider";

// Public pages that exist in Romanian under /ro/...
const LOCALIZED = new Set([
  "/", "/privacy", "/terms", "/cookies", "/refunds", "/accessibility", "/subprocessors",
  "/security", "/company", "/contact", "/docs", "/status",
]);

/** "/privacy" becomes "/ro/privacy" for a Romanian reader. Other links are left alone. */
export function localizeHref(href: string, lang: "en" | "ro"): string {
  if (lang !== "ro") return href;
  const path = href.split(/[?#]/)[0];
  if (!(LOCALIZED.has(path) || path.startsWith("/for/"))) return href;
  const rest = href.slice(path.length);
  return (path === "/" ? "/ro" : `/ro${path}`) + rest;
}

/** Drop-in replacement for next/link on public pages: keeps the reader's language in the address. */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { lang } = useLanguage();
  return <NextLink href={typeof href === "string" ? localizeHref(href, lang) : href} {...props} />;
}
