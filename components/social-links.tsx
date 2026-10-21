import { ICONS, SOCIAL_LABELS, SOCIAL_LINKS, SOCIAL_ORDER } from "@/lib/social";

// Round social icons. Shows only the links filled in lib/social.ts, and nothing at
// all when none are. "dark" is for the dark landing footer, "light" for white footers.
export default function SocialLinks({
  variant = "light",
  className = "",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const items = SOCIAL_ORDER.filter((k) => /^https:\/\//.test(SOCIAL_LINKS[k]));
  if (items.length === 0) return null;

  const tone =
    variant === "dark"
      ? "bg-white/10 text-slate-200 ring-1 ring-white/15 hover:bg-gradient-to-br hover:from-[#6366F1] hover:to-[#3B82F6] hover:text-white hover:ring-transparent"
      : "bg-brand-soft text-brand ring-1 ring-line hover:bg-gradient-to-br hover:from-[#6366F1] hover:to-[#3B82F6] hover:text-white hover:ring-transparent";

  return (
    <ul className={`flex flex-wrap items-center gap-3 ${className}`} aria-label="Social media">
      {items.map((k) => (
        <li key={k}>
          <a
            href={SOCIAL_LINKS[k]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={SOCIAL_LABELS[k]}
            title={SOCIAL_LABELS[k]}
            className={`grid h-11 w-11 place-items-center rounded-full shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${tone}`}
          >
            <svg viewBox={ICONS[k].viewBox} className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
              <path d={ICONS[k].d} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
