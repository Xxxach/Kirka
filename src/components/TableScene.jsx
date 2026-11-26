import { useId, useMemo } from 'react';
import { FoodIcon } from './FoodIcon';
import { buildTable, sceneGeometry, SCENE_W, PAD, HEAD } from '../data/tableLayout';

// Картинка «Стол»: одна самодостаточная SVG (цвета заданы прямо в разметке, без CSS-классов),
// чтобы её можно было показать в окне и превратить в PNG для «Поделиться».
const BRAND = '#7A2432';
const SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const SERIF = 'Georgia, "DejaVu Serif", "Times New Roman", serif';
const MACRO = [
  { key: 'p', label: 'Белки', color: '#FF375F' },
  { key: 'f', label: 'Жиры', color: '#FF9F0A' },
  { key: 'c', label: 'Углеводы', color: '#32ADE6' },
];

// Места предметов на посуде: [x, y, размер] в долях диаметра, от центра посуды (y — низ предмета)
const SLOTS = {
  1: [[0, 0.04, 0.62]],
  2: [[-0.22, 0.05, 0.46], [0.22, 0.05, 0.46]],
  3: [[0, -0.05, 0.4], [-0.24, 0.1, 0.4], [0.24, 0.1, 0.4]],
  4: [[-0.22, -0.08, 0.36], [0.22, -0.08, 0.36], [-0.22, 0.12, 0.36], [0.22, 0.12, 0.36]],
  5: [[-0.29, -0.1, 0.31], [0, -0.11, 0.31], [0.29, -0.1, 0.31], [-0.15, 0.12, 0.31], [0.15, 0.12, 0.31]],
};

