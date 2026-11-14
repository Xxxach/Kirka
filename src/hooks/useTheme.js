import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

const KEY = 'kirka-theme';
const listeners = new Set();

const readStored = () => {
  try {
    return localStorage.getItem(KEY) === 'dark';
  } catch {
    return false;
  }
};

const persist = (value) => {
  try {
    localStorage.setItem(KEY, value ? 'dark' : 'light');
  } catch {
    return;
  }
};

let dark = typeof window !== 'undefined' ? readStored() : false;

const apply = () => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark-theme', dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0a0a0a' : '#eef1f6');
};
apply();

const commit = (next) => {
  dark = next;
  persist(next);
  apply();
  listeners.forEach((listener) => listener());
};

export function setDark(next, origin) {
  if (next === dark) return;
  const canWave =
    origin &&
    typeof document !== 'undefined' &&
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canWave) {
    commit(next);
    return;
  }
  const root = document.documentElement;
  const reach = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );
  root.style.setProperty('--vt-x', `${origin.x}px`);
  root.style.setProperty('--vt-y', `${origin.y}px`);
  root.style.setProperty('--vt-r', `${Math.ceil(reach)}px`);
  const clear = () => {
    root.style.removeProperty('--vt-x');
    root.style.removeProperty('--vt-y');
    root.style.removeProperty('--vt-r');
  };
  const transition = document.startViewTransition(() => {
    flushSync(() => commit(next));
  });
  const stop = () => transition.skipTransition();
  const startGuard = setTimeout(stop, 500);
  const capGuard = setTimeout(stop, 1500);
  const done = () => {
    clearTimeout(startGuard);
    clearTimeout(capGuard);
    clear();
  };
  transition.ready.then(() => clearTimeout(startGuard), () => clearTimeout(startGuard));
  transition.finished.then(done, done);
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useDark() {
  return useSyncExternalStore(subscribe, () => dark, () => false);
}
