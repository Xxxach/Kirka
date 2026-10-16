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
