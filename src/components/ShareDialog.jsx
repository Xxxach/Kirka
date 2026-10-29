import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { trackGoal } from '../analytics';

const CARD_W = 1080;
const MARGIN = 48;
const PAD = 56;
const FONT_SIZE = 36;
const LINE_HEIGHT = 54;
const MAX_LINES = 24;
const HEADER_H = 128;
const TOP_GAP = 56;
const BOTTOM_GAP = 44;
const FOOT_H = 140;
const BRAND = '#7A2432';
const SERIF = 'Georgia, "DejaVu Serif", "Times New Roman", serif';

const BUTTON =
  'rounded-full border border-white/70 bg-slate-200/65 px-4 h-10 text-sm font-medium text-slate-700 transition-[transform,background-color] duration-300 hover:bg-white/80 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

function wrapParagraph(ctx, paragraph, maxWidth) {
  const words = paragraph.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const lines = [];
  let current = '';
  const flush = () => {
    if (current) lines.push(current);
    current = '';
  };
  for (const word of words) {
    let rest = word;
    while (ctx.measureText(rest).width > maxWidth) {
      let cut = rest.length - 1;
      while (cut > 1 && ctx.measureText(rest.slice(0, cut)).width > maxWidth) cut -= 1;
      flush();
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    const candidate = current ? `${current} ${rest}` : rest;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      flush();
      current = rest;
    }
  }
  flush();
  return lines;
}

function wrapText(ctx, text, maxWidth) {
  const raw = text.replace(/\r/g, '').split('\n').flatMap((p) => wrapParagraph(ctx, p, maxWidth));
  const lines = [];
  raw.forEach((line) => {
    if (line === '' && (lines.length === 0 || lines[lines.length - 1] === '')) return;
    lines.push(line);
  });
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

async function renderCard(text, label) {
  if (document.fonts?.ready) await document.fonts.ready;
  const family = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif';
  const textWidth = CARD_W - MARGIN * 2 - PAD * 2;

  const probe = document.createElement('canvas').getContext('2d');
  probe.font = `400 ${FONT_SIZE}px ${family}`;
  let lines = wrapText(probe, text.trim(), textWidth);
  let truncated = false;
  if (lines.length > MAX_LINES) {
    truncated = true;
    lines = lines.slice(0, MAX_LINES);
    let last = lines[MAX_LINES - 1].replace(/[\s.,;:!?-]+$/, '');
    while (last.length > 1 && probe.measureText(`${last}…`).width > textWidth) last = last.slice(0, -1);
    lines[MAX_LINES - 1] = `${last}…`;
  }

  const cardW = CARD_W - MARGIN * 2;
  const cardH = HEADER_H + TOP_GAP + lines.length * LINE_HEIGHT + BOTTOM_GAP + FOOT_H;
  const height = Math.round(cardH + MARGIN * 2);
  const cardTop = MARGIN;
  const cardRight = CARD_W - MARGIN;
  const left = MARGIN + PAD;

  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, '#eef1f6');
  background.addColorStop(1, '#f8f9fc');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, CARD_W, height);

  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.16)';
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#ffffff';
  roundedRect(ctx, MARGIN, cardTop, cardW, cardH, 44);
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundedRect(ctx, MARGIN, cardTop, cardW, cardH, 44);
  ctx.clip();
  const header = ctx.createLinearGradient(MARGIN, 0, cardRight, 0);
  header.addColorStop(0, BRAND);
  header.addColorStop(1, '#5c1c28');
  ctx.fillStyle = header;
  ctx.fillRect(MARGIN, cardTop, cardW, HEADER_H);
  ctx.font = `700 680px ${SERIF}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(122, 36, 50, 0.05)';
  ctx.fillText('K', cardRight + 30, cardTop + cardH + 120);
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `600 72px ${SERIF}`;
  ctx.fillStyle = '#ffffff';
  const markBase = cardTop + 86;
  ctx.fillText('Kirka', left, markBase);
  const markW = ctx.measureText('Kirka').width;
  ctx.fillRect(left + 2, markBase + 14, markW * 0.45, 5);

  ctx.font = `600 26px ${family}`;
  const chipH = 52;
  const chipMax = textWidth - markW - 32;
  const chipW = Math.min(ctx.measureText(label).width + 48, chipMax);
  const chipX = cardRight - PAD - chipW;
  const chipY = cardTop + (HEADER_H - chipH) / 2;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  roundedRect(ctx, chipX, chipY, chipW, chipH, chipH / 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, chipX + 24, chipY + chipH / 2 + 1, chipW - 48);

  const bodyTop = cardTop + HEADER_H + TOP_GAP;
  ctx.font = `400 ${FONT_SIZE}px ${family}`;
  ctx.fillStyle = '#1e293b';
  ctx.textBaseline = 'alphabetic';
  lines.forEach((line, index) => {
    ctx.fillText(line, left, bodyTop + FONT_SIZE + index * LINE_HEIGHT - 8);
  });

  const dividerY = bodyTop + lines.length * LINE_HEIGHT + BOTTOM_GAP;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(left, dividerY, textWidth, 2);

  const footY = dividerY + 32;
  const iconSize = 64;
  ctx.fillStyle = BRAND;
  roundedRect(ctx, left, footY, iconSize, iconSize, 15);
  ctx.fill();
  ctx.font = `700 44px ${SERIF}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('K', left + iconSize / 2, footY + 47);

  ctx.textAlign = 'left';
  ctx.font = `700 30px ${family}`;
  ctx.fillStyle = '#1e293b';
  ctx.fillText('ИИ без промптов', left + iconSize + 20, footY + 28);
  ctx.font = `400 24px ${family}`;
  ctx.fillStyle = '#64748b';
  ctx.fillText('Бесплатно, без регистрации', left + iconSize + 20, footY + 58);

  ctx.font = `600 30px ${family}`;
  const pillW = ctx.measureText('kirka-ai.ru').width + 56;
  const pillX = left + textWidth - pillW;
  ctx.fillStyle = BRAND;
  roundedRect(ctx, pillX, footY, pillW, iconSize, iconSize / 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText('kirka-ai.ru', pillX + 28, footY + iconSize / 2 + 1);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('canvas');
  return { blob, truncated };
}

