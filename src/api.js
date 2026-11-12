// Выбор рабочего адреса бэкенда: основной -> запасной.
// Запасные адреса задаются переменными VITE_API_URL_BACKUP и VITE_PHOTO_API_URL_BACKUP.
// Если запасного нет — работаем только с основным и лишних проверок не делаем.
const CONFIG = {
  text: {
    primary: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    backup: import.meta.env.VITE_API_URL_BACKUP,
  },
  photo: {
    primary: import.meta.env.VITE_PHOTO_API_URL || 'http://localhost:5001',
    backup: import.meta.env.VITE_PHOTO_API_URL_BACKUP,
  },
};

const PROBE_TIMEOUT_MS = 6000; // с запасом на «просыпание» контейнера
const CACHE_MS = 30000;
const cache = { text: null, photo: null };

async function isAlive(base) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}/health`, { signal: ctrl.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// kind: 'text' (тексты, код, фидбэк) или 'photo' (фото и файлы).
export async function getApiBase(kind) {
  const { primary, backup } = CONFIG[kind];
  if (!backup) return primary;
  const hit = cache[kind];
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.base;
  let base = primary;
  if (!(await isAlive(primary)) && (await isAlive(backup))) base = backup;
  cache[kind] = { base, at: Date.now() };
  return base;
}

// true, если не отвечает ни один адрес (для баннера).
export async function isBackendDown(kind = 'text') {
  const { primary, backup } = CONFIG[kind];
  if (await isAlive(primary)) return false;
  if (backup && (await isAlive(backup))) return false;
  return true;
}

export function friendlyError(err) {
  const msg = String(err?.message ?? '');
  if (err instanceof TypeError || /failed to fetch|networkerror|load failed|aborted/i.test(msg)) {
    return 'Сервер временно недоступен из-за сбоя у хостинг-провайдера. Попробуй позже.';
  }
  return msg || 'Что-то пошло не так';
}

const INTRO_LINE = /^(конечно|вот|разумеется|хорошо|держите|ниже)[^\n]{0,100}:\s*$/i;

export function softClean(text, { code = false } = {}) {
  if (code) {
    return text.replace(/^\s*```[\w+#.-]*\r?\n?/, '').replace(/\r?\n?`{1,3}\s*$/, '');
  }
  let out = text
    .replace(/\*\*/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*```[\w-]*\r?\n?/, '');
  const lines = out.split('\n');
  if (lines.length > 1 && INTRO_LINE.test(lines[0].trim())) out = lines.slice(1).join('\n');
  return out.trimStart();
}

export async function fetchAi(url, payload, onText) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(onText ? { ...payload, stream: true } : payload),
  });
  const type = res.headers.get('content-type') || '';
  if (!res.ok || !res.body || !type.includes('text/event-stream')) {
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  let final = null;
  let failure = null;
  let frame = 0;
  const flush = () => {
    frame = 0;
    onText?.(text);
  };
  const handle = (block) => {
    const line = block.split('\n').find((l) => l.startsWith('data:'));
    if (!line) return;
    let event;
    try {
      event = JSON.parse(line.slice(5));
    } catch {
      return;
    }
    if (event.type === 'delta') {
      text += event.text;
      if (!frame) frame = requestAnimationFrame(flush);
    } else if (event.type === 'done') {
      final = event;
    } else if (event.type === 'error') {
      failure = event;
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let at;
      while ((at = buffer.indexOf('\n\n')) >= 0) {
        handle(buffer.slice(0, at));
        buffer = buffer.slice(at + 2);
      }
    }
  } finally {
    if (frame) cancelAnimationFrame(frame);
  }

  if (final) {
    const data = { ...final };
    delete data.type;
    return { ok: true, status: 200, data };
  }
  if (failure) return { ok: false, status: 500, data: { message: failure.message } };
  throw new Error('Соединение прервалось. Попробуй ещё раз.');
}
