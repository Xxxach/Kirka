export function Logo({ className = 'h-9' }) {
  return (
    <svg
      viewBox="0 0 100 44"
      className={className}
      role="img"
      aria-label="Kirka"
    >
      <text
        x="1"
        y="34"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="600"
        fontSize="34"
        letterSpacing="0"
        fill="#7A2432"
      >
        Kirka
      </text>
      <rect x="2" y="40" width="38" height="2" fill="#7A2432" />
    </svg>
  );
}

export function BetkaMetka() {
  return (
    <span className="rounded-full border border-[#7A2432]/25 bg-[#7A2432]/10 px-2 py-0.5 text-[10px] font-medium text-[#7A2432] leading-none select-none">
      Бета
    </span>
  );
}
