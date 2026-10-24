import { useSyncExternalStore } from 'react';

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

export function setDark(next) {
  if (next === dark) return;
  dark = next;
  persist(next);
  apply();
  listeners.forEach((listener) => listener());
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useDark() {
  return useSyncExternalStore(subscribe, () => dark, () => false);
}
