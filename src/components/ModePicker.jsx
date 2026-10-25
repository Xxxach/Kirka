import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { modeByValue, modeGroups } from '../data/textModes';

const PANEL_WIDTH = 960;
const EDGE = 12;
const PANEL_RADIUS = 28;
const START_RADIUS = 16;

const SPRING_OPEN_X = { k: 300, c: 22 };
const SPRING_OPEN_Y = { k: 185, c: 18 };
const SPRING_CLOSE = { k: 420, c: 41 };
const DROP_LEAD = { k: 520, c: 34 };
const DROP_LAG = { k: 190, c: 22 };
const DROP_DRAG_LEAD = { k: 720, c: 42 };
const DROP_DRAG_LAG = { k: 360, c: 30 };
const MAGNET = 0.55;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function stepSpring(state, key, target, { k, c }, dt) {
  const steps = 3;
  const h = dt / steps;
  for (let i = 0; i < steps; i += 1) {
    const accel = -k * (state[key] - target) - c * state[`v${key}`];
    state[`v${key}`] += accel * h;
    state[key] += state[`v${key}`] * h;
  }
}

export function ModePicker({ value, onChange }) {
  const [phase, setPhase] = useState('closed');
  const [geo, setGeo] = useState(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [target, setTarget] = useState(value);
  const buttonRef = useRef(null);
  const innerRef = useRef(null);
  const listRef = useRef(null);
  const dropRef = useRef(null);
  const dropState = useRef({
    L: 0, T: 0, R: 0, B: 0,
    vL: 0, vT: 0, vR: 0, vB: 0,
    tL: 0, tT: 0, tR: 0, tB: 0,
    dragging: false,
    raf: 0,
  });
  const chipRefs = useRef({});
  const pressRef = useRef(null);
  const timersRef = useRef([]);
  const phaseRef = useRef('closed');
  const panelRef = useRef(null);
  const shellRef = useRef(null);
  const shadowRef = useRef(null);
  const geoRef = useRef(null);
  const springRef = useRef({ x: 0, vx: 0, y: 0, vy: 0, raf: 0 });

  const current = modeByValue[value];

  const later = useCallback((fn, ms) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    geoRef.current = geo;
  }, [geo]);

  useEffect(() => {
    const el = panelRef.current;
    const shell = shellRef.current;
    const shadow = shadowRef.current;
    const g = geoRef.current;
    const inner = innerRef.current;
    if (!el || !shell || !shadow || !g || !inner || (phase !== 'open' && phase !== 'closing')) {
      return undefined;
    }

    const opening = phase === 'open';
    const spring = springRef.current;
    const finalHeight = Math.min(inner.offsetHeight || g.height, g.maxHeight);
    const desiredTop = clamp(g.top, EDGE, Math.max(EDGE, window.innerHeight - finalHeight - EDGE));
    const shiftY = desiredTop - g.top;
    const sx0 = g.width / g.endWidth;
    const sy0 = g.height / Math.max(finalHeight, g.height);
    const dx0 = g.left - g.endLeft;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let lastRadius = '';
    const paint = () => {
      const px = clamp(spring.x, 0, 1.25);
      const py = clamp(spring.y, 0, 1.25);
      const sx = Math.max(0.001, sx0 + (1 - sx0) * px);
      const sy = Math.max(0.001, sy0 + (1 - sy0) * py);
      const radius = Math.max(0, START_RADIUS + (PANEL_RADIUS - START_RADIUS) * px);
      el.style.transform = `translate3d(${dx0 * (1 - px)}px, ${shiftY * py}px, 0) scale(${sx}, ${sy})`;
      const rx = Math.round((radius / sx) * 2) / 2;
      const ry = Math.round((radius / sy) * 2) / 2;
      const nextRadius = `${rx}px / ${ry}px`;
      if (nextRadius !== lastRadius) {
        lastRadius = nextRadius;
        shell.style.borderRadius = nextRadius;
      }
      const alpha = String(clamp(px / 0.18, 0, 1));
      shell.style.opacity = alpha;
      shadow.style.opacity = alpha;
    };

    const finish = () => {
      if (opening) {
        el.style.transform = `translate3d(0, ${shiftY}px, 0) scale(1, 1)`;
        shell.style.borderRadius = `${PANEL_RADIUS}px`;
        shell.style.opacity = '1';
        shadow.style.opacity = '1';
      } else {
        shell.style.opacity = '0';
        shadow.style.opacity = '0';
      }
    };

    if (reduce) {
      spring.x = opening ? 1 : 0;
      spring.y = spring.x;
      spring.vx = 0;
      spring.vy = 0;
      finish();
      return undefined;
    }

    cancelAnimationFrame(spring.raf);
    paint();
    let last = 0;
    const frame = (now) => {
      const dt = last ? Math.min(0.032, (now - last) / 1000) : 1 / 60;
      last = now;
      stepSpring(spring, 'x', opening ? 1 : 0, opening ? SPRING_OPEN_X : SPRING_CLOSE, dt);
      stepSpring(spring, 'y', opening ? 1 : 0, opening ? SPRING_OPEN_Y : SPRING_CLOSE, dt);
      const end = opening ? 1 : 0;
      const settled =
        Math.abs(spring.x - end) < 0.0008 &&
        Math.abs(spring.y - end) < 0.0008 &&
        Math.abs(spring.vx) < 0.01 &&
        Math.abs(spring.vy) < 0.01;
      if (settled) {
        spring.x = end;
        spring.y = end;
        spring.vx = 0;
        spring.vy = 0;
        finish();
        return;
      }
      paint();
      spring.raf = requestAnimationFrame(frame);
    };
    spring.raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(spring.raf);
  }, [phase]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

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
    const d = dropState.current;
    if (!el) return;
    el.style.translate = `${d.L}px ${d.T}px`;
    el.style.width = `${Math.max(0, d.R - d.L)}px`;
    el.style.height = `${Math.max(0, d.B - d.T)}px`;
  }, []);

  const runDrop = useCallback(() => {
    const d = dropState.current;
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
        d.L = d.tL;
        d.T = d.tT;
        d.R = d.tR;
        d.B = d.tB;
        d.vL = 0;
        d.vT = 0;
        d.vR = 0;
        d.vB = 0;
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
    const d = dropState.current;
    d.tL = rect.L;
    d.tT = rect.T;
    d.tR = rect.R;
    d.tB = rect.B;
    if (instant) {
      cancelAnimationFrame(d.raf);
      d.raf = 0;
      d.L = rect.L;
      d.T = rect.T;
      d.R = rect.R;
      d.B = rect.B;
      d.vL = 0;
      d.vT = 0;
      d.vR = 0;
      d.vB = 0;
      writeDrop();
      return;
    }
    runDrop();
    },
    [runDrop, writeDrop],
  );

  useEffect(() => {
    const d = dropState.current;
    if (phase === 'closed') {
      cancelAnimationFrame(d.raf);
      d.raf = 0;
      d.dragging = false;
      return;
    }
    if (phase === 'start') {
      const rect = chipRect(value);
      if (rect) placeDrop(rect, true);
    }
  }, [phase, value, chipRect, placeDrop]);

  useEffect(() => {
    const d = dropState.current;
    return () => cancelAnimationFrame(d.raf);
  }, []);

  const openPanel = () => {
    const button = buttonRef.current;
    if (!button || phase !== 'closed') return;
    const rect = button.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(PANEL_WIDTH, vw - EDGE * 2);
    const endLeft = Math.min(Math.max(rect.left, EDGE), vw - width - EDGE);
    setTarget(value);
    setGeo({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      endLeft,
      endWidth: width,
      maxHeight: vh - EDGE * 2,
    });
    setPhase('start');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open'))),
    );
  };

  const closePanel = useCallback(() => {
    if (phaseRef.current !== 'open' && phaseRef.current !== 'start') return;
    phaseRef.current = 'closing';
    setPhase('closing');
    later(() => {
      if (phaseRef.current !== 'closing') return;
      phaseRef.current = 'closed';
      setPhase('closed');
    }, 380);
  }, [later]);

  useEffect(() => {
    if (phase !== 'open') return undefined;
    const startWidth = window.innerWidth;
    const onKey = (event) => {
      if (event.key === 'Escape') closePanel();
    };
    const onResize = () => {
      if (window.innerWidth !== startWidth) closePanel();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [phase, closePanel]);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner || phase === 'closed') return undefined;
    const observer = new ResizeObserver(() => setContentHeight(inner.offsetHeight));
    observer.observe(inner);
    return () => observer.disconnect();
  }, [phase]);

  const setLift = (on) => {
    dropRef.current?.classList.toggle('is-lifted', on);
  };

  const commit = (next) => {
    setTarget(next);
    const rect = chipRect(next);
    if (rect) placeDrop(rect, false);
    const drop = dropRef.current;
    drop?.classList.add('is-settling');
    later(() => drop?.classList.remove('is-settling'), 650);
    later(() => {
      if (next !== value) onChange(next);
      closePanel();
    }, 280);
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

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const chip = event.target.closest('[data-mode]');
    if (!chip) return;
    pressRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      value: chip.dataset.mode,
      dragging: false,
    };
    setTarget(chip.dataset.mode);
    setLift(true);
    const rect = chipRect(chip.dataset.mode);
    if (rect) placeDrop(rect, false);
  };

  const handlePointerMove = (event) => {
    const press = pressRef.current;
    const list = listRef.current;
    if (!press || !list || press.id !== event.pointerId) return;
    if (!press.dragging) {
      if (Math.hypot(event.clientX - press.startX, event.clientY - press.startY) < 6) return;
      press.dragging = true;
      dropState.current.dragging = true;
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
      setTarget(nearest);
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
    dropState.current.dragging = false;
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
    dropState.current.dragging = false;
    setLift(false);
    setTarget(value);
    const rect = chipRect(value);
    if (rect) placeDrop(rect, false);
  };

  const handleChipClick = (event, next) => {
    if (event.detail !== 0) return;
    commit(next);
  };

  const expanded = phase === 'open';
  const finalHeight = geo ? Math.min(contentHeight || geo.height, geo.maxHeight) : 0;
  const panelStyle = geo
    ? { left: geo.endLeft, top: geo.top, width: geo.endWidth, height: finalHeight }
    : undefined;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={phase !== 'closed'}
        onClick={openPanel}
        style={
          phase === 'closed'
            ? undefined
            : { opacity: expanded ? 0 : 1, pointerEvents: 'none' }
        }
        className="w-full h-[38px] px-4 flex items-center justify-between gap-2 rounded-2xl border border-slate-300 bg-white shadow-sm text-left text-sm text-slate-800 transition-opacity duration-150 hover:border-slate-400"
      >
        <span className="truncate">{current?.label}</span>
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 20 20"
          className="shrink-0 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>

      {phase !== 'closed' &&
        geo &&
        createPortal(
          <>
            <div
              className={`fb-dim${expanded ? ' is-open' : ''}`}
              onClick={closePanel}
              aria-hidden="true"
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Что генерируем"
              className={`fb-panel${expanded ? ' is-open' : ''}${phase === 'closing' ? ' is-closing' : ''}`}
              style={panelStyle}
            >
              <div ref={shellRef} className="fb-shell">
                <div
                  ref={innerRef}
                  className="fb-inner flex flex-col gap-3 p-4"
                  style={{
                    width: geo.endWidth,
                    maxHeight: geo.maxHeight,
                    boxSizing: 'border-box',
                    overscrollBehavior: 'contain',
                  }}
                >
                  <div className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Что генерируем
                  </div>
                  <div
                    ref={listRef}
                    role="listbox"
                    className="mode-list relative grid grid-cols-2 md:grid-cols-[repeat(4,auto)] gap-x-5 gap-y-6 select-none"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                  >
                    <span ref={dropRef} aria-hidden="true" className="mode-drop" />
                    {modeGroups.map((group, index) => (
                      <div
                        key={group.label}
                        className={`flex flex-col items-start gap-0.5${
                          index > 0 ? ' md:border-l md:border-slate-300/50 md:pl-5' : ''
                        }`}
                      >
                        <p className="mb-1.5 w-full border-b border-slate-300/50 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#7A2432]/70">
                          {group.label}
                        </p>
                        {group.options.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={option.value === target}
                            data-mode={option.value}
                            ref={(el) => {
                              chipRefs.current[option.value] = el;
                            }}
                            onClick={(event) => handleChipClick(event, option.value)}
                            className={`mode-chip relative z-10 max-w-full rounded-2xl px-3.5 py-1.5 text-left text-sm font-medium leading-snug transition-colors duration-300 ${
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
                </div>
              </div>
              <div ref={shadowRef} className="fb-shadow" />
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
