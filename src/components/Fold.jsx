export function Fold({ open, className = '', children }) {
  return (
    <div className={`fold ${className}`} data-open={open ? '' : undefined} inert={!open}>
      <div className="fold-inner">{children}</div>
    </div>
  );
}

export function Chevron({ open, className = 'about-chev' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      data-open={open ? '' : undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
}
