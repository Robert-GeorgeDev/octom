"use client";

import { useEffect } from "react";
import { APP_HOST } from "@/lib/hosts";

/**
 * Registers the small service worker (public/sw.js) in the app only: it gives an offline page and
 * faster repeat visits. Skipped in development, on the public site and on preview deployments.
 */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    if (window.location.hostname !== APP_HOST) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* the app works the same without it */
    });
  }, []);
  return null;
}
