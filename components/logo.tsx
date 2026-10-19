import Mascot from "@/components/mascot";

/**
 * Octom wordmark: rounded letters (Nunito), solid colours, no gradients.
 * "octom" in ink, ".one" in brand violet. The accessible name stays "OCTOM One".
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
      {mark && <Mascot className="h-8 w-8 shrink-0" />}
      <span aria-hidden="true" className="inline-flex items-baseline">
        <span className={light ? "text-white" : "text-ink"}>octom</span>
        <span className={light ? "text-indigo-300" : "text-brand"}>.one</span>
      </span>
    </span>
  );
}
export default Logo;
