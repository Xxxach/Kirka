import { useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'kirka-cookie-notice-v1';

function wasDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function CookieNotice() {
  const [visible, setVisible] = useState(() => !wasDismissed());

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // хранилище недоступно — просто скрываем до перезагрузки
    }
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl flex-col gap-3 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.25)] backdrop-blur sm:flex-row sm:items-center">
      <p className="flex-1 text-xs leading-relaxed text-slate-600">
        Мы используем Яндекс.Метрику, чтобы понимать, как люди пользуются
        сайтом: она сохраняет файлы cookie и собирает обезличенную статистику
        посещений. Продолжая пользоваться сайтом, вы соглашаетесь с этим.{' '}
        <Link to="/privacy" className="underline hover:text-slate-800">
          Подробнее
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-xl bg-slate-800 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-700"
      >
        Понятно
      </button>
    </div>
  );
}
