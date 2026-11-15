import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { categories, foods, foodById, norm, portionNutrition } from '../data/calories';
import { FoodIcon } from '../components/FoodIcon';
import { TilePopover } from '../components/TilePopover';
import { LiquidMenu } from '../components/LiquidMenu';

const round = (value) => Math.round(value);

// Системный шрифт Apple: на iPhone и Mac это настоящий SF Pro, на остальных устройствах ближайший системный.
const FONT = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  letterSpacing: '-0.01em',
};

const DAILY_REFERENCE = 2000;

// Колонки меню категорий на десктопе
const CATEGORY_GROUPS = [
  { label: 'Каждый день', ids: ['hot', 'drinks', 'bread'] },
  { label: 'Основа', ids: ['grains', 'meat', 'dairy'] },
  { label: 'Свежее и добавки', ids: ['fat', 'veg', 'fruit'] },
  { label: 'Готовое и сладкое', ids: ['sweet', 'dish'] },
];

const DESKTOP_QUERY = '(min-width: 768px)';
const subscribeDesktop = (notify) => {
  const mq = window.matchMedia?.(DESKTOP_QUERY);
  mq?.addEventListener?.('change', notify);
  return () => mq?.removeEventListener?.('change', notify);
};
const getDesktop = () => Boolean(window.matchMedia?.(DESKTOP_QUERY).matches);
const per100 = (item) => (item.unit === 'мл' ? '100 мл' : '100 г');

// Цвета колец как в «Активности» на iPhone: видны и на светлой, и на тёмной теме
const RING = {
  p: { color: '#FF375F', label: 'Белки' },
  f: { color: '#FF9F0A', label: 'Жиры' },
  c: { color: '#32ADE6', label: 'Углеводы' },
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13.2 13.2 3.8 3.8" />
    </svg>
  );
}

function StepIcon({ plus }) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d={plus ? 'M4 10h12M10 4v12' : 'M4 10h12'} />
    </svg>
  );
}

