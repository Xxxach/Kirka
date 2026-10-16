import { useEffect, useState } from 'react';
import { isBackendDown } from '../api';

// Плашка сверху, если сервер не отвечает (ни основной, ни запасной адрес).
export function StatusBanner() {
  const [down, setDown] = useState(false);

  useEffect(() => {
    let cancelled = false;
    isBackendDown('text').then((d) => {
      if (!cancelled) setDown(d);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!down) return null;
  return (
    <div
      role="status"
      className="mx-3 mt-3 rounded-2xl border border-amber-300/70 bg-amber-50/90 px-4 py-3 text-sm text-amber-800 shadow-sm backdrop-blur"
    >
      Сервер временно недоступен из-за сбоя у хостинг-провайдера: генерация
      текстов, перевод кода, обработка фото и файлов могут не работать. Мы уже
      восстанавливаем сервис.
    </div>
  );
}
