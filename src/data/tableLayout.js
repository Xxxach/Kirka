// Раскладка «Стола»: из строк тарелки получаем посуду, предметы на ней и их координаты.
// Чистые функции без React, чтобы их можно было проверять в Node.

const NUMBER_WORDS = {
  один: 1, одна: 1, одно: 1, два: 2, две: 2, три: 3, четыре: 4, пять: 5,
  шесть: 6, семь: 7, восемь: 8, девять: 9, десять: 10,
};

// Сколько предметов помещается в каждую посуду. Если не влезает, иконка начинает значить несколько штук (×N).
const CAP = { main: 8, cheese: 6, bread: 4, sweet: 5, tray: 8, bowl: 8, veg: 8, sugar: 3, sauce: 4 };
const DRINK_MAX = 6;
const DISH_MAX = 3;
const VEG_MIN = 3; // меньше трёх овощей кладём на главную тарелку, от трёх нужна миска

// Куда кладём: фастфуд на картонный лоток, фрукты в бежевую миску, много овощей в синюю миску,
// супы в свою большую глубокую тарелку за главной, вторые блюда (голубцы, паста, пельмени) на главную тарелку, сыры и колбасы на свою тарелку,
// хлеб и сладкое на отдельные маленькие тарелки, сахар и джем на маленькое синее блюдце, соусы маленькими бутылками
// рядом с лотком, напитки просто на стол, остальное на главную тарелку.
export const vesselKind = (item) => {
  const { id, cat, sub } = item;
  if (cat === 'drinks' || (cat === 'dairy' && sub === 'milk')) return 'drink';
  if ((cat === 'dish' && sub === 'fast') || /^(fries|pizza)/.test(id)) return 'tray';
  if (cat === 'fat' && sub === 'sauce') return 'sauce';
  if (cat === 'sweet' && sub === 'sweetener') return 'sugar';
  if (cat === 'fruit') return 'bowl';
  if (cat === 'veg') return 'veg';
  if (cat === 'dish' && sub === 'soup') return 'dish';
  if (cat === 'dairy' || (cat === 'meat' && sub === 'sausage')) return 'cheese';
  if (cat === 'bread') return 'bread';
  if (cat === 'sweet' || cat === 'snacks') return 'sweet';
  return 'main';
};

