import { getApiBase } from './api';

const MAX_PER_SESSION = 3;
const IGNORED = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i,
  /Non-Error promise rejection/i,
  /Failed to fetch|NetworkError|Load failed|AbortError|aborted|timeout/i,
  /Extension context/i,
];

export function installErrorReporter() {
  if (import.meta.env.DEV || typeof window === 'undefined') return;
  const seen = new Set();
  let sent = 0;

  const report = ({ message, source = '', line = 0, col = 0, stack = '' }) => {
    const text = String(message || '').slice(0, 300);
    if (!text || sent >= MAX_PER_SESSION) return;
    if (IGNORED.some((re) => re.test(text))) return;
    if (source && !source.startsWith(window.location.origin)) return;
    const key = `${text}|${source}|${line}`;
    if (seen.has(key)) return;
    seen.add(key);
    sent += 1;
    getApiBase('text')
      .then((apiUrl) =>
        fetch(`${apiUrl}/api/client-error`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          body: JSON.stringify({
            message: text,
            source,
            line,
            col,
            stack: String(stack || '').slice(0, 700),
            page: window.location.pathname,
            ua: navigator.userAgent.slice(0, 150),
          }),
        }),
      )
      .catch(() => {});
  };

  window.addEventListener('error', (event) => {
    if (event.target && event.target !== window) return;
    report({
      message: event.message,
      source: event.filename,
      line: event.lineno,
      col: event.colno,
      stack: event.error?.stack,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    report({ message: reason?.message || String(reason), stack: reason?.stack });
  });
}
