import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Стеклянное окно, которое «вырастает» из нажатого элемента (плитки) на пружинах,
// как у кнопок «Обратная связь» и «Описание». Стили берутся из общих классов fb-*.
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

// anchor: прямоугольник нажатого элемента (getBoundingClientRect), radius: его скругление.
// children({ close, expanded }) рисует содержимое окна.
export function TilePopover({
  anchor,
  radius = 16,
  width = 380,
  label,
  style,
  returnFocusTo,
  onClosed,
  onExpandedChange,
  children,
}) {
  // start (окно размером с плитку) -> open -> closing
  const [stage, setStage] = useState('start');
  const [contentHeight, setContentHeight] = useState(0);
  const innerRef = useRef(null);
  const panelRef = useRef(null);
  const shellRef = useRef(null);
  const shadowRef = useRef(null);
  const springRef = useRef({ x: 0, vx: 0, y: 0, vy: 0, raf: 0 });
  const callbacks = useRef({});
  const [closeRequested, setCloseRequested] = useState(false);
  const phase = closeRequested ? 'closing' : stage;

  useEffect(() => {
    callbacks.current = { onClosed, onExpandedChange, returnFocusTo };
  });

  // Геометрия считается один раз при открытии
  const [geo] = useState(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const endWidth = Math.min(width, vw - EDGE * 2);
    return {
      endWidth,
      endLeft: clamp(anchor.left + anchor.width / 2 - endWidth / 2, EDGE, vw - endWidth - EDGE),
      maxHeight: Math.max(220, vh - EDGE * 2),
      vh,
    };
  });

  const finalHeight = Math.min(contentHeight || anchor.height, geo.maxHeight);
  const endTop = clamp(anchor.top, EDGE, Math.max(EDGE, geo.vh - finalHeight - EDGE));

  useEffect(() => {
    callbacks.current.onExpandedChange?.(phase === 'open');
  }, [phase]);

  useEffect(() => {
    const spring = springRef.current;
    return () => {
      cancelAnimationFrame(spring.raf);
      callbacks.current.onExpandedChange?.(false);
    };
  }, []);

  // Три кадра: окно рисуется «свёрнутым» и измеряется, потом раскрывается.
  useEffect(() => {
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => {
        id = requestAnimationFrame(() => setStage((current) => (current === 'start' ? 'open' : current)));
      });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const close = useCallback(() => setCloseRequested(true), []);

  // Запрос на закрытие: сначала пружина сворачивает окно, потом сообщаем родителю
  useEffect(() => {
    if (!closeRequested) return undefined;
    const id = setTimeout(() => {
      callbacks.current.returnFocusTo?.focus?.({ preventScroll: true });
      callbacks.current.onClosed?.();
    }, 380);
    return () => clearTimeout(id);
  }, [closeRequested]);

  // Высота окна следует за содержимым
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return undefined;
    setContentHeight(inner.offsetHeight);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => setContentHeight(inner.offsetHeight));
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  // Esc закрывает; на смене ширины экрана тоже (поворот, ресайз)
  useEffect(() => {
    if (phase !== 'open') return undefined;
    const startWidth = window.innerWidth;
    const onKey = (event) => {
      if (event.key === 'Escape') close();
    };
    const onResize = () => {
      if (window.innerWidth !== startWidth) close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [phase, close]);

  // Пружина пишет transform, скругление и прозрачность прямо в DOM
  useEffect(() => {
    const el = panelRef.current;
    const shell = shellRef.current;
    const shadow = shadowRef.current;
    const inner = innerRef.current;
    if (!el || !shell || !shadow || !inner || (phase !== 'open' && phase !== 'closing')) return undefined;

    const opening = phase === 'open';
    const spring = springRef.current;
    const height = Math.max(1, Math.min(inner.offsetHeight || anchor.height, geo.maxHeight));
    const top = clamp(anchor.top, EDGE, Math.max(EDGE, geo.vh - height - EDGE));
    const sx0 = anchor.width / geo.endWidth;
    const sy0 = anchor.height / Math.max(height, anchor.height, 1);
    const dx0 = anchor.left - geo.endLeft;
    const dy0 = anchor.top - top;
    const r0 = radius;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let lastRadius = '';
    const paint = () => {
      const px = clamp(spring.x, 0, 1.25);
      const py = clamp(spring.y, 0, 1.25);
      const sx = Math.max(0.001, sx0 + (1 - sx0) * px);
      const sy = Math.max(0.001, sy0 + (1 - sy0) * py);
      const r = Math.max(0, r0 + (PANEL_RADIUS - r0) * px);
      el.style.transform = `translate3d(${dx0 * (1 - px)}px, ${dy0 * (1 - py)}px, 0) scale(${sx}, ${sy})`;
      const rx = Math.round((r / sx) * 2) / 2;
      const ry = Math.round((r / sy) * 2) / 2;
      const next = `${rx}px / ${ry}px`;
      if (next !== lastRadius) {
        lastRadius = next;
        shell.style.borderRadius = next;
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
      const target = opening ? 1 : 0;
      stepSpring(spring, 'x', target, opening ? SPRING_OPEN_X : SPRING_CLOSE, dt);
      stepSpring(spring, 'y', target, opening ? SPRING_OPEN_Y : SPRING_CLOSE, dt);
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
  }, [phase, anchor, geo, radius]);

  const expanded = phase === 'open';

  return createPortal(
    <>
      <div className={`fb-dim${expanded ? ' is-open' : ''}`} onClick={close} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`fb-panel${expanded ? ' is-open' : ''}${phase === 'closing' ? ' is-closing' : ''}`}
        style={{ ...style, left: geo.endLeft, top: endTop, width: geo.endWidth, height: finalHeight }}
      >
        <div ref={shellRef} className="fb-shell">
          <div
            ref={innerRef}
            className="fb-inner p-5"
            style={{ width: geo.endWidth, maxHeight: geo.maxHeight, boxSizing: 'border-box' }}
          >
            {children({ close, expanded })}
          </div>
        </div>
        <div ref={shadowRef} className="fb-shadow" />
      </div>
    </>,
    document.body,
  );
}
