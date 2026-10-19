import { useId } from "react";

/**
 * The Octom octopus in the brand gradient (violet to blue).
 * Decorative: the surrounding text carries the meaning.
 */
export default function Mascot({ className = "", wave = false }: { className?: string; wave?: boolean }) {
  const gid = useId().replace(/:/g, "");
  const arm = <path d="M138 120 C166 126 182 106 178 82 C176 66 187 58 195 66" />;
  return (
    <svg className={className} viewBox="-14 -14 219 204" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="44" y1="26" x2="150" y2="190">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <g transform="translate(-15,-24)">
        <g fill="none" stroke={`url(#${gid})`} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
          <path d="M64 122 C48 134 34 138 32 154 C31 166 44 171 51 163" />
          <path d="M84 128 C80 148 64 156 66 172 C67 184 82 188 88 179" />
          <path d="M116 128 C120 148 136 156 134 172 C133 184 118 188 112 179" />
          {wave ? <g className="wave">{arm}</g> : arm}
        </g>
        <path d="M44 92 C44 48 72 26 100 26 C128 26 156 48 156 92 C156 114 142 128 128 132 L72 132 C58 128 44 114 44 92 Z" fill={`url(#${gid})`} />
        <path d="M68 58 C76 47 90 41 103 41" fill="none" stroke="#A5B4FC" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="84" cy="90" rx="9.5" ry="10.5" fill="#0B1026" />
        <ellipse cx="116" cy="90" rx="9.5" ry="10.5" fill="#0B1026" />
        <circle cx="87.5" cy="86.5" r="3.4" fill="#fff" />
        <circle cx="119.5" cy="86.5" r="3.4" fill="#fff" />
        <ellipse cx="68" cy="108" rx="7" ry="4.5" fill="#A5B4FC" opacity=".7" />
        <ellipse cx="132" cy="108" rx="7" ry="4.5" fill="#A5B4FC" opacity=".7" />
        <path d="M93 108 Q100 115 107 108" fill="none" stroke="#0B1026" strokeWidth="3.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}
