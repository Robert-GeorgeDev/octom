/**
 * The Octom mark: eight rounded dashes around a centre ("octo" = eight),
 * alternating violet and blue. Decorative: the surrounding text carries the meaning.
 * `wave` turns it slowly (used on the landing hero); respects reduced motion.
 */
export default function Mark({ className = "", wave = false }: { className?: string; wave?: boolean }) {
  const dashes = Array.from({ length: 8 }, (_, k) => (
    <rect
      key={k}
      x="43"
      y="6"
      width="14"
      height="32"
      rx="7"
      fill={k % 2 === 0 ? "#6366F1" : "#3B82F6"}
      transform={`rotate(${k * 45} 50 50)`}
    />
  ));
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      {wave ? <g className="wave">{dashes}</g> : dashes}
    </svg>
  );
}
