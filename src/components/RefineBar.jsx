const REFINE_ACTIONS = [
  { value: 'shorter', label: 'Короче' },
  { value: 'longer', label: 'Длиннее' },
  { value: 'formal', label: 'Официальнее' },
  { value: 'simpler', label: 'Проще' },
];

const NO_REFINE_MODES = ['bio', 'slogan', 'headline'];

const PILL =
  'rounded-full border border-white/70 bg-slate-200/65 px-4 h-[30px] text-xs font-medium text-slate-600 transition-[transform,opacity,background-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-white/80 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

const SHARE_PILL =
  'ml-auto flex items-center gap-1.5 rounded-full bg-[#7A2432] px-4 h-[30px] text-xs font-medium text-white shadow-sm transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-[#5c1c28] active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

export function RefineBar({ mode, hasText, busy, refining, canUndo, onRefine, onRegenerate, onUndo, onShare }) {
  const canRefine = !NO_REFINE_MODES.includes(mode);
  return (
    <div className="flex flex-wrap items-center gap-2 px-1" role="group" aria-label="Доработать текст">
      {canRefine &&
        REFINE_ACTIONS.map((action) => (
          <button
            key={action.value}
            type="button"
            className={PILL}
            disabled={busy || !hasText}
            onClick={() => onRefine(action.value)}
          >
            {refining === action.value ? 'Переписываю…' : action.label}
          </button>
        ))}
      <button type="button" className={PILL} disabled={busy} onClick={onRegenerate}>
        Ещё вариант
      </button>
      {canUndo && (
        <button
          type="button"
          className={`${PILL} text-[#7A2432]`}
          disabled={busy}
          onClick={onUndo}
        >
          Отменить
        </button>
      )}
      {onShare && hasText && (
        <button type="button" className={SHARE_PILL} disabled={busy} onClick={onShare}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 10V2M5 4.5L8 1.5l3 3M3 8v5.5h10V8" />
          </svg>
          Поделиться
        </button>
      )}
    </div>
  );
}
