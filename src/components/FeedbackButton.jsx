import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getApiBase } from '../api';
import { trackGoal } from '../analytics';

const PANEL_WIDTH = 360;
const EDGE = 12;
const PANEL_RADIUS = 28;

// Пружины раскрытия: по X быстрее и жёстче, по Y мягче и с запаздыванием. Из-за разницы панель
// сначала «растекается» вширь и только потом оседает вниз (эффект жидкости). Закрытие без отскока.
const SPRING_OPEN_X = { k: 300, c: 22 };
const SPRING_OPEN_Y = { k: 185, c: 18 };
const SPRING_CLOSE = { k: 420, c: 41 };

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Шаг пружины (масса 1), полу-неявный Эйлер с подшагами для устойчивости.
function stepSpring(state, key, target, { k, c }, dt) {
  const steps = 3;
  const h = dt / steps;
  for (let i = 0; i < steps; i += 1) {
    const accel = -k * (state[key] - target) - c * state[`v${key}`];
    state[`v${key}`] += accel * h;
    state[key] += state[`v${key}`] * h;
  }
}

export function FeedbackButton({ className = '' }) {
  // closed -> start (панель размером с кнопку) -> open -> closing -> closed
  const [phase, setPhase] = useState('closed');
  const [geo, setGeo] = useState(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const buttonRef = useRef(null);
  const innerRef = useRef(null);
  const textareaRef = useRef(null);
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

  // Пружина: пишет transform, скругление и прозрачность прямо в DOM, минуя React.
  useEffect(() => {
    const el = panelRef.current;
    const shell = shellRef.current;
    const shadow = shadowRef.current;
    const g = geoRef.current;
    const inner = innerRef.current;
    if (!el || !shell || !shadow || !g || !inner || (phase !== 'open' && phase !== 'closing')) return undefined;

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
      // Углы пересчитываем под растяжение, чтобы на экране они оставались круглыми.
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
    const endLeft = Math.min(Math.max(rect.right - width, EDGE), vw - width - EDGE);
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
    // Три кадра: сначала панель рисуется в «свёрнутом» виде и измеряется, потом раскрывается.
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
      setStatus('idle');
      setMessage('');
      buttonRef.current?.focus?.({ preventScroll: true });
    }, 380);
  }, [later]);

  // Esc закрывает. На resize закрываем только при смене ШИРИНЫ (поворот экрана, ресайз окна):
  // экранная клавиатура на телефоне меняет только высоту и не должна закрывать панель.
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

  // Высота панели следует за содержимым: смена состояний (форма -> «Спасибо») плавно растягивает её.
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner || phase === 'closed') return undefined;
    const observer = new ResizeObserver(() => setContentHeight(inner.offsetHeight));
    observer.observe(inner);
    return () => observer.disconnect();
  }, [phase]);

  useEffect(() => {
    if (phase !== 'open' || status !== 'idle') return undefined;
    // На телефоне сами клавиатуру не открываем: она дёргает вёрстку во время анимации.
    if (window.matchMedia?.('(pointer: coarse)').matches) return undefined;
    const id = setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 320);
    return () => clearTimeout(id);
  }, [phase, status]);

  const submit = async () => {
    if (!message.trim() || status === 'sending') return;
    setStatus('sending');
    try {
      const apiUrl = await getApiBase('text');
      const res = await fetch(`${apiUrl}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, page: window.location.pathname }),
      });
      if (!res.ok) throw new Error();
      trackGoal('feedback_sent');
      setStatus('done');
      later(closePanel, 2200);
    } catch {
      setStatus('error');
    }
  };

  const handleTextKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      submit();
    }
  };

  const expanded = phase === 'open';
  // Панель всегда имеет итоговый размер и положение. «Свёрнутой» её делает пружина
  // (transform), поэтому во время анимации вёрстка не пересчитывается.
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
        onClick={openPanel}
        style={
          phase === 'closed'
            ? undefined
            : { opacity: expanded ? 0 : 1, pointerEvents: 'none' }
        }
        className={`rounded-full border border-white/70 bg-slate-200/65 px-5 py-1.5 text-xs font-medium text-slate-600 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-200 hover:bg-white/70 active:scale-95 select-none ${className}`}
      >
        <span
          className="transition-opacity duration-150"
          style={{ opacity: phase === 'closed' ? 1 : 0 }}
        >
          Обратная связь
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
              aria-label="Обратная связь"
              className={`fb-panel${expanded ? ' is-open' : ''}${phase === 'closing' ? ' is-closing' : ''}`}
              style={panelStyle}
            >
              <div ref={shellRef} className="fb-shell">
              <div
                ref={innerRef}
                className="fb-inner p-5"
                style={{ width: geo.endWidth, maxHeight: geo.maxHeight, boxSizing: 'border-box' }}
              >
                {status === 'done' ? (
                  <div className="flex flex-col items-center text-center py-3">
                    <div className="fb-check mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/90 text-white shadow-[0_8px_18px_-6px_rgba(16,185,129,0.7)]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-1">Спасибо!</h2>
                    <p className="text-sm text-slate-500">
                      Сообщение получено, обязательно прочитаем.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">
                      Нашли баг или есть идея?
                    </h2>
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleTextKeyDown}
                      maxLength={2000}
                      placeholder="Расскажи, что сломалось или что улучшить..."
                      className="w-full h-32 p-3 bg-white/55 border border-white/70 outline-none focus:bg-white/80 focus:border-[#7A2432]/40 focus:ring-1 focus:ring-[#7A2432]/25 rounded-2xl resize-none placeholder:text-slate-400 text-sm transition-colors"
                    />
                    <div className="flex items-center justify-between px-1 pt-1 pb-3 text-xs">
                      <span className={status === 'error' ? 'text-rose-600' : 'text-slate-400'}>
                        {status === 'error'
                          ? 'Не отправилось, попробуй ещё раз.'
                          : 'Ctrl + Enter — отправить'}
                      </span>
                      <span className="text-slate-400 tabular-nums">{message.length}/2000</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex-1 bg-white/60 hover:bg-white/85 border border-white/70 rounded-full text-slate-600 px-6 py-2.5 transition-colors"
                        onClick={closePanel}
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        className="gel flex-1 bg-[#7A2432] hover:bg-[#5c1c28] rounded-full text-white px-6 py-2.5 transition-colors disabled:opacity-50"
                        onClick={submit}
                        disabled={status === 'sending' || !message.trim()}
                      >
                        {status === 'sending' ? 'Отправка...' : 'Отправить'}
                      </button>
                    </div>
                  </>
                )}
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
