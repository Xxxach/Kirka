import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

// Статичное меню в стиле «Что генерируем»: колонки с заголовками и «водичка» (.mode-drop),
// которая перетекает к выбранному пункту. Каждая грань капли идёт на своей пружине:
// передняя быстро, задняя с запаздыванием, из-за этого капля вытягивается и сжимается.
const DROP_LEAD = { k: 520, c: 34 };
const DROP_LAG = { k: 190, c: 22 };
// Пока каплю тащат, пружины жёстче: она идёт за курсором, но с лёгким запаздыванием грани
const DROP_DRAG_LEAD = { k: 720, c: 42 };
const DROP_DRAG_LAG = { k: 360, c: 30 };
// Насколько капля «притягивается» к пункту вместо того, чтобы целиком следовать за курсором
const MAGNET = 0.55;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function LiquidMenu({ groups, value, onChange, label }) {
  const listRef = useRef(null);
  const dropRef = useRef(null);
  const chipRefs = useRef({});
  const mountedRef = useRef(false);
  const pressRef = useRef(null);
  // Пункт, на который сейчас указывает капля (пока зажата мышка), иначе выбранный
  const [pending, setPending] = useState(null);
  const target = pending ?? value;
  const state = useRef({
    dragging: false,
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
      const lead = d.dragging ? DROP_DRAG_LEAD : DROP_LEAD;
      const lag = d.dragging ? DROP_DRAG_LAG : DROP_LAG;
      const edges = [
        ['L', 'vL', 'tL', dirX < 0],
        ['R', 'vR', 'tR', dirX > 0],
        ['T', 'vT', 'tT', dirY < 0],
        ['B', 'vB', 'tB', dirY > 0],
      ];
      let settled = true;
      edges.forEach(([pos, vel, tgt, leading]) => {
        const { k, c } = leading ? lead : lag;
        const steps = 3;
        const h = dt / steps;
        for (let i = 0; i < steps; i += 1) {
          d[vel] += (-k * (d[pos] - d[tgt]) - c * d[vel]) * h;
          d[pos] += d[vel] * h;
        }
        if (Math.abs(d[pos] - d[tgt]) > 0.25 || Math.abs(d[vel]) > 2) settled = false;
      });
      if (settled && !d.dragging) {
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

  const setLift = (on) => {
    dropRef.current?.classList.toggle('is-lifted', on);
  };

  const settle = () => {
    const drop = dropRef.current;
    drop?.classList.add('is-settling');
    setTimeout(() => drop?.classList.remove('is-settling'), 650);
  };

  const nearestChip = (px, py) => {
    let best = null;
    let bestDistance = Infinity;
    Object.entries(chipRefs.current).forEach(([key, el]) => {
      if (!el) return;
      const left = el.offsetLeft;
      const top = el.offsetTop;
      const dx = Math.max(left - px, 0, px - (left + el.offsetWidth));
      const dy = Math.max(top - py, 0, py - (top + el.offsetHeight));
      const cx = px - (left + el.offsetWidth / 2);
      const cy = py - (top + el.offsetHeight / 2);
      const distance = dx * dx + dy * dy + (cx * cx + cy * cy) * 0.001;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = key;
      }
    });
    return best;
  };

  const commit = (next) => {
    setPending(null);
    const rect = chipRect(next);
    if (rect) placeDrop(rect, false);
    settle();
    if (next !== value) onChange(next);
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const chip = event.target.closest('[data-cat]');
    if (!chip) return;
    pressRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      value: chip.dataset.cat,
      dragging: false,
    };
    setPending(chip.dataset.cat);
    setLift(true);
    const rect = chipRect(chip.dataset.cat);
    if (rect) placeDrop(rect, false);
  };

  const handlePointerMove = (event) => {
    const press = pressRef.current;
    const list = listRef.current;
    if (!press || !list || press.id !== event.pointerId) return;
    if (!press.dragging) {
      if (Math.hypot(event.clientX - press.startX, event.clientY - press.startY) < 6) return;
      press.dragging = true;
      state.current.dragging = true;
      try {
        list.setPointerCapture?.(event.pointerId);
      } catch {
        // захват указателя не критичен
      }
    }
    const bounds = list.getBoundingClientRect();
    const px = event.clientX - bounds.left;
    const py = event.clientY - bounds.top;
    const nearest = nearestChip(px, py);
    const rect = chipRect(nearest);
    if (!rect) return;
    if (nearest !== press.value) {
      press.value = nearest;
      setPending(nearest);
    }
    const w = rect.R - rect.L;
    const h = rect.B - rect.T;
    const cx = (rect.L + rect.R) / 2;
    const cy = (rect.T + rect.B) / 2;
    const mx = cx + (px - cx) * MAGNET;
    const my = cy + (py - cy) * MAGNET;
    const left = clamp(mx - w / 2, 0, Math.max(0, bounds.width - w));
    const top = clamp(my - h / 2, 0, Math.max(0, bounds.height - h));
    placeDrop({ L: left, T: top, R: left + w, B: top + h }, false);
  };

  const handlePointerUp = (event) => {
    const press = pressRef.current;
    if (!press || press.id !== event.pointerId) return;
    pressRef.current = null;
    state.current.dragging = false;
    try {
      listRef.current?.releasePointerCapture?.(event.pointerId);
    } catch {
      // не критично
    }
    setLift(false);
    commit(press.value);
  };

  const handlePointerCancel = (event) => {
    const press = pressRef.current;
    if (!press || press.id !== event.pointerId) return;
    pressRef.current = null;
    state.current.dragging = false;
    setLift(false);
    setPending(null);
    const rect = chipRect(value);
    if (rect) placeDrop(rect, false);
  };

  // Клавиатура: Enter/Пробел дают click без указателя (detail === 0)
  const handleChipClick = (event, next) => {
    if (event.detail !== 0) return;
    commit(next);
  };

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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
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
              data-cat={option.value}
              ref={(el) => {
                chipRefs.current[option.value] = el;
              }}
              onClick={(event) => handleChipClick(event, option.value)}
              className={`mode-chip relative z-10 max-w-full rounded-2xl px-3.5 py-1.5 text-left text-[15px] font-medium leading-snug transition-colors duration-300 ${
                option.value === target
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
