import { useSyncExternalStore } from 'react';

// «Красивое размытие»: стекло с размытием и цветным преломлением. Выключено = плоские панели, как в обычных браузерах.
const KEY = 'kirka-glass';
const listeners = new Set();

const readStored = () => {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
};

let glass = typeof window !== 'undefined' ? readStored() : true;

const apply = () => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('no-glass', !glass);
};
apply();

export function setGlass(next) {
  if (next === glass) return;
  glass = next;
  try {
    localStorage.setItem(KEY, next ? 'on' : 'off');
  } catch {
    // хранилище недоступно: настройка действует до перезагрузки
  }
  apply();
  listeners.forEach((listener) => listener());
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useGlass() {
  return useSyncExternalStore(subscribe, () => glass, () => true);
}
