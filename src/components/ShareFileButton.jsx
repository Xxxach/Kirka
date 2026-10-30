import { useEffect, useRef, useState } from 'react';
import { trackGoal } from '../analytics';

const MIME_BY_EXT = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  ico: 'image/x-icon',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  zip: 'application/zip',
};

const BUTTON =
  'inline-flex items-center gap-1.5 rounded-2xl border border-slate-300 bg-white/70 px-5 py-2 text-sm text-slate-700 transition-colors hover:bg-white disabled:opacity-50';

function toPng(blob) {
  if (blob.type === 'image/png') return Promise.resolve(blob);
  return createImageBitmap(blob).then(
    (bitmap) =>
      new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        canvas.getContext('2d').drawImage(bitmap, 0, 0);
        canvas.toBlob((png) => (png ? resolve(png) : reject(new Error('png'))), 'image/png');
      }),
  );
}

export function ShareFileButton({ url, filename, source }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const timer = useRef(0);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const canCopyImage =
    typeof window !== 'undefined' && typeof window.ClipboardItem === 'function' && Boolean(navigator.clipboard?.write);
  const isImage = /\.(png|jpe?g|webp)$/i.test(filename);

  useEffect(() => {
    if (!url) return undefined;
    let cancelled = false;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        if (cancelled) return;
        const ext = filename.split('.').pop().toLowerCase();
        const type = blob.type && blob.type !== 'application/octet-stream' ? blob.type : MIME_BY_EXT[ext] || blob.type;
        setFile(new File([blob], filename, { type }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      setFile(null);
    };
  }, [url, filename]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const flash = (message) => {
    setNote(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNote(''), 2600);
  };

  const link = `${window.location.origin}${window.location.pathname}?utm_source=share`;

  const share = async () => {
    if (!file) return;
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename, text: 'Обработано в Kirka' });
        trackGoal('result_shared', { method: 'file', source });
      } else {
        await navigator.share({ title: 'Kirka', text: 'Обрабатываю файлы и фото бесплатно в Kirka', url: link });
        trackGoal('result_shared', { method: 'link', source });
      }
    } catch (error) {
      if (error?.name !== 'AbortError') flash('Не получилось поделиться, скачайте файл');
    }
  };

  const copyImage = async () => {
    if (!file) return;
    try {
      const png = await toPng(file);
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': png })]);
      flash('Фото скопировано, вставьте его в чат');
      trackGoal('result_shared', { method: 'copy_image', source });
    } catch {
      flash('Не удалось скопировать, скачайте файл');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      flash('Ссылка на сервис скопирована');
      trackGoal('result_shared', { method: 'copy_link', source });
    } catch {
      flash('Не удалось скопировать ссылку');
    }
  };

  if (canShare) {
    return (
      <>
        <button type="button" className={BUTTON} onClick={share} disabled={!file}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 10V2M5 4.5L8 1.5l3 3M3 8v5.5h10V8" />
          </svg>
          Поделиться
        </button>
        <span className="text-xs text-[#7A2432]" aria-live="polite">
          {note}
        </span>
      </>
    );
  }

  return (
    <>
      {canCopyImage && isImage && (
        <button type="button" className={BUTTON} onClick={copyImage} disabled={!file}>
          Копировать фото
        </button>
      )}
      <button type="button" className={BUTTON} onClick={copyLink}>
        Копировать ссылку
      </button>
      <span className="text-xs text-[#7A2432]" aria-live="polite">
        {note}
      </span>
    </>
  );
}