export function ShareDialog({ open, onClose, text, label, path }) {
  const [preview, setPreview] = useState(null);
  const [failed, setFailed] = useState(false);
  const [shown, setShown] = useState(false);
  const [note, setNote] = useState('');
  const noteTimer = useRef(0);
  const closeTimer = useRef(0);
  const key = `${label}\n${text}`;

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    let url = '';
    renderCard(text, label)
      .then(({ blob, truncated }) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setFailed(false);
        setPreview({ key, url, blob, truncated });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, text, label, key]);

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

  const ready = preview && preview.key === key ? preview : null;
  const url = `${window.location.origin}${path}?utm_source=share`;
  const canShare = typeof navigator.share === 'function';
  const canCopyImage = typeof window.ClipboardItem === 'function' && Boolean(navigator.clipboard?.write);

  const flash = (message) => {
    setNote(message);
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(''), 2200);
  };

  const share = async () => {
    if (!ready) return;
    const file = new File([ready.blob], 'kirka.png', { type: 'image/png' });
    const data = { title: label, text: 'Сделано в Kirka: ИИ без промптов', url };
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ ...data, files: [file] });
      } else {
        await navigator.share(data);
      }
      trackGoal('result_shared', { method: 'share' });
    } catch (error) {
      if (error?.name !== 'AbortError') flash('Не получилось отправить, попробуйте скачать');
    }
  };

  const download = () => {
    if (!ready) return;
    const link = document.createElement('a');
    link.href = ready.url;
    link.download = 'kirka.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    trackGoal('result_shared', { method: 'download' });
  };

  const copyImage = async () => {
    if (!ready) return;
    try {
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': ready.blob })]);
      flash('Картинка скопирована, вставьте её в чат');
      trackGoal('result_shared', { method: 'copy_image' });
    } catch {
      flash('Не удалось скопировать картинку, попробуйте скачать');
    }
  };

  const copy = async (value, message, method) => {
    try {
      await navigator.clipboard.writeText(value);
      flash(message);
      trackGoal('result_shared', { method });
    } catch {
      flash('Не удалось скопировать');
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
        aria-label="Поделиться результатом"
        className={`flex w-full sm:max-w-md max-h-[92vh] flex-col gap-3 overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
      >
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className="text-base font-semibold text-slate-800">Поделиться результатом</h2>
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

        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-2">
          {ready ? (
            <img
              src={ready.url}
              alt="Карточка с результатом"
              className="max-h-[46vh] w-auto max-w-full rounded-xl object-contain"
            />
          ) : (
            <p className="text-sm text-slate-400">{failed ? 'Не получилось собрать картинку' : 'Собираю карточку…'}</p>
          )}
        </div>

        {ready?.truncated && (
          <p className="px-1 text-xs text-slate-500">
            Текст длинный, на картинке только начало. Весь текст отдаёт кнопка «Копировать текст».
          </p>
        )}

        <button
          type="button"
          className="gel w-full rounded-full bg-[#7A2432] px-6 py-3 text-white shadow-sm transition-colors hover:bg-[#5c1c28] disabled:opacity-50"
          onClick={canShare ? share : download}
          disabled={!ready}
        >
          {canShare ? 'Поделиться карточкой' : 'Скачать картинку'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          {canShare && (
            <button type="button" className={BUTTON} onClick={download} disabled={!ready}>
              Скачать картинку
            </button>
          )}
          {canCopyImage && (
            <button type="button" className={BUTTON} onClick={copyImage} disabled={!ready}>
              Копировать картинку
            </button>
          )}
          <button
            type="button"
            className={BUTTON}
            onClick={() => copy(text.trim(), 'Текст скопирован', 'copy_text')}
          >
            Копировать текст
          </button>
          <button
            type="button"
            className={BUTTON}
            onClick={() => copy(url, 'Ссылка скопирована', 'copy_link')}
          >
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
