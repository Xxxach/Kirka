import { useCallback, useEffect, useRef, useState } from 'react';
import Select, { components } from 'react-select';

const accentTheme = (theme) => ({
  ...theme,
  borderRadius: 8,
  colors: {
    ...theme.colors,
    primary: '#7A2432',
    primary75: '#a45a63',
    primary50: '#e9d6da',
    primary25: '#f3e8ea',
    neutral20: '#cbd5e1',
    neutral30: '#94a3b8',
  },
});

// Стрелочка плавно разворачивается при открытии списка.
function DropdownIndicator(props) {
  return (
    <components.DropdownIndicator {...props}>
      <svg
        viewBox="0 0 20 20"
        width={16}
        height={16}
        style={{
          transform: props.selectProps.menuIsOpen
            ? 'rotate(180deg)'
            : 'rotate(0deg)',
          transition: 'transform 300ms ease',
        }}
      >
        <path
          d="M5 7l5 5 5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </components.DropdownIndicator>
  );
}

const defaultStyles = {
  menu: (base) => ({
    ...base,
    animation: 'kirka-select-fade 220ms ease-out',
  }),
  option: (base) => ({
    ...base,
    transition: 'background-color 160ms ease, color 160ms ease',
  }),
  // Заголовки групп (например, в списке «Что генерируем»).
  groupHeading: (base) => ({
    ...base,
    textTransform: 'none',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#94a3b8',
    padding: '6px 12px 2px',
  }),
};

// Аккуратно совмещает наши стили по умолчанию с теми, что передаст
// конкретная страница (например menuPortal у PhotoPage), не затирая их.
function mergeStyles(base, overrides = {}) {
  const merged = { ...base };
  for (const key of Object.keys(overrides)) {
    const baseFn = base[key];
    const overrideFn = overrides[key];
    merged[key] = baseFn
      ? (styles, state) => overrideFn(baseFn(styles, state), state)
      : overrideFn;
  }
  return merged;
}

const TOUCH_QUERY = '(hover: none) and (pointer: coarse)';

function useIsTouch() {
  const [isTouch, setIsTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(TOUCH_QUERY).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(TOUCH_QUERY);
    const onChange = () => setIsTouch(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isTouch;
}

function TouchInput(props) {
  return (
    <components.Input
      {...props}
      inputMode={props.selectProps.kirkaSearching ? 'text' : 'none'}
    />
  );
}

function TouchControl(props) {
  const { innerProps, selectProps } = props;
  const startRef = useRef(null);

  const intercept = (event, original) => {
    const touch = event.changedTouches?.[0];
    const moved =
      touch && startRef.current
        ? Math.abs(touch.clientX - startRef.current.x) > 5 ||
          Math.abs(touch.clientY - startRef.current.y) > 5
        : false;
    if (
      !moved &&
      selectProps.menuIsOpen &&
      !selectProps.kirkaSearching &&
      event.target.tagName !== 'INPUT'
    ) {
      event.preventDefault();
      selectProps.kirkaStartSearch(event.currentTarget);
      return;
    }
    original?.(event);
  };

  return (
    <components.Control
      {...props}
      innerProps={{
        ...innerProps,
        onTouchStart: (event) => {
          const touch = event.touches[0];
          startRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
        },
        onTouchEnd: (event) => intercept(event, innerProps.onTouchEnd),
        onMouseDown: (event) => intercept(event, innerProps.onMouseDown),
      }}
    />
  );
}

export function ThemedSelect({
  components: customComponents,
  styles,
  onMenuOpen,
  onMenuClose,
  ...rest
}) {
  const isTouch = useIsTouch();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const keepOpenRef = useRef(false);

  const handleMenuOpen = useCallback(() => {
    setOpen(true);
    onMenuOpen?.();
  }, [onMenuOpen]);

  const handleMenuClose = useCallback(() => {
    if (keepOpenRef.current) return;
    setOpen(false);
    setSearching(false);
    onMenuClose?.();
  }, [onMenuClose]);

  const startSearch = useCallback((control) => {
    const input = control.querySelector('input');
    setSearching(true);
    if (!input) return;
    keepOpenRef.current = true;
    input.inputMode = 'text';
    input.blur();
    input.focus();
    keepOpenRef.current = false;
  }, []);

  const touchProps = isTouch
    ? {
        menuIsOpen: open,
        onMenuOpen: handleMenuOpen,
        onMenuClose: handleMenuClose,
        kirkaSearching: searching,
        kirkaStartSearch: startSearch,
      }
    : { onMenuOpen, onMenuClose };

  return (
    <Select
      {...rest}
      {...touchProps}
      theme={accentTheme}
      components={{
        DropdownIndicator,
        ...(isTouch ? { Control: TouchControl, Input: TouchInput } : {}),
        ...customComponents,
      }}
      styles={mergeStyles(defaultStyles, styles)}
    />
  );
}
