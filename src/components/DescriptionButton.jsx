import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { normalizePath } from '../data/textModes';
import {
  defaultDescription,
  descriptionFooter,
  pageDescriptions,
} from '../data/pageDescriptions';

const PANEL_WIDTH = 360;
const EDGE = 12;
const PANEL_RADIUS = 28;

const SPRING_OPEN_X = { k: 300, c: 22 };
const SPRING_OPEN_Y = { k: 185, c: 18 };
const SPRING_CLOSE = { k: 420, c: 41 };

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

export function DescriptionButton({ className = '' }) {
  const { pathname } = useLocation();
  const description = pageDescriptions[normalizePath(pathname)] ?? defaultDescription;
  const [phase, setPhase] = useState('closed');
  const [geo, setGeo] = useState(null);
  const [contentHeight, setContentHeight] = useState(0);
  const buttonRef = useRef(null);
  const innerRef = useRef(null);
  const timersRef = useRef([]);
  const phaseRef = useRef('closed');
  const panelRef = useRef(null);
  const shellRef = useRef(null);
  const shadowRef = useRef(null);
  const geoRef = useRef(null);
  const springRef = useRef({ x: 0, vx: 0, y: 0, vy: 0, raf: 0 });

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
    const sx0 = g.width / g.endWidth;
    const sy0 = g.height / Math.max(finalHeight, g.height);
    const dx0 = g.left - g.endLeft;
    const r0 = g.height / 2;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let lastRadius = '';
    const paint = () => {
      const px = clamp(spring.x, 0, 1.25);
      const py = clamp(spring.y, 0, 1.25);
      const sx = Math.max(0.001, sx0 + (1 - sx0) * px);
      const sy = Math.max(0.001, sy0 + (1 - sy0) * py);
      const radius = Math.max(0, r0 + (PANEL_RADIUS - r0) * px);
      el.style.transform = `translate3d(${dx0 * (1 - px)}px, 0, 0) scale(${sx}, ${sy})`;
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
        el.style.transform = 'translate3d(0, 0, 0) scale(1, 1)';
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
      const target = opening ? 1 : 0;
      const settled =
        Math.abs(spring.x - target) < 0.0008 &&
        Math.abs(spring.y - target) < 0.0008 &&
        Math.abs(spring.vx) < 0.01 &&
        Math.abs(spring.vy) < 0.01;
      if (settled) {
        spring.x = target;
        spring.y = target;
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

  const openPanel = () => {
    const button = buttonRef.current;
    if (!button || phase !== 'closed') return;
    const rect = button.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(PANEL_WIDTH, vw - EDGE * 2);
    const endLeft = Math.min(Math.max(rect.left, EDGE), vw - width - EDGE);
    setGeo({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      endLeft,
      endWidth: width,
      maxHeight: Math.max(220, vh - rect.top - EDGE),
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
        aria-haspopup="dialog"
        aria-expanded={phase !== 'closed'}
        aria-label="Открыть описание страницы"
        onClick={openPanel}
        style={
          phase === 'closed'
            ? undefined
            : { opacity: expanded ? 0 : 1, pointerEvents: 'none' }
        }
        className={`hdr-glow rounded-full border border-white/70 bg-slate-200/65 px-5 py-1.5 text-xs font-medium text-slate-600 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-200 hover:bg-white/70 active:scale-95 select-none ${className}`}
      >
        <span
          className="transition-opacity duration-150"
          style={{ opacity: phase === 'closed' ? 1 : 0 }}
        >
          Описание
        </span>
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
              aria-label="Описание страницы"
              className={`fb-panel${expanded ? ' is-open' : ''}${phase === 'closing' ? ' is-closing' : ''}`}
              style={panelStyle}
            >
              <div ref={shellRef} className="fb-shell">
                <div
                  ref={innerRef}
                  className="fb-inner flex flex-col gap-3 p-5"
                  style={{ width: geo.endWidth, maxHeight: geo.maxHeight, boxSizing: 'border-box' }}
                >
                  <h2 className="text-lg font-semibold text-slate-800">{description.title}</h2>
                  <p className="text-sm leading-relaxed text-slate-600">{description.text}</p>
                  {description.points.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {description.points.map((point) => (
                        <span
                          key={point}
                          className="rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-medium text-slate-600"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs leading-relaxed text-slate-400">{descriptionFooter}</p>
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
