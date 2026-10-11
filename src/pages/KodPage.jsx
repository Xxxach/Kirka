import { useMemo, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import { trackGoal } from '../analytics';
import { ThemedSelect as Select } from '../components/ThemedSelect';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('csharp', csharp);

// значение из списка языков -> имя языка в highlight.js
const HLJS_LANG = { js: 'javascript', ts: 'typescript', py: 'python', j: 'java', cs: 'csharp' };

const langOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python' },
  { value: 'j', label: 'Java' },
  { value: 'cs', label: 'C#' },
];

// Целевой язык не может быть «Auto»: непонятно, на что переводить.
const targetOptions = langOptions.filter((o) => o.value !== 'auto');

const FILE_EXT = { js: 'js', ts: 'ts', py: 'py', j: 'java', cs: 'cs' };

// Для Java имя файла должно совпадать с именем public-класса, иначе не скомпилируется.
function resultFileName(code, langValue) {
  if (langValue === 'j') {
    const m = code.match(/public\s+(?:final\s+|abstract\s+)*class\s+(\w+)/);
    return `${m ? m[1] : 'Main'}.java`;
  }
  return `kirka-code.${FILE_EXT[langValue] ?? 'txt'}`;
}

const smallBtn =
  'rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 shadow-sm transition-colors hover:bg-slate-50';

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
  const [resultLang, setResultLang] = useState('j'); // язык, на который переводили
  const [copied, setCopied] = useState(false);

  // Подсветка синтаксиса. highlight.js сам экранирует HTML, так что это безопасно.
  const highlighted = useMemo(() => {
    if (!result) return '';
    try {
      const lang = HLJS_LANG[resultLang];
      return (
        lang
          ? hljs.highlight(result, { language: lang, ignoreIllegals: true })
          : hljs.highlightAuto(result)
      ).value;
    } catch {
      return null; // покажем обычным текстом
    }
  }, [result, resultLang]);

  const [fillState, setFillState] = useState('idle');

  const handleGenerate = async () => {
    if (!code.trim()) {
      setError('Сначала вставь код для перевода');
      return;
    }
    if (kodForm.lang.value !== 'auto' && kodForm.lang.value === kodForm.relang.value) {
      setError('Исходный и целевой язык совпадают. Выбери другой язык.');
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
          sourceLang: kodForm.lang.label,
          targetLang: kodForm.relang.label,
          tier: kodForm.tier.value,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Не удалось перевести код');

      trackGoal('code_converted');
      setFillState('done');
      await new Promise((r) => setTimeout(r, 300));
      setResultLang(kodForm.relang.value);
      setResult(data.result);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
      setFillState('idle');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // буфер обмена недоступен — ничего страшного
    }
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = resultFileName(result, resultLang);
    link.click();
    URL.revokeObjectURL(url);
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
          isOptionDisabled={(o) => o.value !== 'auto' && o.value === kodForm.relang.value}
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
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Select
            className="w-50"
            options={targetOptions}
            value={kodForm.relang}
            onChange={handleRelangChange}
            isOptionDisabled={(o) => kodForm.lang.value !== 'auto' && o.value === kodForm.lang.value}
            placeholder="Выбери язык"
          />
          {result && (
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={handleCopy} className={smallBtn}>
                {copied ? 'Скопировано' : 'Копировать'}
              </button>
              <button type="button" onClick={handleDownload} className={smallBtn}>
                Скачать
              </button>
            </div>
          )}
        </div>
        <div className="h-50 md:h-80 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {result ? (
            <pre className="font-mono text-[13px] leading-relaxed">
              {highlighted === null ? (
                <code>{result}</code>
              ) : (
                <code
                  className="hljs"
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              )}
            </pre>
          ) : (
            <p className="text-slate-400">
              Здесь получишь свой же код на другом языке быстро..
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
