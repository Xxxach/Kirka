import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AdSlot } from './AdSlot';
import { FeedbackButton } from './FeedbackButton';
import { DescriptionButton } from './DescriptionButton';
import { SectionsPopover } from './SectionsPopover';
import { Logo, BetkaMetka, LogoInfo } from './Logo';

const tabs = [
  { to: '/', label: 'Текст-моменты', end: true },
  { to: '/photo-page', label: 'Фото-моменты' },
  { to: '/kod-page', label: 'Код-моменты' },
  { to: '/file-page', label: 'Файл-моменты' },
];

// Фон активной вкладки рисует «жидкий» индикатор (см. TabsCapsule), тут только цвет текста.
const tabClass = ({ isActive }) =>
  `relative z-10 px-4 py-1 pb-1.5 rounded-full text-sm font-medium transition-colors duration-300 select-none ${
    isActive ? 'text-[#7A2432]' : 'text-slate-500 hover:text-slate-800'
  }`;

function isTabActive(tab, pathname) {
  if (tab.end) return pathname === tab.to;
  return pathname === tab.to || pathname.startsWith(`${tab.to}/`);
}

// Капсула вкладок: одна «капля» переезжает между вкладками и тянется в сторону
// движения (ближний край бежит быстрее дальнего). Каплю можно схватить и перетащить:
// она «всплывает» над панелью, тянется за скоростью и пружинно садится на ближнюю вкладку.
function TabsCapsule() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeIndex = tabs.findIndex((tab) => isTabActive(tab, pathname));
  const capsuleRef = useRef(null);
  const tabRefs = useRef([]);
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
    const el = tabRefs.current[index];
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

  // Первое появление индикатора без анимации, дальше — с ней.
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
    if (!capsule || !box || activeIndex < 0) return;
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
    if (onDrop) setLifted(true); // нажали на каплю: она сразу «всплывает»
  };

  const handlePointerMove = (event) => {
    const capsule = capsuleRef.current;
    if (!capsule) return;
    const rect = capsule.getBoundingClientRect();
    capsule.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    capsule.style.setProperty('--my', `${event.clientY - rect.top}px`);

    const press = pressRef.current;
    if (!press || press.id !== event.pointerId) return;
    if (!press.dragging) {
      if (Math.abs(event.clientX - press.startX) < 6) return;
      press.dragging = true;
      try {
        capsule.setPointerCapture?.(event.pointerId);
      } catch {
        // захват указателя не критичен
      }
      setLifted(true);
    }

    const first = tabRefs.current[0];
    const last = tabRefs.current[tabs.length - 1];
    if (!first || !last) return;
    const minLeft = first.offsetLeft;
    const maxLeft = last.offsetLeft + last.offsetWidth - press.width;
    const left = Math.min(maxLeft, Math.max(minLeft, event.clientX - rect.left - press.grab));

    // Скорость сглаживаем: капля растягивается, когда её тянут быстро.
    const dt = Math.max(1, event.timeStamp - press.lastT);
    press.speed = press.speed * 0.6 + ((event.clientX - press.lastX) / dt) * 0.4;
    press.lastX = event.clientX;
    press.lastT = event.timeStamp;
    const stretch = Math.min(16, Math.abs(press.speed) * 18);

    const center = left + press.width / 2;
    let nearest = 0;
    let best = Infinity;
    tabRefs.current.forEach((el, index) => {
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
    if (!press.dragging) return; // обычный клик, дальше работает сама ссылка

    const capsule = capsuleRef.current;
    try {
      capsule?.releasePointerCapture?.(event.pointerId);
    } catch {
      // не критично
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
    if (target !== activeIndex) navigate(tabs[target].to);
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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPress}
      onPointerCancel={finishPress}
      onClickCapture={handleClickCapture}
      className="tab-capsule flex items-center justify-center gap-1 px-1 py-1 bg-slate-200/50 backdrop-blur-xl rounded-full border border-white/60 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.2)]"
    >
      {shown && activeIndex >= 0 && (
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
      {tabs.map(({ to, label, end }, index) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          draggable={false}
          className={({ isActive }) =>
            tabClass({ isActive: drag ? index === drag.index : isActive })
          }
          ref={(el) => {
            tabRefs.current[index] = el;
          }}
        >
          {label}
        </NavLink>
      ))}
    </div>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    try {
      return typeof window !== 'undefined' && window.localStorage.getItem('kirka-theme') === 'dark';
    } catch {
      return false;
    }
  });
  const [dragX, setDragX] = useState(null);
  const pointerRef = useRef(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', isDark);
    try {
      window.localStorage.setItem('kirka-theme', isDark ? 'dark' : 'light');
    } catch {
      // Переключение темы работает и без доступа к localStorage.
    }
  }, [isDark]);

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      dragging: false,
      x: isDark ? 27 : 0,
    };
    setDragX(isDark ? 27 : 0);
  };

  const handlePointerMove = (event) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    if (!pointer.dragging && Math.abs(event.clientX - pointer.startX) < 5) return;
    if (!pointer.dragging) {
      pointer.dragging = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Захват указателя нужен только после начала перетаскивания.
      }
    }
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.x = Math.min(27, Math.max(0, event.clientX - rect.left - 16));
    setDragX(pointer.x);
  };

  const finishPointer = (event) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    pointerRef.current = null;
    setDragX(null);
    if (!pointer.dragging) return;
    suppressClickRef.current = true;
    setIsDark(pointer.x >= 13.5);
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const handleClickCapture = (event) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      className="tab-capsule theme-toggle pointer-events-auto"
      role="group"
      aria-label="Тема оформления"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      onClickCapture={handleClickCapture}
    >
      <span
        aria-hidden="true"
        className={`tab-liquid theme-toggle-liquid${isDark ? ' is-dark' : ''}`}
        style={dragX === null ? undefined : { transform: `translateX(${dragX}px)` }}
      />
      <button
        type="button"
        className={`theme-toggle-option${!isDark ? ' is-active' : ''}`}
        aria-label="Светлая тема"
        aria-pressed={!isDark}
        onClick={() => setIsDark(false)}
      >
        ☼
      </button>
      <button
        type="button"
        className={`theme-toggle-option${isDark ? ' is-active' : ''}`}
        aria-label="Тёмная тема"
        aria-pressed={isDark}
        onClick={() => setIsDark(true)}
      >
        ☾
      </button>
    </div>
  );
}

