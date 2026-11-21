import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { categories, foods, foodById, norm, portionNutrition } from '../data/calories';
import { kcalRange, resolveFood } from '../data/foodHelpers';
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

// Соусы к фастфуду: в окне порций показываются мини-иконками и названиями, а в тарелку попадают отдельными строками (порция 25 г)
const SAUCE_UI = [
  { id: 'ketchup', name: 'Кетчуп' },
  { id: 'mayo', name: 'Майонез' },
  { id: 'cheese_sauce', name: 'Сырный' },
  { id: 'garlic_sauce', name: 'Чесночный' },
  { id: 'bbq', name: 'Барбекю' },
  { id: 'sweet_chili', name: 'Кисло-сладкий' },
  { id: 'mustard', name: 'Горчица' },
  { id: 'hot_sauce', name: 'Острый' },
];
const SAUCE_HOSTS = new Set(['hamburger', 'cheeseburger', 'bigmac', 'chicken_burger', 'hotdog', 'nuggets', 'fries', 'potato_rustic', 'shawarma', 'taco']);
const sauceIndex = (id) => foodById[id]?.portions.findIndex((p) => p.label === 'Порция соуса') ?? -1;

function LactoseSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-2xl py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A2432]/40"
    >
      <span className="text-base font-medium text-slate-800">Без лактозы</span>
      <span
        className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-200 ${checked ? 'bg-[#7A2432]' : ''}`}
        style={checked ? undefined : { background: 'rgba(120,120,128,0.32)' }}
        aria-hidden="true"
      >
        <span
          className="absolute left-0.5 top-0.5 h-7 w-7 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </span>
    </button>
  );
}

// Подсказки по балансу: простая схема по долям калорий (ориентиры для одной тарелки, не норма для врача)
const ADVICE_MIN_KCAL = 150;
const PROTEIN_IDS = ['chicken_breast', 'egg_boiled', 'cottage', 'tuna', 'turkey', 'pink_salmon'];
const LIGHT_IDS = ['cucumber', 'tomato', 'cabbage', 'apple', 'buckwheat', 'chicken_breast'];
const CARB_IDS = ['buckwheat', 'rice_brown', 'banana', 'apple', 'lentil'];

function getAdvice({ pPct, fPct, cPct, sweetPct, onPlate }) {
  const fresh = (ids) => ids.filter((id) => !onPlate.has(id) && foodById[id]).slice(0, 3);
  if (sweetPct >= 40) {
    return {
      tint: RING.f.color,
      label: 'Для баланса',
      title: 'Многовато сладкого',
      text: 'Добавь овощи и что-то белковое: станет сытнее и спокойнее по сахару.',
      ids: fresh(['cucumber', 'chicken_breast', 'egg_boiled', 'cottage']),
    };
  }
  if (pPct < 15) {
    return {
      tint: RING.p.color,
      label: 'Для баланса',
      title: 'Не хватает белка',
      text: 'Добавь белковое: мясо, рыбу, яйца или творог.',
      ids: fresh(PROTEIN_IDS),
    };
  }
  if (fPct > 38) {
    return {
      tint: RING.f.color,
      label: 'Для баланса',
      title: 'Жирновато',
      text: 'Разбавь овощами, крупой или нежирным белком.',
      ids: fresh(LIGHT_IDS),
    };
  }
  if (cPct > 65) {
    return {
      tint: RING.c.color,
      label: 'Для баланса',
      title: 'Много углеводов',
      text: 'Добавь белок, а в следующий раз возьми поменьше сладкого и выпечки.',
      ids: fresh(PROTEIN_IDS),
    };
  }
  if (cPct < 35) {
    return {
      tint: RING.c.color,
      label: 'Для баланса',
      title: 'Не хватает углеводов',
      text: 'Добавь крупу, фрукты или бобовые: это даст энергию.',
      ids: fresh(CARB_IDS),
    };
  }
  return {
    tint: '#30D158',
    label: 'Для баланса',
    title: 'Баланс в норме',
    text: 'Белки, жиры и углеводы примерно в ориентире: 15–35 / 20–38 / 35–65% калорий.',
    ids: [],
  };
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5c.9 3.1 5.2 5.2 5.2 9.9A5.2 5.2 0 0 1 12 17.7a5.2 5.2 0 0 1-5.2-5.3c0-1.9.9-3.4 2-4.5.2 1.3.9 2.1 1.8 2.4C10.2 8.3 10.7 5.2 12 2.5z" />
    </svg>
  );
}

function BalanceIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.8" />
    </svg>
  );
}

// Карточка-подсказка в стиле «Здоровья» на iPhone: цветная плитка с иконкой, подпись и крупный заголовок
function InsightCard({ tint, icon, label, title, children }) {
  return (
    <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-white"
        style={{ background: `linear-gradient(160deg, ${tint}, ${tint}CC)`, boxShadow: `0 6px 14px -6px ${tint}` }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: tint }}>
          {label}
        </div>
        <div className="mt-0.5 text-lg font-semibold leading-snug text-slate-800">{title}</div>
        {children}
      </div>
    </div>
  );
}

function PortionList({ item, expanded, close, onChoose }) {
  const firstRef = useRef(null);
  const chosen = useRef(false);
  const [variant, setVariant] = useState(item.variants?.defaultId ?? null);
  const [lf, setLf] = useState(false);
  const [sauces, setSauces] = useState([]);
  const current = resolveFood(item, { variant, lf });
  const toggleSauce = (id) => setSauces((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  useEffect(() => {
    if (!expanded || window.matchMedia?.('(pointer: coarse)').matches) return;
    firstRef.current?.focus({ preventScroll: true });
  }, [expanded]);

  const choose = (index) => {
    if (chosen.current) return;
    chosen.current = true;
    onChoose(index, { variant: current.variantId, lf: current.lf, sauces });
    close();
  };

  return (
    <>
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center text-5xl leading-none">
          <FoodIcon icon={item.emoji} />
        </span>
        <div className="min-w-0">
          <div className="text-xl font-semibold leading-tight text-slate-800">{current.displayName}</div>
          <div className="text-sm text-slate-500">
            {current.kcal} ккал на {per100(item)}
          </div>
        </div>
      </div>

      {item.variants && (
        <div className="mb-2">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">{item.variants.label}</div>
          <div className="flex flex-wrap gap-1.5">
            {item.variants.options.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={variant === option.id}
                onClick={() => setVariant(option.id)}
                className={`rounded-full px-3.5 py-1.5 text-[15px] font-medium transition-colors duration-200 ${
                  variant === option.id ? 'gel bg-[#7A2432] text-white' : 'bg-slate-200/50 text-slate-600 hover:bg-white/70'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {item.lactose && (
        <div className="mb-1">
          <LactoseSwitch checked={lf} onChange={setLf} />
          {lf && <p className="text-sm text-slate-500">Калорийность почти не меняется.</p>}
        </div>
      )}

      {SAUCE_HOSTS.has(item.id) && (
        <div className="mb-2">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Соусы</div>
          <div className="grid grid-cols-5 gap-1.5">
            {SAUCE_UI.filter((sauce) => sauceIndex(sauce.id) >= 0).map((sauce) => {
              const on = sauces.includes(sauce.id);
              return (
                <button
                  key={sauce.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleSauce(sauce.id)}
                  className={`flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-center transition-colors duration-200 ${
                    on ? 'gel bg-[#7A2432] text-white' : 'bg-slate-200/50 text-slate-600 hover:bg-white/70'
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center text-3xl leading-none">
                    <FoodIcon icon={foodById[sauce.id].emoji} />
                  </span>
                  <span className="w-full break-words text-[11px] font-medium leading-[1.1]">{sauce.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
                ≈ {round(portionNutrition(current, portion.grams).kcal)} ккал
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

const kcalLabel = (item) => {
  const [low, high] = kcalRange(item);
  return low === high ? `${low}` : `${low}–${high}`;
};

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
          {kcalLabel(item)} ккал · {per100(item)}
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

  const addToPlate = (item, index, selection = {}) => {
    const variant = selection.variant ?? null;
    const lf = Boolean(selection.lf);
    const sauces = (selection.sauces ?? []).filter((id) => sauceIndex(id) >= 0);
    const entries = [
      { foodId: item.id, index, variant, lf },
      ...sauces.map((id) => ({ foodId: id, index: sauceIndex(id), variant: null, lf: false })),
    ];
    setPlate((prev) =>
      entries.reduce((list, entry) => {
        const found = list.find(
          (row) => row.foodId === entry.foodId && row.index === entry.index && row.variant === entry.variant && row.lf === entry.lf,
        );
        return found ? list.map((row) => (row === found ? { ...row, count: row.count + 1 } : row)) : [...list, { ...entry, count: 1 }];
      }, prev),
    );
    const { displayName } = resolveFood(item, { variant, lf });
    const extra = sauces.length ? ` + ${sauces.map((id) => SAUCE_UI.find((sauce) => sauce.id === id).name.toLowerCase()).join(', ')}` : '';
    setNotice(`Добавлено: ${displayName}, ${item.portions[index].label.toLowerCase()}${extra}`);
  };

  const changeCount = (row, delta) => {
    setPlate((prev) =>
      prev
        .map((entry) => (entry === row ? { ...entry, count: entry.count + delta } : entry))
        .filter((entry) => entry.count > 0),
    );
  };

  const rows = plate.map((row) => {
    const item = resolveFood(foodById[row.foodId], { variant: row.variant, lf: row.lf });
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

  const sweetKcal = rows.reduce((sum, entry) => sum + (entry.item.cat === 'sweet' ? entry.nutrition.kcal : 0), 0);
  const advice =
    totals.kcal >= ADVICE_MIN_KCAL
      ? getAdvice({
          pPct: share(totals.p * 4),
          fPct: share(totals.f * 9),
          cPct: share(totals.c * 4),
          sweetPct: totals.kcal > 0 ? (sweetKcal / totals.kcal) * 100 : 0,
          onPlate: new Set(plate.map((row) => row.foodId)),
        })
      : null;

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
                      key={`${row.foodId}-${row.index}-${row.variant ?? ''}-${row.lf ? 'lf' : ''}`}
                      className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[28px] leading-none">
                            <FoodIcon icon={item.emoji} />
                          </span>
                          <div className="min-w-0">
                            <div className="text-base font-semibold leading-tight text-slate-800">{item.displayName}</div>
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
                <InsightCard tint="#FF9F0A" icon={<FlameIcon />} label="Больше всего калорий" title={topEntry.item.displayName}>
                  <div className="mt-1.5 flex items-center gap-2.5">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/50" aria-hidden="true">
                      <div className="h-full rounded-full" style={{ width: `${topPct}%`, background: '#FF9F0A' }} />
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-slate-800">{topPct}% тарелки</span>
                  </div>
                </InsightCard>
              )}

              {advice && (
                <InsightCard tint={advice.tint} icon={<BalanceIcon />} label={advice.label} title={advice.title}>
                  <p className="mt-0.5 text-sm text-slate-500">{advice.text}</p>
                  {advice.ids.length > 0 && (
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {advice.ids.map((id) => (
                        <li
                          key={id}
                          className="flex items-center gap-1.5 rounded-full bg-slate-200/50 py-1 pl-1.5 pr-3 text-sm font-medium text-slate-700"
                        >
                          <span className="flex h-5 w-5 items-center justify-center text-base leading-none">
                            <FoodIcon icon={foodById[id].emoji} />
                          </span>
                          {foodById[id].name}
                        </li>
                      ))}
                    </ul>
                  )}
                </InsightCard>
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
          <div className="glass-bar glass-refract [--glass-a:0.3] flex items-center justify-between gap-3 rounded-full py-2 pl-5 pr-2">
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
            <PortionList item={picked.item} expanded={expanded} close={close} onChoose={(index, selection) => addToPlate(picked.item, index, selection)} />
          )}
        </TilePopover>
      )}
    </main>
  );
}
