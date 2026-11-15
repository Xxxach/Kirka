import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { categories, foods, foodById, norm, portionNutrition } from '../data/calories';
import { FoodIcon } from '../components/FoodIcon';

const round = (value) => Math.round(value);
const SERIF = { fontFamily: "Georgia, 'Times New Roman', serif" };
const per100 = (item) => (item.unit === 'мл' ? '100 мл' : '100 г');

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13.2 13.2 3.8 3.8" />
    </svg>
  );
}

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
      className="fixed inset-0 z-100 flex items-end justify-center bg-slate-900/45 p-3 sm:items-center sm:p-6"
      style={{ animation: 'kirka-select-fade 180ms ease-out' }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Сколько: ${item.name}`}
        className="glass-bar [--glass-a:0.35] w-full max-w-md rounded-3xl p-5"
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center text-5xl leading-none">
            <FoodIcon icon={item.emoji} />
          </span>
          <div className="min-w-0">
            <div className="text-xl font-semibold leading-tight text-slate-800">{item.name}</div>
            <div className="text-sm text-slate-500">
              {item.kcal} ккал на {per100(item)}
            </div>
          </div>
        </div>
        <ul className="flex flex-col">
          {item.portions.map((portion, index) => (
            <li key={portion.label} className="border-t border-slate-200/60">
              <button
                ref={index === 0 ? firstRef : null}
                type="button"
                onClick={() => onPick(index)}
                className="group -mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7A2432]/40"
              >
                <span className="min-w-0">
                  <span className="block text-lg font-medium leading-tight text-slate-800">{portion.label}</span>
                  <span className="block text-sm text-slate-500">
                    {portion.grams} {item.unit}
                  </span>
                </span>
                <span className="whitespace-nowrap text-lg font-semibold text-[#7A2432]" style={SERIF}>
                  ≈ {round(portionNutrition(item, portion.grams).kcal)} ккал
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-full py-2.5 text-base font-medium text-slate-500 transition-colors hover:text-[#7A2432]"
        >
          Отмена
        </button>
      </div>
    </div>,
    document.body,
  );
}

function FoodRow({ item, onPick }) {
  return (
    <li className="border-b border-slate-200/60">
      <button
        type="button"
        onClick={() => onPick(item)}
        className="group -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7A2432]/40"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center text-[30px] leading-none">
          <FoodIcon icon={item.emoji} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-medium leading-tight text-slate-800">{item.name}</span>
          <span className="block text-sm text-slate-500">
            {item.kcal} ккал · {per100(item)}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#7A2432]/25 text-xl leading-none text-[#7A2432] transition-colors group-hover:bg-[#7A2432] group-hover:text-white"
        >
          +
        </span>
      </button>
    </li>
  );
}

function Stepper({ count, onMinus, onPlus }) {
  const btn =
    'flex h-9 w-9 items-center justify-center text-xl leading-none text-slate-700 transition-colors hover:text-[#7A2432]';
  return (
    <div className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white/70">
      <button type="button" aria-label="Меньше" onClick={onMinus} className={btn}>
        −
      </button>
      <span className="min-w-7 text-center text-base font-semibold tabular-nums text-slate-800" aria-live="polite">
        {count}
      </span>
      <button type="button" aria-label="Больше" onClick={onPlus} className={btn}>
        +
      </button>
    </div>
  );
}

export function ChislaPage() {
  const [category, setCategory] = useState('hot');
  const [sub, setSub] = useState('all');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(null);
  const [plate, setPlate] = useState([]);
  const [notice, setNotice] = useState('');
  const plateRef = useRef(null);

  const closeDialog = useCallback(() => setPicked(null), []);

  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(id);
  }, [notice]);

  const currentCategory = categories.find((entry) => entry.id === category);

  const groups = useMemo(() => {
    const q = norm(query);
    if (q) {
      return [{ id: 'found', label: '', items: foods.filter((item) => norm(`${item.name} ${item.alias}`).includes(q)) }];
    }
    if (category === 'hot') return [{ id: 'hot', label: '', items: foods.filter((item) => item.hot) }];
    const inCategory = foods.filter((item) => item.cat === category);
    const subs = currentCategory?.subs || [];
    if (sub !== 'all') {
      return [{ id: sub, label: '', items: inCategory.filter((item) => item.sub === sub).sort((a, b) => a.order - b.order) }];
    }
    return subs
      .map((entry) => ({
        id: entry.id,
        label: entry.label,
        items: inCategory.filter((item) => item.sub === entry.id).sort((a, b) => a.order - b.order),
      }))
      .filter((group) => group.items.length > 0);
  }, [category, sub, query, currentCategory]);

  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  const reveal = (event) =>
    event.currentTarget.scrollIntoView?.({ inline: 'center', block: 'nearest', behavior: 'smooth' });

  const chooseCategory = (event, id) => {
    setCategory(id);
    setSub('all');
    reveal(event);
  };

  const chooseSub = (event, id) => {
    setSub(id);
    reveal(event);
  };

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

  const macroKcal = totals.p * 4 + totals.f * 9 + totals.c * 4;
  const share = (value) => (macroKcal > 0 ? (value / macroKcal) * 100 : 0);
  const macros = [
    { key: 'p', label: 'Белки', grams: totals.p, width: share(totals.p * 4), dot: 'bg-[#7A2432]' },
    { key: 'f', label: 'Жиры', grams: totals.f, width: share(totals.f * 9), dot: 'bg-slate-400' },
    { key: 'c', label: 'Углеводы', grams: totals.c, width: share(totals.c * 4), dot: 'bg-slate-200' },
  ];

  const scrollToPlate = () => plateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const catClass = (active) =>
    `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[15px] font-medium transition-colors duration-200 ${
      active ? 'gel bg-[#7A2432] text-white' : 'text-slate-600 hover:bg-white/60'
    }`;
  const subClass = (active) =>
    `shrink-0 whitespace-nowrap border-b-2 px-0.5 pb-1 text-[15px] transition-colors ${
      active
        ? 'border-[#7A2432] font-semibold text-[#7A2432]'
        : 'border-transparent text-slate-500 hover:text-slate-800'
    }`;

  return (
    <main className={`page-shell flex flex-col gap-5 py-1 ${rows.length > 0 ? 'pb-24 lg:pb-1' : ''}`}>
      <div className="flex flex-col gap-3">
        <div className="inline-flex w-fit rounded-full bg-slate-200/50 p-1">
          <button
            type="button"
            aria-pressed="true"
            className="gel rounded-full bg-[#7A2432] px-5 py-1.5 text-[15px] font-semibold text-white"
          >
            Калории
          </button>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-full px-5 py-1.5 text-[15px] text-slate-400"
          >
            Учёба — скоро
          </button>
        </div>
        <p className="max-w-2xl text-base text-slate-600">
          Выбери продукт, потом сколько, и всё посчитается само. Граммы знать не нужно.
        </p>
      </div>

      <div role="status" className="sr-only">
        {notice}
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="glass-bar flex min-w-0 flex-col gap-4 rounded-3xl p-4 sm:p-5">
          <label className="relative block">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Найти: масло, сникерс, борщ…"
              aria-label="Поиск продукта"
              className="h-12 w-full rounded-full border border-slate-200 bg-white/70 pl-11 pr-4 text-lg outline-none transition-colors placeholder:text-slate-400 focus:border-[#7A2432]/50"
            />
          </label>

          {!query && (
            <div className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-sm:-mx-4 max-sm:px-4 max-sm:[mask-image:linear-gradient(to_right,transparent,#000_1rem,#000_calc(100%_-_2.5rem),transparent)] sm:flex-wrap sm:overflow-visible sm:pb-0">
              {categories.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={category === entry.id}
                  onClick={(event) => chooseCategory(event, entry.id)}
                  className={catClass(category === entry.id)}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          )}

          {!query && currentCategory?.subs && (
            <div className="flex gap-x-5 gap-y-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-sm:-mx-4 max-sm:px-4 max-sm:[mask-image:linear-gradient(to_right,transparent,#000_1rem,#000_calc(100%_-_2.5rem),transparent)] sm:flex-wrap sm:overflow-visible sm:pb-0" aria-label="Подкатегории">
              <button type="button" aria-pressed={sub === 'all'} onClick={(event) => chooseSub(event, 'all')} className={subClass(sub === 'all')}>
                Все
              </button>
              {currentCategory.subs.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={sub === entry.id}
                  onClick={(event) => chooseSub(event, entry.id)}
                  className={subClass(sub === entry.id)}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          )}

          {total === 0 ? (
            <p className="py-6 text-center text-base text-slate-500">
              Такого пока нет в списке. Скоро ИИ сможет посчитать любое блюдо.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {groups.map((group) => (
                <div key={group.id}>
                  {group.label && (
                    <h3 className="mb-1 mt-3 flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {group.label}
                      <span className="font-normal normal-case tracking-normal">{group.items.length}</span>
                    </h3>
                  )}
                  <ul className="grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {group.items.map((item) => (
                      <FoodRow key={item.id} item={item} onPick={setPicked} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <div ref={plateRef} className="scroll-mt-32 lg:sticky lg:top-32">
          <aside className="glass-bar flex flex-col gap-4 rounded-3xl p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-semibold text-slate-800">Моя тарелка</h2>
              {rows.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPlate([])}
                  className="rounded-full px-3 py-1 text-sm font-medium text-slate-500 transition-colors hover:text-[#7A2432]"
                >
                  Очистить
                </button>
              )}
            </div>

            {rows.length === 0 ? (
              <p className="text-base text-slate-500">Пока пусто. Выбери продукт и порцию, он появится здесь.</p>
            ) : (
              <ul className="flex flex-col">
                {rows.map(({ row, item, portion, nutrition }) => (
                  <li
                    key={`${row.foodId}-${row.index}`}
                    className="flex flex-col gap-2 border-t border-slate-200/60 py-3 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center text-2xl leading-none">
                          <FoodIcon icon={item.emoji} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-base font-medium leading-tight text-slate-800">{item.name}</div>
                          <div className="text-sm text-slate-500">
                            {portion.label}, {portion.grams} {item.unit}
                          </div>
                        </div>
                      </div>
                      <div className="whitespace-nowrap text-lg font-semibold text-slate-800" style={SERIF}>
                        ≈ {round(nutrition.kcal)}
                      </div>
                    </div>
                    <Stepper count={row.count} onMinus={() => changeCount(row, -1)} onPlus={() => changeCount(row, 1)} />
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-slate-200/60 pt-4">
              <div className="text-sm font-medium text-slate-500">Всего</div>
              <div className="flex items-baseline gap-2 text-[#7A2432]" style={SERIF}>
                <span className="text-6xl font-semibold leading-none tabular-nums">≈ {round(totals.kcal)}</span>
                <span className="text-xl">ккал</span>
              </div>

              <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-slate-200/50" aria-hidden="true">
                {macros.map((entry) => (
                  <div key={entry.key} className={entry.dot} style={{ width: `${entry.width}%` }} />
                ))}
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                {macros.map((entry) => (
                  <div key={entry.key}>
                    <dt className="flex items-center gap-1.5 text-slate-500">
                      <span className={`h-2 w-2 rounded-full ${entry.dot}`} aria-hidden="true" />
                      {entry.label}
                    </dt>
                    <dd className="text-base font-semibold text-slate-800">{round(entry.grams)} г</dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="text-sm text-slate-400">
              Значения примерные: порции и состав продуктов бывают разными. Это не медицинская рекомендация.
            </p>
          </aside>
        </div>
      </div>

      {rows.length > 0 && (
        <div
          className="fixed inset-x-3 z-40 lg:hidden"
          style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="glass-bar [--glass-a:0.3] flex items-center justify-between gap-3 rounded-full py-2 pl-5 pr-2">
            <div className="min-w-0">
              <div className="truncate text-xs text-slate-500">{notice || `Тарелка: ${rows.length}`}</div>
              <div className="text-[#7A2432]" style={SERIF}>
                <span className="text-2xl font-semibold tabular-nums">≈ {round(totals.kcal)}</span>
                <span className="ml-1 text-base">ккал</span>
              </div>
            </div>
            <button
              type="button"
              onClick={scrollToPlate}
              className="gel shrink-0 rounded-full bg-[#7A2432] px-5 py-2.5 text-[15px] font-semibold text-white"
            >
              Открыть
            </button>
          </div>
        </div>
      )}

      {picked && <PortionDialog item={picked} onPick={(index) => addToPlate(picked, index)} onClose={closeDialog} />}
    </main>
  );
}
