// Яндекс.Метрика. Сам счётчик подключён в index.html с defer: true,
// поэтому первый просмотр страницы мы отправляем вручную (см. RouteTracker в App.jsx).
// Аналитика никогда не должна ломать сайт: всё обёрнуто в try/catch,
// а в режиме разработки (npm run dev) ничего не отправляется.
export const METRIKA_ID = 113368493;

function ym(...args) {
  if (!import.meta.env.PROD) return;
  try {
    if (typeof window.ym === 'function') window.ym(METRIKA_ID, ...args);
  } catch {
    // блокировщик или сбой счётчика — молча игнорируем
  }
}

export const trackHit = (url = window.location.href, title = document.title) =>
  ym('hit', url, { title });

// Цели (создать в Метрике: Настройки -> Цели -> JavaScript-событие, идентификатор = имя ниже):
// text_generated, code_converted, photo_processed, file_converted, feedback_sent
export const trackGoal = (name, params) => ym('reachGoal', name, params);
