import { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AdSlot } from './AdSlot';
import { FeedbackButton } from './FeedbackButton';
import { Logo, BetkaMetka } from './Logo';

const tabs = [
  { to: '/', label: 'Текст-моменты', end: true },
  { to: '/photo-page', label: 'Фото-моменты' },
  { to: '/kod-page', label: 'Код-моменты' },
  { to: '/file-page', label: 'Файл-моменты' },
];

const tabClass = ({ isActive }) =>
  `relative px-4 py-1 pb-1.5 rounded-full text-sm font-medium transition-all duration-300 select-none ${
    isActive
      ? 'bg-white/90 shadow-[0_2px_10px_-2px_rgba(122,36,50,0.35)] text-[#7A2432] active:scale-95'
      : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
  }`;

function MobileNavigation({ open, onClose }) {
  const asideRef = useRef(null);
  const startX = useRef(null);
  const dragXRef = useRef(0);

  const applyTransform = (x) => {
    if (asideRef.current) {
      asideRef.current.style.transform = `translateX(${open ? x : 100}%)`;
    }
  };

  const handlePointerDown = (event) => {
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (startX.current === null) return;
    const delta = event.clientX - startX.current;
    if (delta > 0) {
      dragXRef.current = Math.min(delta, 340);
      applyTransform(dragXRef.current);
    }
  };

  const handlePointerEnd = () => {
    if (dragXRef.current > 90) onClose();
    dragXRef.current = 0;
    applyTransform(0);
    startX.current = null;
  };

  return (
    <>
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-60 bg-slate-900/10 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          open
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        ref={asideRef}
        aria-label="Навигация"
        className={`fixed right-0 top-0 bottom-0 z-70 w-[min(84vw,340px)] p-3 md:hidden transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          transform: `translateX(${open ? 0 : 100}%)`,
          willChange: 'transform',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className="h-full flex flex-col justify-center gap-2 p-3 rounded-4xl bg-white/55 backdrop-blur-2xl border border-white/70 shadow-[0_18px_55px_-12px_rgba(0,0,0,0.3)] touch-pan-y">
          <div className="px-4 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Разделы
          </div>
          {tabs.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/90 text-[#7A2432] shadow-[0_2px_10px_-2px_rgba(122,36,50,0.25)]'
                    : 'text-slate-600 hover:bg-white/55 hover:text-slate-900'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
}

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 flex flex-col gap-1 p-3">
      {/* Десктопная версия — оставлена без изменения. */}
      <div className="hidden md:flex items-center justify-between gap-15 px-5 py-4 bg-white/50 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.25)]">
        <div className="flex items-start gap-2">
          <Logo className="h-9 w-auto" />
          <BetkaMetka />
        </div>
        <AdSlot height="h-15" />
        <div className="flex flex-col w-80 items-center text-center">
          <p className="text-l">Абсолютно бесплатный сайт</p>
          <p className="text-sm text-slate-500">
            (только реклама и лимит 30-300 в день)
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center justify-center gap-1 mx-auto px-1 py-1 bg-slate-200/50 backdrop-blur-xl rounded-full border border-white/60 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.2)]">
          {tabs.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={tabClass}>
              {label}
            </NavLink>
          ))}
        </div>
        <FeedbackButton />
      </div>

      {/* Мобильная версия: информация сверху, реклама снизу, навигация кнопкой. */}
      <div className="md:hidden flex flex-col gap-2 px-3 py-3 bg-white/50 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.22)]">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-start gap-2">
            <Logo className="h-8 w-auto" />
            <BetkaMetka />
          </div>
          <div className="flex min-w-0 flex-col items-end text-right">
            <p className="text-sm leading-tight">Абсолютно бесплатный сайт</p>
            <p className="text-[11px] leading-tight text-slate-500">
              (только реклама и лимит 30-300 в день)
            </p>
          </div>
        </div>

        <AdSlot />
      </div>

      {/* Мобильные разделы — отдельная плавающая «таблетка», как десктопные табы. */}
      <div className="md:hidden relative z-55 flex justify-end gap-2 pointer-events-none">
        <FeedbackButton className="pointer-events-auto" />
        <button
          type="button"
          aria-label="Открыть навигацию"
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((value) => !value)}
          className="pointer-events-auto rounded-full border border-white/70 bg-slate-200/65 px-5 py-1.5 text-xs font-medium text-slate-600 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-200 hover:bg-white/70 active:scale-95 select-none"
        >
          Разделы
        </button>
      </div>

      <MobileNavigation
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </div>
  );
}