// Сколько штук в одной порции: «Три пельменя» = 3, «Сет (8 штук)» = 8, «Горсть» и «Ложка» = 1.
export const piecesIn = (label) => {
  const lower = label.toLowerCase();
  if (lower.includes('ложк')) return 1;
  const word = lower.split(/[\s,(]/)[0];
  if (NUMBER_WORDS[word]) return NUMBER_WORDS[word];
  const match = lower.match(/\((\d+)\s*штук/);
  return match ? Number(match[1]) : 1;
};

// Иконки, на которых нарисовано сразу несколько штук (наггетсы: два на картинке).
const SHOWS = { nuggets: 2 };
const SUGAR_CUBE = 5; // грамм в одном кусочке рафинада
const SUGAR_PYRAMID_FROM = 4; // от скольких кусочков рисуем пирамидку
const SUGAR_PYRAMID_MAX = 36; // в пирамидке до 36 кусочков (основание из 8)

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const median = (list) => {
  const sorted = [...list].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Размер предмета: маленький банан меньше среднего, большой больше (сравниваем вес одной штуки).
export const sizeScale = (item, portion) => {
  if (/ложк/i.test(portion.label)) return 0.7;
  const perPiece = (entry) => entry.grams / piecesIn(entry.label);
  return clamp((perPiece(portion) / median(item.portions.map(perPiece))) ** 0.9, 0.6, 1.35);
};

// Группы одинаковых предметов для одной строки тарелки.
// У плиток шоколада дольки собираются в целую плитку («много долек = плитка»).
export function groupsFor({ item, portion, row }, kind) {
  const total = portion.grams * row.count;
  const tiles = item.portions.filter((entry) => /плитк/i.test(entry.label));
  const whole = tiles.reduce((best, entry) => (!best || entry.grams > best.grams ? entry : best), null);
  const smallest = Math.min(...item.portions.map((entry) => entry.grams));
  if (whole && whole.grams >= 3 * smallest) {
    let rest = total;
    const groups = [];
    [...item.portions]
      .sort((a, b) => b.grams - a.grams)
      .forEach((entry) => {
        const n = Math.floor(rest / entry.grams + 1e-6);
        if (n > 0) {
          groups.push({ icon: item.emoji, scale: clamp(0.5 + 0.5 * Math.sqrt(entry.grams / whole.grams), 0.55, 1), n });
          rest -= n * entry.grams;
        }
      });
    return groups;
  }
  if (item.cat === 'dish') {
    // Готовое блюдо: одна порция это один предмет (суп, пельмени, паста), размер зависит от порции.
    const ratio = portion.grams / median(item.portions.map((entry) => entry.grams));
    return [{ icon: item.emoji, scale: clamp(ratio ** 0.9, 0.75, 1.3), n: row.count }];
  }
  if (kind === 'sauce') return [{ icon: item.emoji, scale: 0.8, n: 1 }]; // соус: одна маленькая бутылка
  if (item.id === 'sugar') {
    // Много сахара: пирамидка из кусочков рафинада
    const cubes = Math.round(total / SUGAR_CUBE);
    if (cubes >= SUGAR_PYRAMID_FROM) {
      return [{ icon: item.emoji, scale: 1, n: 1, pyramid: Math.min(SUGAR_PYRAMID_MAX, cubes), reps: Math.ceil(cubes / SUGAR_PYRAMID_MAX) }];
    }
  }
  const scale = sizeScale(item, portion) * (kind === 'sugar' ? 0.75 : 1);
  return [{ icon: item.emoji, scale, n: Math.ceil((piecesIn(portion.label) * row.count) / (SHOWS[item.id] ?? 1)) }];
}

// Раскладываем предметы по посуде. Фрукты и овощи делим на миски поровну, блюда и напитки по одному.
function bowlPlan(units) {
  const fruit = units.filter((unit) => unit.kind === 'bowl').length;
  const veg = units.filter((unit) => unit.kind === 'veg').length;
  return { fruit: veg ? 1 : 2, veg: fruit ? 1 : 2 };
}

function pack(units) {
  const vessels = [];
  const of = (kind) => units.filter((unit) => unit.kind === kind);
  ['main', 'cheese', 'bread', 'sweet', 'sugar', 'tray', 'sauce'].forEach((kind) => {
    const list = of(kind);
    if (list.length) vessels.push({ kind, units: list });
  });
  const plan = bowlPlan(units);
  [['bowl', 'fruit', plan.fruit], ['veg', 'veg', plan.veg]].forEach(([kind, tone, max]) => {
    const list = of(kind);
    if (!list.length) return;
    const bowls = Math.min(max, Math.ceil(list.length / CAP.bowl));
    const per = Math.ceil(list.length / bowls);
    for (let i = 0; i < bowls; i += 1) vessels.push({ kind: 'bowl', tone, units: list.slice(i * per, (i + 1) * per) });
  });
  of('dish').forEach((unit) => vessels.push({ kind: 'dish', units: [unit] }));
  of('drink').forEach((unit) => vessels.push({ kind: 'drink', units: [unit] }));
  return vessels;
}

// Иконка значит несколько штук: делим поровну, чтобы сумма на значках сходилась (9 штук в 3 иконки = ×3 ×3 ×3).
function expand(group, factor) {
  const base = { icon: group.icon, scale: group.scale, kind: group.kind };
  if (group.pyramid) return [{ ...base, pyramid: group.pyramid, badge: group.reps > 1 ? group.reps : 0 }];
  const count = Math.max(1, Math.ceil(group.n / factor));
  const each = Math.floor(group.n / count);
  const extra = group.n % count;
  return Array.from({ length: count }, (_, i) => {
    const part = each + (i < extra ? 1 : 0);
    return { ...base, badge: part > 1 ? part : 0 };
  });
}

export function buildTable(entries) {
  const groups = entries.flatMap((entry) => {
    const kind = vesselKind(entry.item);
    return groupsFor(entry, kind).map((group) => ({ ...group, kind }));
  });
  // Меньше трёх овощей миска не нужна: они лежат на главной тарелке
  const vegPieces = groups.filter((group) => group.kind === 'veg').reduce((sum, group) => sum + group.n, 0);
  if (vegPieces < VEG_MIN) groups.forEach((group) => { if (group.kind === 'veg') group.kind = 'main'; });

  const kinds = new Set(groups.map((group) => group.kind));
  const capacity = (kind) => {
    if (kind === 'bowl') return CAP.bowl * (kinds.has('veg') ? 1 : 2);
    if (kind === 'veg') return CAP.veg * (kinds.has('bowl') ? 1 : 2);
    if (kind === 'dish') return DISH_MAX;
    if (kind === 'drink') return DRINK_MAX;
    return CAP[kind];
  };

  // Сжимаем каждую посуду отдельно и только настолько, чтобы всё поместилось
  const units = [];
  let compress = 1;
  kinds.forEach((kind) => {
    const own = groups.filter((group) => group.kind === kind);
    let list = [];
    for (let factor = 1; factor <= 24; factor += 1) {
      list = own.flatMap((group) => expand(group, factor));
      compress = Math.max(compress, factor);
      if (list.length <= capacity(kind)) break;
    }
    units.push(...list);
  });

  // Главная тарелка никогда не бывает пустой: ставим на неё суп, а если супа нет, сыр, сладкое или хлеб
  if (!units.some((unit) => unit.kind === 'main')) {
    const soup = units.find((unit) => unit.kind === 'dish');
    if (soup) {
      soup.kind = 'main';
    } else {
      const own = ['cheese', 'sweet', 'bread'].find((kind) => units.some((unit) => unit.kind === kind));
      units.forEach((unit) => {
        if (unit.kind === own) unit.kind = 'main';
      });
    }
  }
  return { vessels: pack(units), compress };
}

// ---------- Геометрия картинки (в её собственных единицах) ----------
// Стол широкий: сверху ряд крупной посуды (миски, блюда, лоток, тарелки), снизу сервировка с напитками по бокам.
export const SCENE_W = 1080;
export const PAD = 36;
export const HEAD = 372;
export const INNER = 24;
const FOOT = 140;
const IW = SCENE_W - PAD * 2 - INNER * 2; // 912: ширина столешницы без полей

const PATTERN = { 1: [1], 2: [2], 3: [1, 2], 4: [2, 2], 5: [2, 3], 6: [3, 3], 7: [2, 2, 3], 8: [3, 2, 3] };
const SIZE = { 1: 0.62, 2: 0.46, 3: 0.4, 4: 0.36, 5: 0.32, 6: 0.3, 7: 0.27, 8: 0.25 };

// Места предметов на посуде: x, y (низ предмета) и размер в долях диаметра. Чем больше предметов, тем они мельче.
function arrange(count, { gap, base, mult = 1 }) {
  const k = Math.min(8, Math.max(1, count));
  const rows = PATTERN[k];
  const size = SIZE[k] * mult;
  const slots = [];
  rows.forEach((m, r) => {
    const y = base - (rows.length - 1 - r) * gap;
    for (let j = 0; j < m; j += 1) slots.push({ x: (j - (m - 1) / 2) * SIZE[k] * 0.92, y, size });
  });
  return slots;
}

const place = (units, cx, cy, D, opts) =>
  (units.length === 0 ? [] : arrange(units.length, opts)).map((slot, i) => ({
    unit: units[i],
    x: cx + slot.x * D,
    y: cy + slot.y * D,
    size: slot.size * D * units[i].scale,
  }));

// Глубокая миска: предметы утоплены, нижняя половина спрятана за передней стенкой, сверху видна «горка».
function placeBowl(units, cx, cy, D) {
  if (units.length === 0) return [];
  const k = Math.min(8, units.length);
  const rows = PATTERN[k];
  const rx = D * 0.5;
  const ry = D * 0.14;
  const size0 = SIZE[k] * 1.15 * D;
  const out = [];
  let index = 0;
  rows.forEach((m, r) => {
    for (let j = 0; j < m; j += 1) {
      const unit = units[index];
      index += 1;
      const x = (j - (m - 1) / 2) * size0 * 0.9;
      const size = size0 * unit.scale;
      const arc = ry * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2));
      out.push({ unit, x: cx + x, y: cy + arc + 0.28 * size - (rows.length - 1 - r) * D * 0.11, size });
    }
  });
  return out;
}

const EXTRA = { bread: { D: 200 }, cheese: { D: 250 }, sweet: { D: 220 }, sugar: { D: 150 }, tray: { w: 330, h: 175 } };
const MAIN_D = 380;
const BOWL_D = 320;
const DISH_D = [0, 340, 300, 260];
const DRINK = 150;
const SAUCE_STEP = 100;
const ROW_GAP = 20;
const MIN_SCALE = 0.66;

// Описание предметов верхнего ряда: ширина и высота «коробки» в натуральную величину
function topItems(vessels) {
  const items = [];
  vessels.filter((v) => v.kind === 'bowl').forEach((v) => items.push({ type: 'bowl', v, w: BOWL_D, h: BOWL_D * 0.9 }));
  const dishes = vessels.filter((v) => v.kind === 'dish');
  dishes.forEach((v) => items.push({ type: 'dish', v, w: DISH_D[dishes.length] ?? 260, h: (DISH_D[dishes.length] ?? 260) * 0.95 }));
  ['tray', 'sauce', 'cheese', 'bread', 'sweet', 'sugar'].forEach((kind) => {
    const v = vessels.find((vessel) => vessel.kind === kind);
    if (!v) return;
    if (kind === 'tray') items.push({ type: 'tray', v, w: EXTRA.tray.w, h: EXTRA.tray.h + 110 });
    else if (kind === 'sauce') items.push({ type: 'sauce', v, w: 30 + SAUCE_STEP * v.units.length, h: 150 });
    else items.push({ type: 'plate', kind, v, w: EXTRA[kind].D, h: EXTRA[kind].D * 0.95 });
  });
  return items;
}

// Один ряд: предметы равномерно по ширине, при нехватке места уменьшаются вместе
function layoutRow(items, top, nodes) {
  const total = items.reduce((sum, item) => sum + item.w, 0);
  const s = Math.min(1, IW / (total + ROW_GAP * (items.length + 1)));
  const gap = (IW - total * s) / (items.length + 1);
  const height = Math.max(...items.map((item) => item.h * s)) + 16;
  const bottom = top + height - 6;
  let cursor = gap;
  items.forEach((item) => {
    const w = item.w * s;
    const cx = cursor + w / 2;
    cursor += w + gap;
    if (item.type === 'bowl') {
      const D = w;
      const cy = bottom - D * 0.58;
      nodes.push({ type: 'bowl', tone: item.v.tone, z: bottom, cx, cy, D, placed: placeBowl(item.v.units, cx, cy, D) });
    } else if (item.type === 'dish') {
      const cy = bottom - w * 0.3;
      nodes.push({ type: 'plate', kind: 'dish', z: bottom, cx, cy, D: w, placed: place(item.v.units, cx, cy, w, { gap: 0.1, base: 0.1, mult: 1.25 }) });
    } else if (item.type === 'tray') {
      const h = EXTRA.tray.h * s;
      const cy = bottom - h / 2;
      nodes.push({ type: 'tray', z: bottom, cx, cy, w, h, placed: place(item.v.units, cx, cy + h * 0.12, w * 0.92, { gap: 0.12, base: 0.1 }) });
    } else if (item.type === 'sauce') {
      const step = SAUCE_STEP * s;
      const placed = item.v.units.map((unit, i) => ({
        unit,
        x: cx + (i - (item.v.units.length - 1) / 2) * step,
        y: bottom - 4 - (i % 2) * 8,
        size: DRINK * 0.8 * s * unit.scale,
      }));
      nodes.push({ type: 'sauce', z: bottom, placed });
    } else {
      const cy = bottom - w * 0.3;
      const tone = item.kind === 'sugar' ? 'blue' : undefined;
      nodes.push({ type: 'plate', kind: item.kind, tone, z: bottom, cx, cy, D: w, placed: place(item.v.units, cx, cy, w, { gap: 0.1, base: 0.1 }) });
    }
  });
  return height;
}

export function sceneLayout(vessels) {
  const main = vessels.find((v) => v.kind === 'main');
  const drinks = vessels.filter((v) => v.kind === 'drink').map((v) => v.units[0]);
  const items = topItems(vessels);
  const nodes = [];

  // Верхний ряд (если не влезает по ширине даже с уменьшением, делим на два ряда)
  let HA = 0;
  if (items.length) {
    const total = items.reduce((sum, item) => sum + item.w, 0);
    if (IW / (total + ROW_GAP * (items.length + 1)) >= MIN_SCALE || items.length < 2) {
      HA = layoutRow(items, 0, nodes);
    } else {
      let acc = 0;
      let split = 1;
      items.forEach((item, i) => {
        acc += item.w;
        if (acc < total / 2) split = i + 2;
      });
      split = Math.min(split, items.length - 1);
      const first = layoutRow(items.slice(0, split), 0, nodes);
      HA = first + layoutRow(items.slice(split), first, nodes);
    }
  }

  // Нижний ряд: сервировка в центре (только если на главной тарелке есть еда), напитки по бокам стола
  const hasSetting = Boolean(main?.units.length);
  let H1 = 0;
  if (hasSetting) {
    H1 = drinks.length >= 5 ? 400 : drinks.length >= 3 ? 350 : 320;
    const cy1 = HA + H1 - 130;
    const cx1 = IW / 2;
    nodes.push({
      type: 'setting',
      z: cy1 + 140,
      cx: cx1,
      cy: cy1,
      D: MAIN_D,
      mat: { x: cx1 - 272, y: cy1 - 125, w: 572, h: 265 },
      placed: place(main.units, cx1, cy1, MAIN_D, { gap: 0.1, base: 0.1 }),
    });
    drinks.forEach((unit, i) => {
      const right = i % 2 === 0;
      const level = Math.floor(i / 2);
      const y = cy1 + 75 - level * 85;
      nodes.push({ type: 'drink', z: y, x: right ? IW - 75 : 75, y, size: DRINK * unit.scale, unit });
    });
  } else if (drinks.length) {
    // Без сервировки напитки стоят в ряд
    H1 = 190;
    drinks.forEach((unit, i) => {
      const y = HA + H1 - 24;
      nodes.push({ type: 'drink', z: y, x: (IW * (i + 1)) / (drinks.length + 1), y, size: DRINK * unit.scale, unit });
    });
  }

  const panelH = HA + H1 + INNER * 2;
  nodes.sort((a, b) => a.z - b.z);
  return { nodes, panelH, height: HEAD + panelH + FOOT };
}

export function composeTable(entries) {
  const table = buildTable(entries);
  return { ...table, layout: sceneLayout(table.vessels) };
}
