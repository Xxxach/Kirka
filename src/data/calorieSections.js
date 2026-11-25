import { foods, categories } from './calories.js';

const num = (value) => Number(Number(value).toFixed(1));

// Таблица «на 100 г» по категориям: одни и те же данные видит человек (CalorieTable)
// и поисковик (статическая версия в scripts/generate-pages.mjs).
export const calorieSections = () =>
  categories
    .filter((entry) => entry.subs)
    .map((entry) => ({
      id: entry.id,
      label: entry.label,
      rows: foods
        .filter((item) => item.cat === entry.id)
        .sort((a, b) => entry.subs.findIndex((s) => s.id === a.sub) - entry.subs.findIndex((s) => s.id === b.sub) || a.order - b.order)
        .map((item) => ({ name: item.name, kcal: Math.round(item.kcal), p: num(item.p), f: num(item.f), c: num(item.c) })),
    }))
    .filter((section) => section.rows.length);
