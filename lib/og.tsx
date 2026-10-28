import { ImageResponse } from "next/og";
import type { Lang } from "@/lib/seo";

export const OG_SIZE = { width: 1200, height: 630 };

// The Octom mark as an inline picture, so the preview needs no file or font download.
const MARK = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSI0MyIgeT0iNiIgd2lkdGg9IjE0IiBoZWlnaHQ9IjMyIiByeD0iNyIgZmlsbD0iIzgxOENGOCIgdHJhbnNmb3JtPSJyb3RhdGUoMCA1MCA1MCkiLz48cmVjdCB4PSI0MyIgeT0iNiIgd2lkdGg9IjE0IiBoZWlnaHQ9IjMyIiByeD0iNyIgZmlsbD0iIzYwQTVGQSIgdHJhbnNmb3JtPSJyb3RhdGUoNDUgNTAgNTApIi8+PHJlY3QgeD0iNDMiIHk9IjYiIHdpZHRoPSIxNCIgaGVpZ2h0PSIzMiIgcng9IjciIGZpbGw9IiM4MThDRjgiIHRyYW5zZm9ybT0icm90YXRlKDkwIDUwIDUwKSIvPjxyZWN0IHg9IjQzIiB5PSI2IiB3aWR0aD0iMTQiIGhlaWdodD0iMzIiIHJ4PSI3IiBmaWxsPSIjNjBBNUZBIiB0cmFuc2Zvcm09InJvdGF0ZSgxMzUgNTAgNTApIi8+PHJlY3QgeD0iNDMiIHk9IjYiIHdpZHRoPSIxNCIgaGVpZ2h0PSIzMiIgcng9IjciIGZpbGw9IiM4MThDRjgiIHRyYW5zZm9ybT0icm90YXRlKDE4MCA1MCA1MCkiLz48cmVjdCB4PSI0MyIgeT0iNiIgd2lkdGg9IjE0IiBoZWlnaHQ9IjMyIiByeD0iNyIgZmlsbD0iIzYwQTVGQSIgdHJhbnNmb3JtPSJyb3RhdGUoMjI1IDUwIDUwKSIvPjxyZWN0IHg9IjQzIiB5PSI2IiB3aWR0aD0iMTQiIGhlaWdodD0iMzIiIHJ4PSI3IiBmaWxsPSIjODE4Q0Y4IiB0cmFuc2Zvcm09InJvdGF0ZSgyNzAgNTAgNTApIi8+PHJlY3QgeD0iNDMiIHk9IjYiIHdpZHRoPSIxNCIgaGVpZ2h0PSIzMiIgcng9IjciIGZpbGw9IiM2MEE1RkEiIHRyYW5zZm9ybT0icm90YXRlKDMxNSA1MCA1MCkiLz48L3N2Zz4=";

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
        <img src={MARK} width={340} height={340} alt="" />
      </div>
    ),
    OG_SIZE
  );
}
