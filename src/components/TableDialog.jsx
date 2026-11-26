import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TableScene } from './TableScene';
import { composeTable, SCENE_W } from '../data/tableLayout';
import { trackGoal } from '../analytics';

const BUTTON =
  'rounded-full border border-white/70 bg-slate-200/65 px-4 h-10 text-sm font-medium text-slate-700 transition-[transform,background-color] duration-300 hover:bg-white/80 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

// SVG-сцена в PNG: сериализуем живой <svg> и рисуем его на canvas (data-URL, чтобы Safari не «пачкал» canvas).
async function sceneToPng(svg, height) {
  if (document.fonts?.ready) await document.fonts.ready;
  const clone = svg.cloneNode(true);
  clone.setAttribute('width', String(SCENE_W));
  clone.setAttribute('height', String(height));
  const xml = new XMLSerializer().serializeToString(clone);
  const image = new Image();
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  });
  const canvas = document.createElement('canvas');
  canvas.width = SCENE_W;
  canvas.height = height;
  canvas.getContext('2d').drawImage(image, 0, 0, SCENE_W, height);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('png'))), 'image/png'));
}

// «Посмотреть стол» и «Поделиться» в одном окне: смотришь картинку и сразу отправляешь её.
export function TableDialog({ open, onClose, entries, totals, path }) {
  const svgRef = useRef(null);
  const [dark] = useState(() => document.documentElement.classList.contains('dark-theme'));
  const [png, setPng] = useState(null);
  const [failed, setFailed] = useState(false);
  const [shown, setShown] = useState(false);
  const [note, setNote] = useState('');
  const noteTimer = useRef(0);
  const closeTimer = useRef(0);

  const height = useMemo(() => composeTable(entries).layout.height, [entries]);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    let url = '';
    const id = setTimeout(() => {
      if (!svgRef.current) return;
      sceneToPng(svgRef.current, height)
        .then((blob) => {
          if (cancelled) return;
          url = URL.createObjectURL(blob);
          setPng({ blob, url });
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        });
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(id);
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, entries, totals, height]);

  useEffect(() => {
    if (!open) return undefined;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    return () => {
      cancelAnimationFrame(id);
      setShown(false);
    };
  }, [open]);

  useEffect(
    () => () => {
      clearTimeout(noteTimer.current);
      clearTimeout(closeTimer.current);
    },
    [],
  );

  const requestClose = useCallback(() => {
    setShown(false);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(onClose, 220);
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, requestClose]);

  if (!open) return null;

  const url = `${window.location.origin}${path}?utm_source=share`;
  const canShare = typeof navigator.share === 'function';
  const canCopyImage = typeof window.ClipboardItem === 'function' && Boolean(navigator.clipboard?.write);

  const flash = (message) => {
    setNote(message);
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(''), 2200);
  };

  const share = async () => {
    if (!png) return;
    const file = new File([png.blob], 'kirka-stol.png', { type: 'image/png' });
    const data = { title: 'Мой стол', text: `Мой стол в Kirka: ≈ ${Math.round(totals.kcal)} ккал`, url };
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ ...data, files: [file] });
      else await navigator.share(data);
      trackGoal('result_shared', { method: 'share', source: 'table' });
    } catch (error) {
      if (error?.name !== 'AbortError') flash('Не получилось отправить, попробуйте скачать');
    }
  };

  const download = () => {
    if (!png) return;
    const link = document.createElement('a');
    link.href = png.url;
    link.download = 'kirka-stol.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    trackGoal('result_shared', { method: 'download', source: 'table' });
  };

  const copyImage = async () => {
    if (!png) return;
    try {
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': png.blob })]);
      flash('Картинка скопирована, вставьте её в чат');
      trackGoal('result_shared', { method: 'copy_image', source: 'table' });
    } catch {
      flash('Не удалось скопировать картинку, попробуйте скачать');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      flash('Ссылка скопирована');
      trackGoal('result_shared', { method: 'copy_link', source: 'table' });
    } catch {
      flash('Не удалось скопировать ссылку');
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${shown ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Мой стол"
        className={`flex w-full sm:max-w-md max-h-[94vh] flex-col gap-3 overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
      >
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className="text-base font-semibold text-slate-800">Мой стол</h2>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200/70"
            onClick={requestClose}
            aria-label="Закрыть"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="mx-auto" style={{ width: `min(100%, calc(56vh * ${SCENE_W / height}))`, aspectRatio: `${SCENE_W} / ${height}` }}>
            <TableScene entries={entries} totals={totals} innerRef={svgRef} dark={dark} />
          </div>
        </div>

        <button
          type="button"
          className="gel w-full rounded-full bg-[#7A2432] px-6 py-3 text-white shadow-sm transition-colors hover:bg-[#5c1c28] disabled:opacity-50"
          onClick={canShare ? share : download}
          disabled={!png}
        >
          {failed ? 'Не получилось собрать картинку' : canShare ? 'Поделиться столом' : 'Скачать картинку'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          {canShare && (
            <button type="button" className={BUTTON} onClick={download} disabled={!png}>
              Скачать картинку
            </button>
          )}
          {canCopyImage && (
            <button type="button" className={BUTTON} onClick={copyImage} disabled={!png}>
              Копировать картинку
            </button>
          )}
          <button type="button" className={BUTTON} onClick={copyLink}>
            Копировать ссылку
          </button>
        </div>

        <p className="min-h-4 px-1 text-center text-xs text-[#7A2432]" aria-live="polite">
          {note}
        </p>
      </div>
    </div>,
    document.body,
  );
}
