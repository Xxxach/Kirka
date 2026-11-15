import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

// Статичное меню в стиле «Что генерируем»: колонки с заголовками и «водичка» (.mode-drop),
// которая перетекает к выбранному пункту. Каждая грань капли идёт на своей пружине:
// передняя быстро, задняя с запаздыванием, из-за этого капля вытягивается и сжимается.
const DROP_LEAD = { k: 520, c: 34 };
const DROP_LAG = { k: 190, c: 22 };

export function LiquidMenu({ groups, value, onChange, label }) {
  const listRef = useRef(null);
  const dropRef = useRef(null);
  const chipRefs = useRef({});
  const mountedRef = useRef(false);
  const state = useRef({
    L: 0, T: 0, R: 0, B: 0,
    vL: 0, vT: 0, vR: 0, vB: 0,
    tL: 0, tT: 0, tR: 0, tB: 0,
    raf: 0,
  });

  const chipRect = useCallback((key) => {
    const el = chipRefs.current[key];
    if (!el) return null;
    return {
      L: el.offsetLeft,
      T: el.offsetTop,
      R: el.offsetLeft + el.offsetWidth,
      B: el.offsetTop + el.offsetHeight,
    };
  }, []);

  const writeDrop = useCallback(() => {
    const el = dropRef.current;
    const d = state.current;
    if (!el) return;
    el.style.translate = `${d.L}px ${d.T}px`;
    el.style.width = `${Math.max(0, d.R - d.L)}px`;
    el.style.height = `${Math.max(0, d.B - d.T)}px`;
  }, []);

  const runDrop = useCallback(() => {
    const d = state.current;
    if (d.raf) return;
    let last = 0;
    const frame = (now) => {
      const dt = last ? Math.min(0.032, (now - last) / 1000) : 1 / 60;
      last = now;
      const dirX = Math.sign((d.tL + d.tR) / 2 - (d.L + d.R) / 2);
      const dirY = Math.sign((d.tT + d.tB) / 2 - (d.T + d.B) / 2);
      const edges = [
        ['L', 'vL', 'tL', dirX < 0],
        ['R', 'vR', 'tR', dirX > 0],
        ['T', 'vT', 'tT', dirY < 0],
        ['B', 'vB', 'tB', dirY > 0],
      ];
      let settled = true;
      edges.forEach(([pos, vel, tgt, leading]) => {
        const { k, c } = leading ? DROP_LEAD : DROP_LAG;
        const steps = 3;
        const h = dt / steps;
        for (let i = 0; i < steps; i += 1) {
          d[vel] += (-k * (d[pos] - d[tgt]) - c * d[vel]) * h;
          d[pos] += d[vel] * h;
        }
        if (Math.abs(d[pos] - d[tgt]) > 0.25 || Math.abs(d[vel]) > 2) settled = false;
      });
      if (settled) {
        d.L = d.tL; d.T = d.tT; d.R = d.tR; d.B = d.tB;
        d.vL = 0; d.vT = 0; d.vR = 0; d.vB = 0;
        writeDrop();
        d.raf = 0;
        return;
      }
      writeDrop();
      d.raf = requestAnimationFrame(frame);
    };
    d.raf = requestAnimationFrame(frame);
  }, [writeDrop]);

  const placeDrop = useCallback(
    (rect, instant) => {
      const d = state.current;
      d.tL = rect.L; d.tT = rect.T; d.tR = rect.R; d.tB = rect.B;
      if (instant) {
        cancelAnimationFrame(d.raf);
        d.raf = 0;
        d.L = rect.L; d.T = rect.T; d.R = rect.R; d.B = rect.B;
        d.vL = 0; d.vT = 0; d.vR = 0; d.vB = 0;
        writeDrop();
        return;
      }
      runDrop();
    },
    [runDrop, writeDrop],
  );

  // Смена выбранного пункта: первый раз ставим каплю мгновенно, потом она перетекает
  useLayoutEffect(() => {
    const rect = chipRect(value);
    if (!rect) return undefined;
    const first = !mountedRef.current;
    mountedRef.current = true;
    placeDrop(rect, first);
    if (first) return undefined;
    const drop = dropRef.current;
    drop?.classList.add('is-settling');
    const id = setTimeout(() => drop?.classList.remove('is-settling'), 650);
    return () => clearTimeout(id);
  }, [value, chipRect, placeDrop]);

  // Изменился размер меню (ресайз окна, подгрузился шрифт): ставим каплю заново
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      const rect = chipRect(value);
      if (rect) placeDrop(rect, true);
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, [value, chipRect, placeDrop]);

  useEffect(() => {
    const d = state.current;
    return () => cancelAnimationFrame(d.raf);
  }, []);

  return (
    <div
      ref={listRef}
      role="group"
      aria-label={label}
      className="mode-list relative grid grid-cols-4 gap-x-5 select-none"
    >
      <span ref={dropRef} aria-hidden="true" className="mode-drop" />
      {groups.map((group, index) => (
        <div
          key={group.label}
          className={`flex min-w-0 flex-col items-start gap-0.5${
            index > 0 ? ' border-l border-slate-300/50 pl-5' : ''
          }`}
        >
          <p className="mb-1.5 w-full border-b border-slate-300/50 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#7A2432]/70">
            {group.label}
          </p>
          {group.options.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={option.value === value}
              ref={(el) => {
                chipRefs.current[option.value] = el;
              }}
              onClick={() => onChange(option.value)}
              className={`mode-chip relative z-10 max-w-full rounded-2xl px-3.5 py-1.5 text-left text-[15px] font-medium leading-snug transition-colors duration-300 ${
                option.value === value
                  ? 'text-[#7A2432]'
                  : 'text-slate-600 hover:bg-white/45 hover:text-slate-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
