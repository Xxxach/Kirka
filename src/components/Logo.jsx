import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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

// Логотип с «жидким стеклом»: плашка раскрывается кругом из угла логотипа,
// как меню в iOS. Десктоп — по наведению, телефон — по тапу.
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'; // кривая iOS
const DURATION = 450;

export function LogoInfo({ children, className = 'items-start' }) {
  const ref = useRef(null);
  const timer = useRef(null);
  const [pos, setPos] = useState(null);
  const [visible, setVisible] = useState(false);

  const show = useCallback(() => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    clearTimeout(timer.current);
    const width = Math.min(320, window.innerWidth - 24);
    const left = Math.max(
      12,
      Math.min(rect.left, window.innerWidth - width - 12),
    );
    const ox = Math.max(
      0,
      Math.min(rect.left + Math.min(rect.width, 80) / 2 - left, width),
    );
    setPos({ top: rect.bottom + 12, left, width, ox });
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPos(null), DURATION);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!visible) return undefined;
    const onOutside = (e) => {
      if (!ref.current?.contains(e.target)) hide();
    };
    document.addEventListener('pointerdown', onOutside);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      document.removeEventListener('pointerdown', onOutside);
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, [visible, hide]);

  return (
    <div
      ref={ref}
      tabIndex={0}
      className={`flex cursor-help gap-2 outline-none ${className}`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && show()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && hide()}
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse') visible ? hide() : show();
      }}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {pos &&
        createPortal(
          <div
            role="tooltip"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              transformOrigin: `${pos.ox}px 0px`,
              clipPath: `circle(${visible ? '170%' : '0%'} at ${pos.ox}px 0px)`,
              opacity: visible ? 1 : 0,
              transform: visible ? 'scale(1)' : 'scale(0.9)',
              transition: `clip-path ${DURATION}ms ${EASE}, opacity ${DURATION * 0.7}ms ${EASE}, transform ${DURATION}ms ${EASE}`,
            }}
            className="pointer-events-none fixed z-[200] rounded-3xl border border-white/60 bg-white/45 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_40px_-8px_rgba(0,0,0,0.25)] backdrop-blur-xl backdrop-saturate-150"
          >
            <p className="mb-1 text-sm font-semibold text-[#7A2432]">
              Kirka (Кирка)
            </p>
            <p className="mb-2 text-xs leading-relaxed text-slate-600">
              Бесплатный сервис для повседневных задач. Идёт бета-тест.
            </p>
            <ul className="space-y-1.5 text-xs leading-relaxed text-slate-600">
              <li>
                <b className="text-slate-800">Текст-моменты</b> — ИИ пишет
                резюме, сопроводительные письма, поздравления, объявления, посты
                для соцсетей и слоганы.
              </li>
              <li>
                <b className="text-slate-800">Код-моменты</b> — ИИ переводит код
                с одного языка программирования на другой.
              </li>
              <li>
                <b className="text-slate-800">Фото-моменты</b> — сжимает
                фотографии и увеличивает их разрешение (удаление фона откроется
                позже).
              </li>
              <li>
                <b className="text-slate-800">Файл-моменты</b> — конвертирует
                PDF в Word и обратно, а также форматы изображений.
              </li>
            </ul>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              Фото и файлы Kirka не рисует и не генерирует, а только
              обрабатывает то, что вы загрузили.
            </p>
          </div>,
          document.body,
        )}
    </div>
  );
}