function MacroRings({ rows }) {
  const size = 132;
  const mid = size / 2;
  const radii = [58, 44, 30];
  const stroke = 11;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label="Доли белков, жиров и углеводов в калориях"
      className="shrink-0"
    >
      {rows.map((row, index) => {
        const r = radii[index];
        const length = 2 * Math.PI * r;
        const pct = Math.min(100, Math.max(0, row.pct));
        return (
          <g key={row.key} transform={`rotate(-90 ${mid} ${mid})`}>
            <circle cx={mid} cy={mid} r={r} fill="none" stroke="rgba(120,120,128,0.2)" strokeWidth={stroke} />
            {pct > 0.5 && (
              <circle
                cx={mid}
                cy={mid}
                r={r}
                fill="none"
                stroke={RING[row.key].color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${(length * pct) / 100} ${length}`}
                style={{ transition: 'stroke-dasharray 600ms cubic-bezier(0.32, 0.72, 0, 1)' }}
              />
            )}
          </g>
        );
      })}
      <text x={mid} y={mid + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" className="text-slate-500">
        БЖУ
      </text>
    </svg>
  );
}

function PortionList({ item, expanded, close, onChoose }) {
  const firstRef = useRef(null);
  const chosen = useRef(false);

  useEffect(() => {
    if (!expanded || window.matchMedia?.('(pointer: coarse)').matches) return;
    firstRef.current?.focus({ preventScroll: true });
  }, [expanded]);

  const choose = (index) => {
    if (chosen.current) return;
    chosen.current = true;
    onChoose(index);
    close();
  };

  return (
    <>
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
              onClick={() => choose(index)}
              className="group -mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7A2432]/40"
            >
              <span className="min-w-0">
                <span className="block text-lg font-medium leading-tight text-slate-800">{portion.label}</span>
                <span className="block text-sm text-slate-500">
                  {portion.grams} {item.unit}
                </span>
              </span>
              <span className="whitespace-nowrap text-lg font-semibold tabular-nums text-[#7A2432]">
                ≈ {round(portionNutrition(item, portion.grams).kcal)} ккал
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={close}
        className="mt-2 w-full rounded-full py-2.5 text-base font-medium text-slate-500 transition-colors hover:text-[#7A2432]"
      >
        Отмена
      </button>
    </>
  );
}

function FoodTile({ item, hidden, onPick }) {
  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={(event) => onPick(item, event.currentTarget)}
        style={{ opacity: hidden ? 0 : 1 }}
        className="flex h-full min-h-32 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm transition-[transform,border-color,box-shadow,opacity] duration-200 hover:border-[#7A2432] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A2432]/40 active:scale-95"
      >
        <span className="flex h-12 items-center justify-center text-[40px] leading-none">
          <FoodIcon icon={item.emoji} />
        </span>
        <span className="text-[15px] font-semibold leading-tight text-slate-800">{item.name}</span>
        <span className="text-xs text-slate-500">
          {item.kcal} ккал · {per100(item)}
        </span>
      </button>
    </li>
  );
}

function Stepper({ count, onMinus, onPlus }) {
  const btn =
    'flex h-10 w-10 items-center justify-center rounded-full text-[#7A2432] transition-[transform,background-color] duration-150 hover:bg-white/70 active:scale-90';
  return (
    <div className="inline-flex h-11 w-fit items-center rounded-full bg-slate-200/50 p-0.5">
      <button type="button" aria-label="Меньше" onClick={onMinus} className={btn}>
        <StepIcon />
      </button>
      <span className="min-w-9 text-center text-lg font-semibold leading-none tabular-nums text-slate-800" aria-live="polite">
        {count}
      </span>
      <button type="button" aria-label="Больше" onClick={onPlus} className={btn}>
        <StepIcon plus />
      </button>
    </div>
  );
}

export function ChislaPage() {
  const [category, setCategory] = useState('hot');
  const [sub, setSub] = useState('all');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(null);
  const [openedId, setOpenedId] = useState(null);
  const [plate, setPlate] = useState([]);
  const [notice, setNotice] = useState('');
  const plateRef = useRef(null);
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktop, () => false);

  const openPortions = (item, el) => setPicked({ item, el, rect: el.getBoundingClientRect() });
  const onPopoverClosed = useCallback(() => setPicked(null), []);

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

  const chooseCategory = (id) => {
    setCategory(id);
    setSub('all');
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
    { key: 'p', grams: totals.p, pct: share(totals.p * 4) },
    { key: 'f', grams: totals.f, pct: share(totals.f * 9) },
    { key: 'c', grams: totals.c, pct: share(totals.c * 4) },
  ];

  const dayPct = (totals.kcal / DAILY_REFERENCE) * 100;
  const topEntry = rows.length > 1 ? rows.reduce((best, entry) => (entry.nutrition.kcal > best.nutrition.kcal ? entry : best)) : null;
  const topPct = topEntry && totals.kcal > 0 ? round((topEntry.nutrition.kcal / totals.kcal) * 100) : 0;

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
  const scrollRow =
    'flex overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-sm:-mx-4 max-sm:px-4 max-sm:[mask-image:linear-gradient(to_right,transparent,#000_1rem,#000_calc(100%_-_2.5rem),transparent)] sm:flex-wrap sm:overflow-visible sm:pb-0';

  return (
    <main style={FONT} className={`page-shell flex flex-col gap-5 py-1 ${rows.length > 0 ? 'pb-24 lg:pb-1' : ''}`}>
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

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
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

          {!query && isDesktop && (
            <div className="flex flex-col gap-3">
              <div className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Что считаем</div>
              <LiquidMenu
                label="Категории"
                value={category}
                onChange={chooseCategory}
                groups={CATEGORY_GROUPS.map((group) => ({
                  label: group.label,
                  options: group.ids.map((id) => ({ value: id, label: categories.find((entry) => entry.id === id).label })),
                }))}
              />
            </div>
          )}

          {!query && !isDesktop && (
            <div className={`${scrollRow} gap-1`}>
              {categories.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={category === entry.id}
                  onClick={(event) => {
                    chooseCategory(entry.id);
                    reveal(event);
                  }}
                  className={catClass(category === entry.id)}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          )}

          {!query && currentCategory?.subs && (
            <div className={`${scrollRow} gap-x-5 gap-y-1`} aria-label="Подкатегории">
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
                    <h3 className="mb-2 mt-3 flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {group.label}
                      <span className="font-normal normal-case tracking-normal">{group.items.length}</span>
                    </h3>
                  )}
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                    {group.items.map((item) => (
                      <FoodTile key={item.id} item={item} hidden={openedId === item.id} onPick={openPortions} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <div ref={plateRef} className="scroll-mt-32 lg:sticky lg:top-32">
          <aside className="glass-bar rounded-3xl lg:max-h-[calc(100vh-9rem)] lg:overflow-hidden">
            <div className="flex flex-col gap-4 p-5 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
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
                <ul className="flex flex-col gap-2">
                  {rows.map(({ row, item, portion, nutrition }) => (
                    <li
                      key={`${row.foodId}-${row.index}`}
                      className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[28px] leading-none">
                            <FoodIcon icon={item.emoji} />
                          </span>
                          <div className="min-w-0">
                            <div className="text-base font-semibold leading-tight text-slate-800">{item.name}</div>
                            <div className="text-sm text-slate-500">
                              {portion.label}, {portion.grams} {item.unit}
                            </div>
                          </div>
                        </div>
                        <div className="whitespace-nowrap text-lg font-bold tabular-nums text-slate-800">
                          ≈ {round(nutrition.kcal)}
                        </div>
                      </div>
                      <Stepper count={row.count} onMinus={() => changeCount(row, -1)} onPlus={() => changeCount(row, 1)} />
                    </li>
                  ))}
                </ul>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-medium text-slate-500">Всего</div>
                <div className="flex items-baseline gap-2 text-[#7A2432]">
                  <span className="text-6xl font-bold leading-none tracking-tight tabular-nums">≈ {round(totals.kcal)}</span>
                  <span className="text-xl font-semibold">ккал</span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-slate-500">Ориентир: {DAILY_REFERENCE} ккал в день</span>
                    <span className="font-semibold tabular-nums text-slate-800">{round(dayPct)}%</span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-200/50" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-[#7A2432]"
                      style={{ width: `${Math.min(100, dayPct)}%`, transition: 'width 500ms cubic-bezier(0.32, 0.72, 0, 1)' }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <MacroRings rows={macros} />
                <dl className="flex min-w-0 flex-1 flex-col gap-2.5">
                  {macros.map((entry) => (
                    <div key={entry.key} className="flex items-center gap-2.5">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: RING[entry.key].color }} aria-hidden="true" />
                      <div className="min-w-0">
                        <dt className="text-sm leading-tight text-slate-500">{RING[entry.key].label}</dt>
                        <dd className="text-base font-bold leading-tight tabular-nums text-slate-800">
                          {round(entry.grams)} г
                          <span className="ml-1.5 text-sm font-medium text-slate-500">{round(entry.pct)}%</span>
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>

              {topEntry && topPct > 0 && (
                <p className="rounded-2xl bg-[#7A2432]/10 px-4 py-3 text-sm text-slate-700">
                  Больше всего калорий даёт <span className="font-semibold">{topEntry.item.name}</span>:{' '}
                  {topPct}% тарелки.
                </p>
              )}

              <p className="text-sm text-slate-400">
                Значения примерные: порции и состав продуктов бывают разными. Это не медицинская рекомендация.
              </p>
            </div>
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
              <div className="text-[#7A2432]">
                <span className="text-2xl font-bold tabular-nums">≈ {round(totals.kcal)}</span>
                <span className="ml-1 text-base font-semibold">ккал</span>
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

      {picked && (
        <TilePopover
          anchor={picked.rect}
          label={`Сколько: ${picked.item.name}`}
          style={FONT}
          returnFocusTo={picked.el}
          onClosed={onPopoverClosed}
          onExpandedChange={(expanded) => setOpenedId(expanded ? picked.item.id : null)}
        >
          {({ close, expanded }) => (
            <PortionList item={picked.item} expanded={expanded} close={close} onChoose={(index) => addToPlate(picked.item, index)} />
          )}
        </TilePopover>
      )}
    </main>
  );
}
