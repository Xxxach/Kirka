// Общие помощники для описания продуктов (используются calories.js и foodsExtra.js)

export const food = (id, cat, emoji, name, kcal, p, f, c, portions, extra = {}) => ({
  id,
  cat,
  emoji,
  name,
  kcal,
  p,
  f,
  c,
  unit: extra.unit || 'г',
  hot: Boolean(extra.hot),
  alias: extra.alias || '',
  sub: extra.sub || '',
  // Варианты (например, жирность): { label, defaultId, options: [{ id, label, kcal, p, f, c }] }
  variants: extra.variants || null,
  // Есть ли безлактозная версия (переключатель «Без лактозы» в окне порций)
  lactose: Boolean(extra.lactose),
  portions: portions.map(([label, grams]) => ({ label, grams })),
});

export const ML = { unit: 'мл' };

// rows: [id, подпись, kcal, белки, жиры, углеводы] на 100 г / 100 мл
export const variants = (label, defaultId, rows) => ({
  label,
  defaultId,
  options: rows.map(([id, text, kcal, p, f, c]) => ({ id, label: text, kcal, p, f, c })),
});

// Продукт в выбранном варианте: подставляет КБЖУ варианта и собирает название для тарелки
export const resolveFood = (item, selection = {}) => {
  const option =
    item.variants?.options.find((entry) => entry.id === selection.variant) ??
    item.variants?.options.find((entry) => entry.id === item.variants.defaultId) ??
    null;
  const lf = Boolean(item.lactose && selection.lf);
  const displayName = `${[item.name, option?.label].filter(Boolean).join(' ')}${lf ? ', без лактозы' : ''}`;
  return {
    ...item,
    ...(option ? { kcal: option.kcal, p: option.p, f: option.f, c: option.c } : {}),
    displayName,
    variantId: option?.id ?? null,
    lf,
  };
};

// Диапазон калорийности продукта с вариантами
export const kcalRange = (item) => {
  if (!item.variants) return [item.kcal, item.kcal];
  const values = item.variants.options.map((entry) => entry.kcal);
  return [Math.min(...values), Math.max(...values)];
};
