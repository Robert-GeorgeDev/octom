import Mark from "@/components/mark";

/**
 * Octom wordmark: rounded letters (Nunito), solid colours, no gradients.
 * "octom" in ink, "One" in brand violet. The accessible name is "OCTOM One".
 */
export function Logo({
  className = "",
  light = false,
  mark = true,
}: {
  className?: string;
  light?: boolean;
  mark?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-2xl font-black leading-none select-none ${className}`}
      style={{ fontFamily: "var(--font-nunito), var(--font-inter), system-ui, sans-serif" }}
      aria-label="OCTOM One"
    >
      {mark && <Mark className="h-8 w-8 shrink-0" />}
      <span aria-hidden="true" className="inline-flex items-baseline gap-[0.3em]">
        <span className={light ? "text-white" : "text-ink"}>octom</span>
        <span className={light ? "text-indigo-300" : "text-brand"}>One</span>
      </span>
    </span>
  );
}
export default Logo;
