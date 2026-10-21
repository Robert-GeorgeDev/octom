"use client";

import ErrorScreen from "@/components/error-screen";

// Replaces the whole page when the root layout itself fails, so it needs its own html and body.
export default function GlobalError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#F8FAFC" }}>
        <ErrorScreen {...props} />
      </body>
    </html>
  );
}
