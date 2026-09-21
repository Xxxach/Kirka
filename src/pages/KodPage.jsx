import { useState } from 'react';
import { ThemedSelect as Select } from '../components/ThemedSelect';

const langOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python' },
  { value: 'j', label: 'Java' },
  { value: 'cs', label: 'C#' },
];

const tierOptions = [
  { value: 'basic', label: 'Упрощённая' },
  { value: 'pro', label: 'Улучшенная' },
];

const fillStyles = {
  idle: { clipPath: 'inset(0 100% 0 0)', transition: 'none' },
  loading: {
    clipPath: 'inset(0 15% 0 0)',
    transition: 'clip-path 2.5s ease-out',
  },
  done: {
    clipPath: 'inset(0 0% 0 0)',
    transition: 'clip-path 0.3s ease-out',
  },
};

export function KodPage() {
  const [kodForm, setKodForm] = useState({
    lang: langOptions[0],
    relang: langOptions[4],
    tier: tierOptions[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');

  const [fillState, setFillState] = useState('idle');

  const handleGenerate = async () => {
    if (!code.trim()) {
      setError('Сначала вставь код для перевода');
      return;
    }

    setLoading(true);
    setError('');
    setFillState('loading');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/convert-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          targetLang: kodForm.relang.label,
          tier: kodForm.tier.value,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Не удалось перевести код');

      setFillState('done');
      await new Promise((r) => setTimeout(r, 300));
      setResult(data.result);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
      setFillState('idle');
    }
  };

  const handleLangChange = (selectedOption) => {
    setKodForm((prev) => ({ ...prev, lang: selectedOption }));
  };

  const handleRelangChange = (selectedOption) => {
    setKodForm((prev) => ({ ...prev, relang: selectedOption }));
  };

  const handleTierChange = (selectedOption) => {
    setKodForm((prev) => ({ ...prev, tier: selectedOption }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 px-5 py-1 gap-5">
      <div className="flex flex-col col-span-2 gap-3">
        <Select
          className="w-50"
          options={langOptions}
          value={kodForm.lang}
          onChange={handleLangChange}
          placeholder="Выбери язык"
        />
        <textarea
          className="p-4 border border-slate-200 outline-none focus:border-[#7A2432]/50 focus:ring-1 focus:ring-[#7A2432]/30 bg-white h-50 md:h-80 rounded-2xl shadow-sm w-full resize-none placeholder:text-slate-400"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Сюда код"
        />
      </div>
      <div className="flex flex-col justify-center gap-6 md:gap-2">
        <Select
          className="w-full"
          options={tierOptions}
          value={kodForm.tier}
          onChange={handleTierChange}
          placeholder="Модель"
        />
        {error && (
          <p className="text-rose-900 text-center px-1 text-sm">{error}</p>
        )}
        <div className="flex md:flex-col justify-center gap-3">
          <div
            style={{ position: 'relative' }}
            className="self-center w-20 h-10 rotate-90 md:rotate-0 transition-transform duration-300"
          >
            <svg
              viewBox="0 0 24 24"
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            >
              <path
                d="M4 12h13M13 6l6 6-6 6"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              viewBox="0 0 24 24"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                ...fillStyles[fillState],
              }}
            >
              <path
                d="M4 12h13M13 6l6 6-6 6"
                fill="none"
                stroke="#7A2432"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <button
            className="bg-[#7A2432] hover:bg-[#5c1c28] rounded-full text-white px-10 py-1 md:px-12 md:py-3 shadow-sm transition-colors disabled:opacity-50"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Выполняю...' : 'Выполнить'}
          </button>
        </div>
      </div>
      <div className="flex md:items-end flex-col col-span-2 gap-3">
        <Select
          className="w-50"
          options={langOptions}
          value={kodForm.relang}
          onChange={handleRelangChange}
          placeholder="Выбери язык"
        />
        <textarea
          className="p-4 border border-slate-200 outline-none focus:border-[#7A2432]/50 focus:ring-1 focus:ring-[#7A2432]/30 bg-white h-50 md:h-80 rounded-2xl shadow-sm w-full resize-none placeholder:text-slate-400"
          value={result}
          readOnly
          placeholder="Здесь получишь свой же код на другом языке быстро.."
        />
      </div>
    </div>
  );
}