export function Header() {
  return (
    <>
      <div className="sticky top-0 z-50 flex flex-col gap-1 p-3">
      {/* Десктопная версия */}
      <div className="hidden md:flex items-center justify-between gap-15 px-5 py-4 glass-bar rounded-3xl">
        <LogoInfo>
          <Logo className="h-9 w-auto" />
          <BetkaMetka />
        </LogoInfo>
        <AdSlot height="h-15" />
        <div className="flex flex-col w-80 items-center text-center">
          <p className="text-l">Абсолютно бесплатный сайт</p>
          <p className="text-sm text-slate-500">
            (только реклама и лимит 30-300 в день)
          </p>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex justify-start">
          <DescriptionButton />
        </div>
        <TabsCapsule />
        <div className="flex items-center justify-end gap-2">
          <ThemeToggle />
          <FeedbackButton />
        </div>
      </div>

      {/* Моб версия */}
      <div className="md:hidden flex flex-col gap-2 px-3 py-3 glass-bar [--glass-a:0.22] rounded-3xl">
        <div className="flex items-center justify-between gap-3 px-1">
          <LogoInfo>
            <Logo className="h-8 w-auto" />
            <BetkaMetka />
          </LogoInfo>
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
      <div className="md:hidden relative z-55 grid grid-cols-[1fr_auto_1fr] items-center gap-2 pointer-events-none">
        <div className="flex justify-start">
          <DescriptionButton className="pointer-events-auto" />
        </div>
        <div className="flex items-center justify-center gap-2 pointer-events-none">
          <ThemeToggle />
          <FeedbackButton className="pointer-events-auto" />
        </div>
        <div className="flex justify-end">
          <SectionsPopover tabs={tabs} className="pointer-events-auto" />
        </div>
      </div>
      </div>
    </>
  );
}
