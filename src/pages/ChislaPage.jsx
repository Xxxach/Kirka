import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { categories, foods, foodById, norm, portionNutrition } from '../data/calories';

const round = (value) => Math.round(value);

function PortionDialog({ item, onPick, onClose }) {
  const firstRef = useRef(null);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-slate-900/45 p-3 sm:p-6"
      style={{ animation: 'kirka-select-fade 180ms ease-out' }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Сколько: ${item.name}`}
        className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="text-5xl leading-none" aria-hidden="true">{item.emoji}</span>
          <div>
            <div className="text-xl font-bold text-slate-800">{item.name}</div>
            <div className="text-base text-slate-500">Сколько?</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {item.portions.map((portion, index) => (
            <button
              key={portion.label}
              ref={index === 0 ? firstRef : null}
              type="button"
              onClick={() => onPick(index)}
              className="flex flex-col gap-0.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition-[transform,border-color] duration-150 hover:border-[#7A2432] active:scale-[0.99] sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <span className="text-lg font-semibold text-slate-800">{portion.label}</span>
              <span className="whitespace-nowrap text-base text-slate-500">
                {portion.grams} {item.unit} · ≈ {round(portionNutrition(item, portion.grams).kcal)} ккал
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-600 hover:border-[#7A2432]"
        >
          Отмена
        </button>
      </div>
    </div>,
    document.body,
  );
}

function StepButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-semibold text-slate-700 transition-[transform,border-color] duration-150 hover:border-[#7A2432] active:scale-90"
    >
      {children}
    </button>
  );
}

export function ChislaPage() {
  const [category, setCategory] = useState('hot');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(null);
  const [plate, setPlate] = useState([]);
  const [notice, setNotice] = useState('');
  const plateRef = useRef(null);

  const closeDialog = useCallback(() => setPicked(null), []);

  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(id);
  }, [notice]);

  const visible = useMemo(() => {
    const q = norm(query);
    if (q) return foods.filter((item) => norm(`${item.name} ${item.alias}`).includes(q));
    if (category === 'hot') return foods.filter((item) => item.hot);
    return foods.filter((item) => item.cat === category);
  }, [category, query]);

  const addToPlate = (item, index) => {
    setPlate((prev) => {
      const found = prev.find((row) => row.foodId === item.id && row.index === index);
      if (found) {
        return prev.map((row) => (row === found ? { ...row, count: row.count + 1 } : row));
      }
      return [...prev, { foodId: item.id, index, count: 1 }];
    });
    setNotice(`Добавлено: ${item.name}, ${item.portions[index].label.toLowerCase()}`);
    setPicked(null);
  };

  const changeCount = (row, delta) => {
    setPlate((prev) =>
      prev
        .map((entry) => (entry === row ? { ...entry, count: entry.count + delta } : entry))
        .filter((entry) => entry.count > 0),
    );
  };

  const rows = plate.map((row) => {
    const item = foodById[row.foodId];
    const portion = item.portions[row.index];
    return { row, item, portion, nutrition: portionNutrition(item, portion.grams, row.count) };
  });

  const totals = rows.reduce(
    (sum, entry) => ({
      kcal: sum.kcal + entry.nutrition.kcal,
      p: sum.p + entry.nutrition.p,
      f: sum.f + entry.nutrition.f,
      c: sum.c + entry.nutrition.c,
    }),
    { kcal: 0, p: 0, f: 0, c: 0 },
  );

  const chipClass = (active) =>
    `rounded-2xl px-4 py-3 text-base font-semibold transition-colors duration-200 ${
      active
        ? 'bg-[#7A2432] text-white'
        : 'border border-slate-200 bg-white text-slate-700 hover:border-[#7A2432]'
    }`;

  return (
    <main className="page-shell flex flex-col gap-6 py-1">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed="true"
            className="rounded-full bg-[#7A2432] px-5 py-2 text-base font-semibold text-white"
          >
            Калории
          </button>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-full border border-slate-200 bg-white px-5 py-2 text-base text-slate-400"
          >
            Учёба — скоро
          </button>
        </div>
        <p className="text-base text-slate-600">
          Выбери продукт, потом сколько, и всё посчитается само. Граммы знать не нужно.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="flex min-w-0 flex-col gap-4">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти: масло, сникерс, борщ…"
            aria-label="Поиск продукта"
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg shadow-sm"
          />

          {!query && (
            <div className="flex flex-wrap gap-2">
              {categories.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={category === entry.id}
                  onClick={() => setCategory(entry.id)}
                  className={chipClass(category === entry.id)}
                >
                  <span aria-hidden="true">{entry.emoji} </span>
                  {entry.label}
                </button>
              ))}
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#7A2432]/15 bg-[#7A2432]/5 px-4 py-3 text-base font-semibold text-[#7A2432]"
            >
              <span>✓ {notice}</span>
              <button
                type="button"
                onClick={() => plateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="rounded-full border border-[#7A2432]/30 px-3 py-1 text-sm font-semibold"
              >
                Показать тарелку
              </button>
            </div>
          )}

          {visible.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-4 text-base text-slate-600">
              Такого пока нет в списке. Скоро ИИ сможет посчитать любое блюдо.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPicked(item)}
                  className="flex min-h-28 flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm transition-[transform,border-color] duration-200 hover:border-[#7A2432] active:scale-95"
                >
                  <span className="text-4xl leading-none" aria-hidden="true">{item.emoji}</span>
                  <span className="text-base font-semibold text-slate-800">{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside
          ref={plateRef}
          className="flex scroll-mt-32 flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-32"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-800">Моя тарелка</h2>
            {rows.length > 0 && (
              <button
                type="button"
                onClick={() => setPlate([])}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 hover:border-[#7A2432]"
              >
                Очистить
              </button>
            )}
          </div>

          {rows.length === 0 ? (
            <p className="text-base text-slate-600">
              Пока пусто. Выбери продукт и порцию, он появится здесь.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {rows.map(({ row, item, portion, nutrition }) => (
                <li
                  key={`${row.foodId}-${row.index}`}
                  className="flex flex-col gap-2 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-slate-800">
                        <span aria-hidden="true">{item.emoji} </span>
                        {item.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {portion.label}, {portion.grams} {item.unit}
                      </div>
                    </div>
                    <div className="whitespace-nowrap text-lg font-bold text-slate-800">
                      ≈ {round(nutrition.kcal)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StepButton label="Меньше" onClick={() => changeCount(row, -1)}>−</StepButton>
                    <span className="min-w-6 text-center text-lg font-semibold text-slate-800" aria-live="polite">
                      {row.count}
                    </span>
                    <StepButton label="Больше" onClick={() => changeCount(row, 1)}>+</StepButton>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="rounded-2xl border border-[#7A2432]/15 bg-[#7A2432]/5 p-4">
            <div className="text-base font-semibold text-slate-600">Всего</div>
            <div className="flex items-baseline gap-2 text-[#7A2432]">
              <span className="text-5xl font-extrabold leading-none">≈ {round(totals.kcal)}</span>
              <span className="text-xl font-bold">ккал</span>
            </div>
            <div className="mt-2 text-base text-slate-700">
              Белки {round(totals.p)} г · Жиры {round(totals.f)} г · Углеводы {round(totals.c)} г
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Значения примерные: порции и состав продуктов бывают разными. Это не медицинская
            рекомендация.
          </p>
        </aside>
      </div>

      {picked && <PortionDialog item={picked} onPick={(index) => addToPlate(picked, index)} onClose={closeDialog} />}
    </main>
  );
}
