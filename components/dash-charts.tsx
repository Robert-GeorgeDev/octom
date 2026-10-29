import { barHeights, donutSegments, niceMax } from "@/lib/dash-charts";

/** Colours for the contact stages, shared by the donut and its legend. */
export const STAGE_COLOR: Record<string, string> = {
  New: "#94A3B8",
  Contacted: "#818CF8",
  Qualified: "#38BDF8",
  "Proposal Sent": "#FBBF24",
  Negotiation: "#FB923C",
  Won: "#34D399",
  Lost: "#F87171",
};

/** A few small bars next to a number. Decorative: the number and its caption carry the meaning. */
export function MiniBars({ values, tone }: { values: number[]; tone: string }) {
  const heights = barHeights(values);
  return (
    <div className="flex h-12 items-end gap-1" aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-2.5 rounded-full ${tone}`}
          style={{ height: `${Math.max(h, 10)}%`, opacity: 0.35 + (0.65 * (i + 1)) / heights.length }}
        />
      ))}
    </div>
  );
}

const W = 640;
const H = 250;
const PAD = { l: 34, r: 8, t: 14, b: 30 };

/** Planned (light) and finished (solid) capsules per week, with a line through the finished tops. */
export function ActivityChart({
  labels, planned, finished, ariaLabel,
}: { labels: string[]; planned: number[]; finished: number[]; ariaLabel: string }) {
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const base = PAD.t + plotH;
  const max = niceMax(Math.max(0, ...planned, ...finished));
  const y = (v: number) => base - (v / max) * plotH;
  const slot = plotW / Math.max(1, labels.length);
  const width = 22;

  const capsule = (cx: number, v: number, fill: string, key: string) => {
    const h = base - y(v);
    if (h <= 0) return null;
    return <rect key={key} x={cx - width / 2} y={y(v)} width={width} height={h} rx={Math.min(width / 2, h / 2)} fill={fill} />;
  };

  const points = finished.map((v, i) => [PAD.l + slot * (i + 0.5), y(v)] as const);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
          <defs>
            <linearGradient id="octom-cap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6366F1" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
          {[0, max / 2, max].map((g) => (
            <g key={g}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(g)} y2={y(g)} stroke="#E8EAF4" strokeDasharray="3 5" />
              <text x={PAD.l - 8} y={y(g) + 4} textAnchor="end" fontSize="11" fill="#94A3B8">{Number.isInteger(g) ? g : g.toFixed(1)}</text>
            </g>
          ))}
          {labels.map((label, i) => {
            const cx = PAD.l + slot * (i + 0.5);
            return (
              <g key={i}>
                {capsule(cx, planned[i] ?? 0, "#E4E8FF", `p${i}`)}
                {capsule(cx, finished[i] ?? 0, "url(#octom-cap)", `f${i}`)}
                <text x={cx} y={H - 8} textAnchor="middle" fontSize="11" fill="#94A3B8">{label}</text>
              </g>
            );
          })}
          {points.length > 1 && (
            <polyline points={points.map(([x, py]) => `${x.toFixed(1)},${py.toFixed(1)}`).join(" ")} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          )}
          {points.map(([x, py], i) => (
            <circle key={i} cx={x} cy={py} r="4.5" fill="#fff" stroke="#3B82F6" strokeWidth="2.5" />
          ))}
        </svg>
      </div>
    </div>
  );
}

/** Donut of contacts per stage. The legend next to it carries the exact numbers. */
export function StageDonut({
  stages, total, totalLabel, ariaLabel,
}: { stages: { key: string; value: number }[]; total: number; totalLabel: string; ariaLabel: string }) {
  const r = 62;
  const circumference = 2 * Math.PI * r;
  const segments = donutSegments(stages.map((s) => s.value), r, 4);
  return (
    <svg viewBox="0 0 200 200" className="h-[190px] w-[190px]" role="img" aria-label={ariaLabel}>
      <g transform="rotate(-90 100 100)">
        <circle cx="100" cy="100" r={r} fill="none" stroke="#EEF0FA" strokeWidth="26" />
        {segments.map((s) => (
          <circle
            key={s.index}
            cx="100" cy="100" r={r} fill="none" strokeWidth="26"
            stroke={STAGE_COLOR[stages[s.index].key] ?? "#94A3B8"}
            strokeDasharray={`${s.length.toFixed(2)} ${(circumference - s.length).toFixed(2)}`}
            strokeDashoffset={(-s.offset).toFixed(2)}
          />
        ))}
      </g>
      <text x="100" y="94" textAnchor="middle" fontSize="12" fontWeight="600" fill="#64748B">{totalLabel}</text>
      <text x="100" y="118" textAnchor="middle" fontSize="26" fontWeight="800" fill="#0B1026">{total}</text>
    </svg>
  );
}

/** A soft glowing sphere in the brand colours, for the assistant card. */
export function AiOrb() {
  return (
    <div className="relative mx-auto mt-2 h-24 w-24" aria-hidden="true">
      <span className="absolute inset-0 rounded-full bg-[#6366F1]/30 blur-2xl" />
      <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_210deg,#4F46E5,#3B82F6,#7DD3FC,#A5B4FC,#4F46E5)] shadow-[inset_-8px_-10px_22px_rgba(11,16,38,.35),inset_8px_10px_20px_rgba(255,255,255,.45)]" />
      <span className="absolute left-5 top-4 h-6 w-9 -rotate-[25deg] rounded-full bg-white/50 blur-md" />
    </div>
  );
}
