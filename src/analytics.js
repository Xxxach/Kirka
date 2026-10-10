export const METRIKA_ID = 113368493;

function ym(...args) {
  if (!import.meta.env.PROD) return;
  try {
    if (typeof window.ym === 'function') window.ym(METRIKA_ID, ...args);
  } catch {
    // блокировщик или сбой счётчика — игнор
  }
}

export const trackHit = (url = window.location.href, title = document.title) =>
  ym('hit', url, { title });

export const trackGoal = (name, params) => ym('reachGoal', name, params);
