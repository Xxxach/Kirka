import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

const MAX_HEIGHT = 300;
const MIN_HEIGHT = 96;
const GAP = 8;
const EDGE = 8;
const LIST_PAD = 6;
const TYPE_RESET_MS = 700;
const SEARCH_FROM = 7;
const TOUCH_QUERY = '(hover: none) and (pointer: coarse)';

const norm = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const filterOptions = (options, query) => {
  const q = norm(query);
  if (!q) return options;
  return options.filter(
    (o) => norm(o.label).includes(q) || norm(o.value).includes(q),
  );
};

const stepFrom = (list, isOff, from, dir) => {
  const n = list.length;
  for (let k = 1; k <= n; k += 1) {
    const i = (((from + dir * k) % n) + n) % n;
    if (!isOff(list[i])) return i;
  }
  return -1;
};

function useIsTouch() {
  const [touch, setTouch] = useState(() => window.matchMedia(TOUCH_QUERY).matches);
  useEffect(() => {
    const mql = window.matchMedia(TOUCH_QUERY);
    const sync = () => setTouch(mql.matches);
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);
  return touch;
}

export function ThemedSelect({
  options = [],
  value = null,
  onChange,
  isOptionDisabled,
  placeholder = 'Выбрать',
  className = '',
}) {
  const isTouch = useIsTouch();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const inputRef = useRef(null);
  const popRef = useRef(null);
  const typedRef = useRef('');
  const timerRef = useRef(0);
  const scrollRef = useRef(false);
  const listId = `${useId()}-list`;

  const canSearch = options.length >= SEARCH_FROM;
  const visible = filterOptions(options, query);
  const selectedIndex = value
    ? visible.findIndex((o) => o.value === value.value)
    : -1;

  const isOff = useCallback(
    (option) => Boolean(isOptionDisabled?.(option)),
    [isOptionDisabled],
  );

  const close = (refocus = false) => {
    setOpen(false);
    setSearching(false);
    setQuery('');
    if (refocus) btnRef.current?.focus({ preventScroll: true });
  };

  const show = (index) => {
    setPos(null);
    setActive(index);
    scrollRef.current = true;
    setOpen(true);
  };

  const openMenu = (initial = '') => {
    const list = filterOptions(options, initial);
    const sel =
      initial || !value ? -1 : list.findIndex((o) => o.value === value.value);
    const keep = sel >= 0 && !isOff(list[sel]);
    const search = canSearch && (!isTouch || initial !== '');
    setQuery(initial);
    setSearching(search);
    show(keep ? sel : stepFrom(list, isOff, -1, 1));
    if (search) inputRef.current?.focus();
  };

  const startSearch = () => {
    setSearching(true);
    inputRef.current?.focus();
  };

  const choose = (index) => {
    const option = visible[index];
    if (!option || isOff(option)) return;
    close(true);
    onChange?.(option);
  };

  const typeahead = (char) => {
    window.clearTimeout(timerRef.current);
    typedRef.current += norm(char) || char;
    timerRef.current = window.setTimeout(() => {
      typedRef.current = '';
    }, TYPE_RESET_MS);
    const found = visible.findIndex(
      (o) => !isOff(o) && norm(o.label).startsWith(typedRef.current),
    );
    if (found < 0) return;
    if (open) {
      scrollRef.current = true;
      setActive(found);
    } else {
      show(found);
    }
  };

  const handleQuery = (event) => {
    const next = event.target.value;
    setQuery(next);
    scrollRef.current = true;
    setActive(stepFrom(filterOptions(options, next), isOff, -1, 1));
  };

  const handleClick = (event) => {
    if (searching && event.target === inputRef.current) return;
    if (!open) {
      openMenu();
      return;
    }
    if (isTouch && canSearch && !searching) {
      startSearch();
      return;
    }
    close();
  };

  const handleKeyDown = (event) => {
    const { key } = event;
    if (key === 'Tab') {
      if (open) close();
      return;
    }
    if (key === 'Escape') {
      if (open) {
        event.preventDefault();
        close(true);
      }
      return;
    }
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      scrollRef.current = true;
      setActive((current) =>
        stepFrom(visible, isOff, current, key === 'ArrowDown' ? 1 : -1),
      );
      return;
    }
    if (key === 'Home' || key === 'End') {
      if (!open || searching) return;
      event.preventDefault();
      scrollRef.current = true;
      setActive(
        key === 'Home'
          ? stepFrom(visible, isOff, -1, 1)
          : stepFrom(visible, isOff, 0, -1),
      );
      return;
    }
    if (key === 'Enter' || (key === ' ' && !searching && !typedRef.current)) {
      event.preventDefault();
      if (!open) openMenu();
      else if (active >= 0) choose(active);
      else close(true);
      return;
    }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (searching) return;
      event.preventDefault();
      if (canSearch && !open) openMenu(key);
      else typeahead(key);
    }
  };

  const place = useCallback(() => {
    const btn = btnRef.current;
    const pop = popRef.current;
    if (!btn || !pop) return;
    const rect = btn.getBoundingClientRect();
    const vh = window.innerHeight;
    const below = vh - rect.bottom - GAP - EDGE;
    const above = rect.top - GAP - EDGE;
    const natural = Math.min(MAX_HEIGHT, pop.scrollHeight);
    const up = natural > below && above > below;
    setPos({
      left: rect.left,
      width: rect.width,
      up,
      anchor: up ? vh - rect.top + GAP : rect.bottom + GAP,
      maxHeight: Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, up ? above : below)),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return undefined;
    place();
    const onScroll = (event) => {
      if (popRef.current?.contains(event.target)) return;
      place();
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', place);
    };
  }, [open, place, visible.length]);

  useLayoutEffect(() => {
    if (!open || !pos || !scrollRef.current) return;
    scrollRef.current = false;
    const pop = popRef.current;
    const item = pop?.children[active];
    if (!item) return;
    const top = item.offsetTop - LIST_PAD;
    const bottom = item.offsetTop + item.offsetHeight + LIST_PAD;
    if (top < pop.scrollTop) pop.scrollTop = top;
    else if (bottom > pop.scrollTop + pop.clientHeight) {
      pop.scrollTop = bottom - pop.clientHeight;
    }
  }, [open, pos, active]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      if (popRef.current?.contains(event.target)) return;
      close();
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const popStyle = {
    left: pos?.left,
    width: pos?.width,
    top: pos && !pos.up ? pos.anchor : undefined,
    bottom: pos?.up ? pos.anchor : undefined,
    maxHeight: pos?.maxHeight ?? MAX_HEIGHT,
    visibility: pos ? undefined : 'hidden',
  };

  return (
    <div ref={rootRef} className={`ksel ${className}`}>
      <div
        ref={btnRef}
        role="combobox"
        tabIndex={0}
        className={searching ? 'ksel__btn is-search' : 'ksel__btn'}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div className="ksel__val">
          {!query && (
            <span className={value ? 'ksel__label' : 'ksel__label ksel__ph'}>
              {value ? value.label : placeholder}
            </span>
          )}
          {canSearch && (
            <input
              ref={inputRef}
              className="ksel__find"
              value={query}
              onChange={handleQuery}
              tabIndex={-1}
              aria-label={placeholder}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          )}
        </div>
        <span className="ksel__sep" aria-hidden="true" />
        <span className="ksel__arrow" aria-hidden="true">
          <svg className="ksel__chev" viewBox="0 0 20 20" width={16} height={16}>
            <path
              d="M5 7l5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      {open &&
        createPortal(
          <div
            ref={popRef}
            id={listId}
            role="listbox"
            className="ksel__pop"
            style={popStyle}
            onMouseDown={(event) => event.preventDefault()}
          >
            {visible.length === 0 && (
              <div className="ksel__empty">Ничего не найдено</div>
            )}
            {visible.map((option, i) => {
              const off = isOff(option);
              let cls = 'ksel__item';
              if (i === active) cls += ' is-active';
              if (i === selectedIndex) cls += ' is-selected';
              if (off) cls += ' is-off';
              return (
                <div
                  key={option.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === selectedIndex}
                  aria-disabled={off || undefined}
                  className={cls}
                  onMouseMove={() => {
                    if (!off && active !== i) setActive(i);
                  }}
                  onClick={() => choose(i)}
                >
                  {option.label}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
