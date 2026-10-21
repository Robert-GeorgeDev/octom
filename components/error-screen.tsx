"use client";

import { useEffect } from "react";

// Shared by app/error.tsx and app/global-error.tsx. Uses no providers, so it
// still works when the layout itself has crashed. Language follows the browser.
export default function ErrorScreen({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      void fetch("/api/report-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route: window.location.pathname,
          message: error.message,
          digest: error.digest,
        }),
        keepalive: true,
      });
    } catch {
      /* ignore */
    }
  }, [error]);

  const ro = typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("ro");
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "96px 20px", fontFamily: "Inter, Arial, sans-serif", color: "#0B1026" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>{ro ? "Ceva nu a mers" : "Something went wrong"}</h1>
      <p style={{ marginTop: 12, color: "#475569", lineHeight: 1.5 }}>
        {ro
          ? "Am notat problema și o vom verifica. Datele tale sunt în siguranță. Încearcă din nou."
          : "We have logged the problem and will look into it. Your data is safe. Please try again."}
      </p>
      <button
        type="button"
        onClick={reset}
        style={{ marginTop: 24, padding: "12px 20px", borderRadius: 12, border: 0, color: "#fff", fontWeight: 600, background: "linear-gradient(135deg,#6366F1,#3B82F6)", cursor: "pointer" }}
      >
        {ro ? "Încearcă din nou" : "Try again"}
      </button>
    </main>
  );
}
