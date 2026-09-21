import { useState } from 'react';

export function FeedbackButton({ className = '' }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error

  const close = () => {
    setOpen(false);
    setStatus('idle');
    setMessage('');
  };

  const submit = async () => {
    if (!message.trim()) return;
    setStatus('sending');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, page: window.location.pathname }),
      });
      if (!res.ok) throw new Error();
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`rounded-full border border-white/70 bg-slate-200/65 px-5 py-1.5 text-xs font-medium text-slate-600 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-200 hover:bg-white/70 active:scale-95 select-none ${className}`}
      >
        Обратная связь
      </button>

      {open && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-6"
          onClick={close}
        >
          <div
            className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {status === 'done' ? (
              <>
                <h2 className="text-lg font-semibold text-slate-800 mb-2">
                  Спасибо!
                </h2>
                <p className="text-sm text-slate-500 mb-5">
                  Сообщение получено, обязательно прочитаем.
                </p>
                <button
                  className="w-full bg-[#7A2432] hover:bg-[#5c1c28] rounded-full text-white px-6 py-2.5 transition-colors"
                  onClick={close}
                >
                  Закрыть
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-slate-800 mb-3">
                  Нашли баг или есть идея?
                </h2>
                <textarea
                  autoFocus
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  placeholder="Расскажи, что сломалось или что улучшить..."
                  className="w-full h-32 p-3 border border-slate-200 outline-none focus:border-[#7A2432]/50 focus:ring-1 focus:ring-[#7A2432]/30 rounded-2xl resize-none placeholder:text-slate-400 text-sm mb-3"
                />
                {status === 'error' && (
                  <p className="text-rose-600 text-xs mb-2">
                    Не отправилось, попробуй ещё раз.
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 px-6 py-2.5 transition-colors"
                    onClick={close}
                  >
                    Отмена
                  </button>
                  <button
                    className="flex-1 bg-[#7A2432] hover:bg-[#5c1c28] rounded-full text-white px-6 py-2.5 transition-colors disabled:opacity-50"
                    onClick={submit}
                    disabled={status === 'sending' || !message.trim()}
                  >
                    {status === 'sending' ? 'Отправка...' : 'Отправить'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
