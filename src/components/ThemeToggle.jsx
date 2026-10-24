import { useCallback, useEffect, useRef, useState } from 'react';
import { setDark, useDark } from '../hooks/useTheme';

const options = [
  {
    id: 'light',
    label: 'Светлая тема',
    icon: (
      <>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
      </>
    ),
  },
  {
    id: 'dark',
    label: 'Тёмная тема',
    icon: <path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5a8.6 8.6 0 1 0 10.7 10.7z" />,
  },
];

export function ThemeToggle({ className = '' }) {
  const dark = useDark();
  const activeIndex = dark ? 1 : 0;
  const capsuleRef = useRef(null);
  const itemRefs = useRef([]);
  const pressRef = useRef(null);
  const suppressClickRef = useRef(false);
  const timersRef = useRef([]);
  const [box, setBox] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [prevIndex, setPrevIndex] = useState(activeIndex);
  const [dir, setDir] = useState(1);
  const [lifted, setLifted] = useState(false);
  const [settling, setSettling] = useState(false);
  const [drag, setDrag] = useState(null);

  if (prevIndex !== activeIndex) {
    setDir(activeIndex > prevIndex ? 1 : -1);
    setPrevIndex(activeIndex);
  }

  const boxOf = useCallback((index) => {
    const capsule = capsuleRef.current;
    const el = itemRefs.current[index];
    if (!capsule || !el) return null;
    return {
      left: el.offsetLeft,
      right: capsule.clientWidth - el.offsetLeft - el.offsetWidth,
    };
  }, []);

  const measure = useCallback(() => {
    setBox(boxOf(activeIndex));
  }, [activeIndex, boxOf]);

  useEffect(() => {
    const capsule = capsuleRef.current;
    if (!capsule) return undefined;
    const raf = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(capsule);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [measure]);

  useEffect(() => {
    if (!box || animate) return undefined;
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [box, animate]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const later = (fn, ms) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const capsule = capsuleRef.current;
    if (!capsule || !box) return;
    const x = event.clientX - capsule.getBoundingClientRect().left;
    const width = capsule.clientWidth - box.right - box.left;
    const onDrop = x >= box.left && x <= box.left + width;
    pressRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      grab: onDrop ? x - box.left : width / 2,
      width,
      dragging: false,
      index: activeIndex,
      lastX: event.clientX,
      lastT: event.timeStamp,
      speed: 0,
    };
    if (onDrop) setLifted(true);
  };

  const handlePointerMove = (event) => {
    const capsule = capsuleRef.current;
    if (!capsule) return;
    const rect = capsule.getBoundingClientRect();

    const press = pressRef.current;
    if (!press || press.id !== event.pointerId) return;
    if (!press.dragging) {
      if (Math.abs(event.clientX - press.startX) < 6) return;
      press.dragging = true;
      try {
        capsule.setPointerCapture?.(event.pointerId);
      } catch {
        press.dragging = true;
      }
      setLifted(true);
    }

    const first = itemRefs.current[0];
    const last = itemRefs.current[options.length - 1];
    if (!first || !last) return;
    const minLeft = first.offsetLeft;
    const maxLeft = last.offsetLeft + last.offsetWidth - press.width;
    const left = Math.min(maxLeft, Math.max(minLeft, event.clientX - rect.left - press.grab));

    const dt = Math.max(1, event.timeStamp - press.lastT);
    press.speed = press.speed * 0.6 + ((event.clientX - press.lastX) / dt) * 0.4;
    press.lastX = event.clientX;
    press.lastT = event.timeStamp;
    const stretch = Math.min(16, Math.abs(press.speed) * 18);

    const center = left + press.width / 2;
    let nearest = 0;
    let best = Infinity;
    itemRefs.current.forEach((el, index) => {
      if (!el) return;
      const distance = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center);
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    });
    press.index = nearest;

    setDrag({
      left: left - stretch / 2,
      right: capsule.clientWidth - (left + press.width) - stretch / 2,
      index: nearest,
    });
  };

  const finishPress = (event) => {
    const press = pressRef.current;
    if (!press || press.id !== event.pointerId) return;
    pressRef.current = null;
    setLifted(false);
    if (!press.dragging) return;

    try {
      capsuleRef.current?.releasePointerCapture?.(event.pointerId);
    } catch {
      suppressClickRef.current = true;
    }
    suppressClickRef.current = true;
    later(() => {
      suppressClickRef.current = false;
    }, 80);

    const target = press.index;
    const targetBox = boxOf(target);
    setDrag(null);
    if (targetBox) setBox(targetBox);
    setDir(target >= activeIndex ? 1 : -1);
    setSettling(true);
    later(() => setSettling(false), 650);
    setDark(target === 1);
  };

  const handleClickCapture = (event) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const ease = 'cubic-bezier(0.34, 1.35, 0.64, 1)';
  const spring = 'cubic-bezier(0.34, 1.45, 0.64, 1)';
  const leadDuration = '0.3s';
  const lagDuration = '0.55s';
  const shown = drag || box;
  const edgeTransition = drag
    ? 'left 0s, right 0s'
    : animate
      ? `left ${dir > 0 ? lagDuration : leadDuration} ${ease}, right ${dir > 0 ? leadDuration : lagDuration} ${ease}`
      : 'left 0s, right 0s';
  const liftTransition = `transform 0.4s ${spring}, top 0.35s ${spring}, bottom 0.35s ${spring}, background 0.3s ease, box-shadow 0.3s ease`;
  const indicatorClass = `tab-liquid${lifted ? ' is-lifted' : ''}${settling ? ' is-settling' : ''}`;

  return (
    <div
      ref={capsuleRef}
      role="group"
      aria-label="Тема оформления"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPress}
      onPointerCancel={finishPress}
      onClickCapture={handleClickCapture}
      className={`tab-capsule toggle-compact flex items-center justify-center gap-0.5 p-0.5 bg-slate-200/65 backdrop-blur-xl rounded-full border border-white/70 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.2)] ${className}`}
    >
      {shown && (
        <span
          aria-hidden="true"
          className={indicatorClass}
          style={{
            left: shown.left,
            right: shown.right,
            transition: `${edgeTransition}, ${liftTransition}`,
          }}
        />
      )}
      {options.map((option, index) => {
        const active = drag ? index === drag.index : index === activeIndex;
        return (
          <button
            key={option.id}
            type="button"
            draggable={false}
            aria-label={option.label}
            aria-pressed={index === activeIndex}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            onClick={() => setDark(index === 1)}
            className={`relative z-10 grid h-6 w-9 place-items-center rounded-full transition-colors duration-300 select-none ${
              active ? 'text-[#7A2432]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg
              aria-hidden="true"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {option.icon}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