function Unit({ unit, x, y, size, u }) {
  const isSvg = typeof unit.icon === 'string' && unit.icon.startsWith('svg:');
  const label = `×${unit.badge}`;
  const badgeW = 22 + label.length * 15;
  return (
    <g>
      <ellipse cx={x} cy={y - size * 0.03} rx={size * 0.44} ry={size * 0.1} fill={`url(#${u}sh)`} />
      {isSvg ? (
        <g transform={`translate(${x - size / 2} ${y - size * 0.86})`} style={{ fontSize: size / 1.2 }}>
          <FoodIcon icon={unit.icon} />
        </g>
      ) : (
        <text x={x} y={y - size * 0.1} fontSize={size * 0.82} textAnchor="middle">
          {unit.icon}
        </text>
      )}
      {unit.badge > 0 && (
        <g transform={`translate(${x + size * 0.3 - badgeW / 2} ${y - size * 0.3})`}>
          <rect width={badgeW} height="34" rx="17" fill={BRAND} />
          <text x={badgeW / 2} y="24" fontSize="22" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily={SANS}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

function Vessel({ vessel, cx, cy, D, u }) {
  const slots = SLOTS[Math.min(5, vessel.units.length)] ?? [];
  const placed = vessel.units
    .slice(0, 5)
    .map((unit, i) => ({ unit, slot: slots[i] }))
    .sort((a, b) => a.slot[1] - b.slot[1]);
  const items = placed.map(({ unit, slot }, i) => (
    <Unit
      key={i}
      unit={unit}
      u={u}
      x={cx + slot[0] * D}
      y={cy + slot[1] * D}
      size={D * slot[2] * unit.scale * (vessel.kind === 'bare' ? 1.1 : 1)}
    />
  ));

  if (vessel.kind === 'bare') return <g>{items}</g>;

  if (vessel.kind === 'bowl') {
    const rx = D * 0.44;
    const ry = D * 0.13;
    const depth = D * 0.24;
    const by = cy - D * 0.12;
    const left = cx - rx;
    const right = cx + rx;
    const low = by + depth + ry * 0.9;
    const wall = `M${left} ${by} A${rx} ${ry} 0 0 0 ${right} ${by} C${right - rx * 0.04} ${by + depth * 0.9} ${cx + rx * 0.5} ${low} ${cx} ${low} C${cx - rx * 0.5} ${low} ${left + rx * 0.04} ${by + depth * 0.9} ${left} ${by}Z`;
    return (
      <g>
        <ellipse cx={cx} cy={by + depth + ry * 0.5} rx={rx * 1.08} ry={ry * 1.5} fill={`url(#${u}sh)`} />
        <ellipse cx={cx} cy={by} rx={rx} ry={ry} fill={`url(#${u}bi)`} />
        <g transform={`translate(0 ${-D * 0.12})`}>{items}</g>
        <path d={wall} fill={`url(#${u}bw)`} stroke="rgba(70,90,110,.22)" strokeWidth="1.5" />
        <path d={`M${left} ${by} A${rx} ${ry} 0 0 0 ${right} ${by}`} fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="3" />
      </g>
    );
  }

  const rx = D / 2;
  const ry = D * 0.27;
  return (
    <g>
      <ellipse cx={cx} cy={cy + ry * 0.4} rx={rx * 1.05} ry={ry * 1.05} fill={`url(#${u}sh)`} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${u}pr)`} stroke="rgba(120,100,80,.22)" strokeWidth="1.5" />
      <ellipse cx={cx} cy={cy + ry * 0.04} rx={rx * 0.74} ry={ry * 0.72} fill={`url(#${u}pi)`} stroke="rgba(120,100,80,.12)" strokeWidth="1.5" />
      {items}
    </g>
  );
}

const short = (text, max) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

export function TableScene({ entries, totals, innerRef }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { vessels } = useMemo(() => buildTable(entries), [entries]);
  const geo = sceneGeometry(vessels.length);
  const kcal = Math.round(totals.kcal);

  const names = [...new Set(entries.map((entry) => entry.item.displayName))];
  const shown = names.slice(0, 3).join(', ');
  const caption = short(names.length > 3 ? `${shown} и ещё ${names.length - 3}` : shown, 56);

  const panelX = PAD;
  const panelY = HEAD;
  const panelW = SCENE_W - PAD * 2;

  return (
    <svg
      ref={innerRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${SCENE_W} ${geo.height}`}
      width="100%"
      height="100%"
      role="img"
      aria-label={`Мой стол: примерно ${kcal} ккал. ${caption}`}
    >
      <defs>
        <radialGradient id={`${u}sh`}>
          <stop offset="0" stopColor="#3c2814" stopOpacity="0.34" />
          <stop offset="1" stopColor="#3c2814" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}pr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e4ddd0" />
        </linearGradient>
        <radialGradient id={`${u}pi`}>
          <stop offset="0.5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eeeae1" />
        </radialGradient>
        <linearGradient id={`${u}bw`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8fbfe" />
          <stop offset="1" stopColor="#c3d1de" />
        </linearGradient>
        <linearGradient id={`${u}bi`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b6c6d4" />
          <stop offset="1" stopColor="#dbe4ed" />
        </linearGradient>
        <linearGradient id={`${u}tb`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3e9d8" />
          <stop offset="1" stopColor="#e2d0b1" />
        </linearGradient>
      </defs>

      <rect width={SCENE_W} height={geo.height} fill="#ffffff" />

      <text x={PAD + 12} y="88" fontSize="30" fontWeight="700" letterSpacing="5" fill={BRAND} fontFamily={SANS}>
        МОЙ СТОЛ
      </text>
      <text x={PAD + 12} y="226" fill={BRAND} fontFamily={SANS} fontWeight="800">
        <tspan fontSize="148" letterSpacing="-3">≈ {kcal}</tspan>
        <tspan fontSize="52" fontWeight="700" dx="16">ккал</tspan>
      </text>
      {MACRO.map((macro, i) => {
        const w = macro.key === 'c' ? 300 : 250;
        const x = PAD + 12 + (i === 0 ? 0 : i === 1 ? 266 : 532);
        return (
          <g key={macro.key} transform={`translate(${x} 256)`}>
            <rect width={w} height="52" rx="26" fill={macro.color} />
            <text x={w / 2} y="36" fontSize="26" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily={SANS}>
              {macro.label} {Math.round(totals[macro.key])} г
            </text>
          </g>
        );
      })}
      <text x={PAD + 12} y="350" fontSize="30" fill="#64748b" fontFamily={SANS}>
        {caption}
      </text>

      <rect x={panelX} y={panelY} width={panelW} height={geo.panelH} rx="44" fill={`url(#${u}tb)`} />
      <rect x={panelX + 1.5} y={panelY + 1.5} width={panelW - 3} height={geo.panelH - 3} rx="43" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="3" />
      {vessels.map((vessel, i) => {
        const col = i % geo.cols;
        const row = Math.floor(i / geo.cols);
        // неполный нижний ряд ставим по центру
        const inRow = Math.min(geo.cols, vessels.length - row * geo.cols);
        const shift = ((geo.cols - inRow) * geo.cellW) / 2;
        const cx = panelX + 24 + shift + geo.cellW * (col + 0.5);
        const cy = panelY + 24 + geo.cellH * row + geo.cellH * 0.64;
        return <Vessel key={i} vessel={vessel} cx={cx} cy={cy} D={geo.D} u={u} />;
      })}

      <text x={PAD + 12} y={geo.height - 62} fontSize="64" fontWeight="700" fill={BRAND} fontFamily={SERIF}>
        Kirka
      </text>
      <text x={SCENE_W - PAD - 12} y={geo.height - 70} fontSize="30" fontWeight="600" fill="#334155" textAnchor="end" fontFamily={SANS}>
        kirka-ai.ru
      </text>
      <text x={SCENE_W - PAD - 12} y={geo.height - 34} fontSize="24" fill="#94a3b8" textAnchor="end" fontFamily={SANS}>
        Числа-моменты · значения примерные
      </text>
    </svg>
  );
}
