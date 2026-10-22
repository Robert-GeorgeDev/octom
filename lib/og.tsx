import { ImageResponse } from "next/og";
import type { Lang } from "@/lib/seo";

export const OG_SIZE = { width: 1200, height: 630 };

// The octopus mascot as an inline picture, so the preview needs no file or font download.
const MASCOT = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjEwIDEyIDIwMCAxOTAiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI0NCIgeTE9IjI2IiB4Mj0iMTUwIiB5Mj0iMTkwIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM4MThDRjgiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMzQjgyRjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDApIHNjYWxlKDEpIj48ZyBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZykiIHN0cm9rZS13aWR0aD0iMTgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTY0IDEyMiBDNDggMTM0IDM0IDEzOCAzMiAxNTQgQzMxIDE2NiA0NCAxNzEgNTEgMTYzIi8+PHBhdGggZD0iTTg0IDEyOCBDODAgMTQ4IDY0IDE1NiA2NiAxNzIgQzY3IDE4NCA4MiAxODggODggMTc5Ii8+PHBhdGggZD0iTTExNiAxMjggQzEyMCAxNDggMTM2IDE1NiAxMzQgMTcyIEMxMzMgMTg0IDExOCAxODggMTEyIDE3OSIvPjxwYXRoIGQ9Ik0xMzggMTIwIEMxNjYgMTI2IDE4MiAxMDYgMTc4IDgyIEMxNzYgNjYgMTg3IDU4IDE5NSA2NiIvPjwvZz48cGF0aCBkPSJNNDQgOTIgQzQ0IDQ4IDcyIDI2IDEwMCAyNiBDMTI4IDI2IDE1NiA0OCAxNTYgOTIgQzE1NiAxMTQgMTQyIDEyOCAxMjggMTMyIEw3MiAxMzIgQzU4IDEyOCA0NCAxMTQgNDQgOTIgWiIgZmlsbD0idXJsKCNnKSIvPjxlbGxpcHNlIGN4PSI4NCIgY3k9IjkwIiByeD0iMTAiIHJ5PSIxMSIgZmlsbD0iIzBCMTAyNiIvPjxlbGxpcHNlIGN4PSIxMTYiIGN5PSI5MCIgcng9IjEwIiByeT0iMTEiIGZpbGw9IiMwQjEwMjYiLz48Y2lyY2xlIGN4PSI4Ny41IiBjeT0iODYuNSIgcj0iMy42IiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iMTE5LjUiIGN5PSI4Ni41IiByPSIzLjYiIGZpbGw9IiNmZmYiLz48L2c+Cjwvc3ZnPg==";

const COPY: Record<Lang, { title: string; sub: string }> = {
  en: { title: "Know who to contact today.", sub: "The simple follow-up CRM. Free during beta." },
  ro: { title: "Știi cui să scrii azi.", sub: "CRM-ul simplu de follow-up. Gratuit în beta." },
};

/** The 1200x630 preview image shown when a link is shared. */
export function renderOg(lang: Lang) {
  const c = COPY[lang];
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "0 90px",
          color: "#ffffff",
          background: "linear-gradient(135deg, #0B1026 0%, #151C3B 60%, #1E2A6B 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#A5B4FC", letterSpacing: 1 }}>
            OCTOM One
          </div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.05, marginTop: 20 }}>
            {c.title}
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#CBD5E1", marginTop: 28 }}>{c.sub}</div>
          <div style={{ display: "flex", marginTop: 40 }}>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 700,
                padding: "14px 30px",
                borderRadius: 16,
                background: "linear-gradient(90deg, #6366F1, #3B82F6)",
              }}
            >
              octom.eu
            </div>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MASCOT} width={380} height={361} alt="" />
      </div>
    ),
    OG_SIZE
  );
}
