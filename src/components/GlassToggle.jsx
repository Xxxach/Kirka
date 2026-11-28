import { setGlass, useGlass } from '../hooks/useGlass';

// Круглая кнопка «без размытия»: высота как у «Описание» и «Обратная связь».
// Нажата: размытие и преломление пропадают на всём сайте, кнопка бордовая (в тёмной теме синяя).
export function GlassToggle({ className = '' }) {
  const glass = useGlass();
  const label = glass ? 'Отключить размытие' : 'Включить размытие';
  return (
    <button
      type="button"
      aria-pressed={!glass}
      aria-label={label}
      title="Режим без размытия и прозрачности"
      onClick={() => setGlass(!glass)}
      className={`hdr-glow glass-btn rounded-full border border-white/70 bg-slate-200/65 text-slate-600 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-200 hover:bg-white/70 active:scale-95 select-none ${className}`}
    >
      <svg
        aria-hidden="true"
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M14.5 9.5V6.5A3 3 0 0 0 11.5 3.5H6.5A3 3 0 0 0 3.5 6.5V11.5A3 3 0 0 0 6.5 14.5H9.5"
          strokeWidth="1.8"
          opacity="0.6"
        />
        <rect x="9.5" y="9.5" width="11" height="11" rx="3" strokeWidth="2.3" />
        <path d="M15 13.6h2.4V16" strokeWidth="1.7" />
        <circle cx="13" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );
}
