// Раскладка «Стола»: из строк тарелки получаем посуду и предметы на ней.
// Чистые функции без React, чтобы их можно было проверять в Node.

const NUMBER_WORDS = {
  один: 1, одна: 1, одно: 1, два: 2, две: 2, три: 3, четыре: 4, пять: 5,
  шесть: 6, семь: 7, восемь: 8, девять: 9, десять: 10,
};

export const VESSEL_CAP = { plate: 4, bowl: 5, bare: 4 };
export const MAX_VESSELS = 6;
const KIND_ORDER = ['plate', 'bowl', 'bare'];

// Куда кладём: фрукты, овощи и орехи в миску, напитки и молоко просто на стол, остальное на тарелку.
export const vesselKind = (item) => {
  if (item.cat === 'drinks' || (item.cat === 'dairy' && item.sub === 'milk')) return 'bare';
  if (item.cat === 'fruit' || item.cat === 'veg' || (item.cat === 'snacks' && item.sub === 'nuts')) return 'bowl';
  return 'plate';
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

export const labelScale = (label) => {
  if (/ложк/i.test(label)) return 0.7;
  if (/мини|маленьк|небольш|тонк|половин/i.test(label)) return 0.82;
  if (/больш|толст|двойн|крупн/i.test(label)) return 1.12;
  return 1;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Группы одинаковых предметов для одной строки тарелки.
// У плиток шоколада дольки собираются в целую плитку («много долек = плитка»).
export function groupsFor({ item, portion, row }) {
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
  return [{ icon: item.emoji, scale: labelScale(portion.label), n: piecesIn(portion.label) * row.count }];
}

// Раскладываем предметы по посуде поровну: 6 штук на две тарелки это 3 + 3, а не 4 + 2.
function pack(units) {
  const vessels = [];
  KIND_ORDER.forEach((kind) => {
    const list = units.filter((unit) => unit.kind === kind);
    if (list.length === 0) return;
    const count = Math.ceil(list.length / VESSEL_CAP[kind]);
    const per = Math.ceil(list.length / count);
    for (let i = 0; i < count; i += 1) vessels.push({ kind, units: list.slice(i * per, (i + 1) * per) });
  });
  return vessels;
}

// Если посуды больше шести, одна иконка начинает значить несколько штук (значок ×N).
export function buildTable(entries) {
  const groups = entries.flatMap((entry) => {
    const kind = vesselKind(entry.item);
    return groupsFor(entry).map((group) => ({ ...group, kind }));
  });
  let vessels = [];
  let compress = 1;
  for (let factor = 1; factor <= 12; factor += 1) {
    const units = groups.flatMap((group) => {
      const n = Math.max(1, Math.ceil(group.n / factor));
      const badge = factor > 1 && group.n > 1 ? (n === 1 ? group.n : factor) : 0;
      return Array.from({ length: n }, () => ({ icon: group.icon, scale: group.scale, kind: group.kind, badge }));
    });
    vessels = pack(units);
    compress = factor;
    if (vessels.length <= MAX_VESSELS) break;
  }
  return { vessels: vessels.slice(0, MAX_VESSELS), compress };
}

// Размеры картинки «Стол» (в её собственных единицах).
export const SCENE_W = 1080;
export const PAD = 36;
export const HEAD = 372;
const FOOT = 140;

export function sceneGeometry(count) {
  const cols = count <= 1 ? 1 : count <= 4 ? 2 : 3;
  const rows = Math.max(1, Math.ceil(count / cols));
  const usable = SCENE_W - PAD * 2 - 48;
  const cellW = usable / cols;
  const D = Math.min(cellW * 0.88, 460);
  const cellH = D * 0.92;
  const panelH = 48 + rows * cellH + D * 0.05;
  return { cols, rows, cellW, D, cellH, panelH, height: HEAD + panelH + FOOT };
}
