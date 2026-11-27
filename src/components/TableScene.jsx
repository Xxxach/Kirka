import { useId, useMemo } from 'react';
import { FoodIcon } from './FoodIcon';
import { composeTable, SCENE_W, PAD, HEAD, INNER } from '../data/tableLayout';

// Картинка «Стол»: одна самодостаточная SVG (цвета заданы прямо в разметке, без CSS-классов),
// чтобы её можно было показать в окне и превратить в PNG для «Поделиться».
const LIGHT = { bg: '#ffffff', brand: '#7A2432', badge: '#7A2432', caption: '#64748b', strong: '#334155', soft: '#94a3b8' };
const DARK = { bg: '#121214', brand: '#60a5fa', badge: '#2563eb', caption: '#9ca3af', strong: '#e5e7eb', soft: '#6b7280' };
const SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const SERIF = 'Georgia, "DejaVu Serif", "Times New Roman", serif';
const MACRO = [
  { key: 'p', label: 'Белки', color: '#FF375F' },
  { key: 'f', label: 'Жиры', color: '#FF9F0A' },
  { key: 'c', label: 'Углеводы', color: '#32ADE6' },
];

// Пирамидка из кусочков рафинада: ряды по убыванию, каждый кубик с гранями
function SugarPyramid({ cubes, x, y, size }) {
  let base = 1;
  while ((base * (base + 1)) / 2 < cubes) base += 1;
  const w = Math.min(34, (size * 1.3) / base);
  const h = w * 0.78;
  const d = w * 0.3;
  const parts = [];
  let left = cubes;
  for (let row = 0; row < base && left > 0; row += 1) {
    const inRow = Math.min(base - row, left);
    left -= inRow;
    for (let j = 0; j < inRow; j += 1) {
      const cx = x + (j - (inRow - 1) / 2) * w;
      const top = y - (row + 1) * h;
      parts.push(
        <g key={`${row}-${j}`}>
          <rect x={cx - w / 2} y={top} width={w} height={h} fill="#fdfdfe" stroke="#cfd6df" strokeWidth="1.2" />
          <polygon points={`${cx - w / 2},${top} ${cx - w / 2 + d},${top - d} ${cx + w / 2 + d},${top - d} ${cx + w / 2},${top}`} fill="#ffffff" stroke="#cfd6df" strokeWidth="1.2" />
          <polygon points={`${cx + w / 2},${top} ${cx + w / 2 + d},${top - d} ${cx + w / 2 + d},${top + h - d} ${cx + w / 2},${top + h}`} fill="#e3e8ef" stroke="#cfd6df" strokeWidth="1.2" />
        </g>,
      );
    }
  }
  return <g>{parts}</g>;
}

function Unit({ placed, u, badge }) {
  const { unit, x, y, size } = placed;
  const isSvg = typeof unit.icon === 'string' && unit.icon.startsWith('svg:');
  const label = `×${unit.badge}`;
  const badgeW = 22 + label.length * 15;
  return (
    <g>
      <ellipse cx={x} cy={y - size * 0.03} rx={size * 0.44} ry={size * 0.1} fill={`url(#${u}sh)`} />
      {unit.pyramid ? (
        <SugarPyramid cubes={unit.pyramid} x={x} y={y - size * 0.02} size={size} />
      ) : isSvg ? (
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
          <rect width={badgeW} height="34" rx="17" fill={badge} />
          <text x={badgeW / 2} y="24" fontSize="22" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily={SANS}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

const sorted = (placed) => [...placed].sort((a, b) => a.y - b.y);

function PlateShape({ cx, cy, D, u, deep, blue }) {
  const rx = D / 2;
  const ry = D * 0.27;
  return (
    <g>
      <ellipse cx={cx} cy={cy + ry * 0.4} rx={rx * 1.05} ry={ry * 1.05} fill={`url(#${u}sh)`} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${u}${blue ? 'prb' : 'pr'})`} stroke="rgba(110,90,70,.3)" strokeWidth="1.5" />
      <ellipse cx={cx} cy={cy + ry * 0.04} rx={rx * 0.74} ry={ry * 0.72} fill={`url(#${u}${blue ? 'pib' : deep ? 'pd' : 'pi'})`} stroke="rgba(120,100,80,.12)" strokeWidth="1.5" />
    </g>
  );
}

// Вилка слева, нож и ложка справа от тарелки
function Cutlery({ cx, cy, D, u }) {
  const metal = `url(#${u}mt)`;
  const piece = (x, key, shapes) => (
    <g key={key} transform={`translate(${x} ${cy + 8}) scale(1 .82)`}>
      <g transform="translate(6 8)" fill="#3c2814" opacity="0.15">
        {shapes}
      </g>
      <g fill={metal} stroke="rgba(90,100,112,.35)" strokeWidth="1">
        {shapes}
      </g>
    </g>
  );
  const fork = (
    <>
      <path d="M-6 -20 C-6 20 -8 60 -8 118 Q-8 132 0 132 Q8 132 8 118 C8 60 6 20 6 -20 Z" />
      <rect x="-19" y="-72" width="38" height="58" rx="14" />
      {[-19, -8.3, 2.3, 13].map((x) => (
        <rect key={x} x={x} y="-124" width="6" height="58" rx="3" />
      ))}
    </>
  );
  const knife = (
    <>
      <path d="M-9 -126 C6 -126 11 -104 11 -70 L11 -10 L-9 -10 Z" />
      <rect x="-8" y="-12" width="16" height="144" rx="8" />
    </>
  );
  const spoon = (
    <>
      <ellipse cx="0" cy="-84" rx="21" ry="38" />
      <path d="M-4 -48 C-4 -10 -9 60 -8 112 Q-8 132 0 132 Q8 132 8 112 C9 60 4 -10 4 -48 Z" />
    </>
  );
  return (
    <g>
      {piece(cx - D / 2 - 46, 'fork', fork)}
      {piece(cx + D / 2 + 32, 'knife', knife)}
      {piece(cx + D / 2 + 74, 'spoon', spoon)}
    </g>
  );
}

function Setting({ node, u, badge }) {
  return (
    <g>
      <rect x={node.mat.x} y={node.mat.y} width={node.mat.w} height={node.mat.h} rx="30" fill="#f7f1e4" stroke="rgba(110,85,50,.22)" strokeWidth="2" />
      <rect x={node.mat.x + 12} y={node.mat.y + 12} width={node.mat.w - 24} height={node.mat.h - 24} rx="22" fill="none" stroke="rgba(122,36,50,.28)" strokeWidth="2" strokeDasharray="7 7" />
      <PlateShape cx={node.cx} cy={node.cy} D={node.D} u={u} />
      <Cutlery cx={node.cx} cy={node.cy} D={node.D} u={u} />
      {sorted(node.placed).map((p, i) => (
        <Unit key={i} placed={p} u={u} badge={badge} />
      ))}
    </g>
  );
}

// Глубокая тёмно-бежевая миска для фруктов
function Bowl({ node, u, badge }) {
  const { cx, cy, D } = node;
  const veg = node.tone === 'veg';
  const rx = D * 0.5;
  const ry = D * 0.14;
  const depth = D * 0.42;
  const left = cx - rx;
  const right = cx + rx;
  const low = cy + depth + ry * 0.85;
  const wall = `M${left} ${cy} A${rx} ${ry} 0 0 0 ${right} ${cy} C${right - rx * 0.05} ${cy + depth * 0.95} ${cx + rx * 0.55} ${low} ${cx} ${low} C${cx - rx * 0.55} ${low} ${left + rx * 0.05} ${cy + depth * 0.95} ${left} ${cy}Z`;
  return (
    <g>
      <ellipse cx={cx} cy={cy + depth + ry * 0.45} rx={rx * 1.02} ry={ry * 1.4} fill={`url(#${u}sh)`} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${u}${veg ? 'biv' : 'bi'})`} />
      {sorted(node.placed).map((p, i) => (
        <Unit key={i} placed={p} u={u} badge={badge} />
      ))}
      <path d={wall} fill={`url(#${u}${veg ? 'bwv' : 'bw'})`} stroke={veg ? 'rgba(35,55,95,.35)' : 'rgba(80,60,35,.3)'} strokeWidth="1.5" />
      <path d={`M${left + rx * 0.12} ${cy + depth * 0.55} C${left + rx * 0.3} ${cy + depth * 0.85} ${cx - rx * 0.3} ${low - 6} ${cx - rx * 0.05} ${low - 4}`} fill="none" stroke={veg ? 'rgba(230,240,255,.4)' : 'rgba(255,240,215,.35)'} strokeWidth="4" strokeLinecap="round" />
      <path d={`M${left} ${cy} A${rx} ${ry} 0 0 0 ${right} ${cy}`} fill="none" stroke={veg ? 'rgba(232,241,255,.9)' : 'rgba(255,243,222,.85)'} strokeWidth="3" />
    </g>
  );
}

const inset = (points, t) => {
  const cx = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p[1], 0) / points.length;
  return points.map(([x, y]) => `${cx + (x - cx) * (1 - t)},${cy + (y - cy) * (1 - t)}`).join(' ');
};

// Прямоугольный лоток из картонной бумаги с тёмно-винными полосками по краям (для фастфуда)
function Tray({ node, u, badge }) {
  const { cx, cy, w, h } = node;
  const pts = [
    [cx - w / 2 + 18, cy - h / 2],
    [cx + w / 2 - 18, cy - h / 2],
    [cx + w / 2, cy + h / 2],
    [cx - w / 2, cy + h / 2],
  ];
  return (
    <g>
      <ellipse cx={cx} cy={cy + h / 2 - 4} rx={w * 0.54} ry={h * 0.22} fill={`url(#${u}sh)`} />
      <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={`url(#${u}kr)`} stroke="rgba(110,80,40,.35)" strokeWidth="2" strokeLinejoin="round" />
      <polygon points={inset(pts, 0.075)} fill="none" stroke="#6E1F2D" strokeWidth="7" strokeLinejoin="round" />
      <polygon points={inset(pts, 0.135)} fill="none" stroke="#6E1F2D" strokeWidth="3.5" strokeLinejoin="round" />
      {sorted(node.placed).map((p, i) => (
        <Unit key={i} placed={p} u={u} badge={badge} />
      ))}
    </g>
  );
}

const short = (text, max) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

export function TableScene({ entries, totals, innerRef, dark = false }) {
  const pal = dark ? DARK : LIGHT;
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { layout } = useMemo(() => composeTable(entries), [entries]);
  const kcal = Math.round(totals.kcal);

  const names = [...new Set(entries.map((entry) => entry.item.displayName))];
  const shown = names.slice(0, 3).join(', ');
  const caption = short(names.length > 3 ? `${shown} и ещё ${names.length - 3}` : shown, 56);

  const panelX = PAD;
  const panelY = HEAD;
  const panelW = SCENE_W - PAD * 2;
  const originX = panelX + INNER;
  const originY = panelY + INNER;
  const seams = [];
  for (let y = 150; y < layout.panelH - 20; y += 150) seams.push(y);

  return (
    <svg
      ref={innerRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${SCENE_W} ${layout.height}`}
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
        <linearGradient id={`${u}prb`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9bfe3" />
          <stop offset="1" stopColor="#6f8fc4" />
        </linearGradient>
        <radialGradient id={`${u}pib`}>
          <stop offset="0.4" stopColor="#8aa6d3" />
          <stop offset="1" stopColor="#6f8fc4" />
        </radialGradient>
        <radialGradient id={`${u}pd`} cy="0.35">
          <stop offset="0.3" stopColor="#f6f2ea" />
          <stop offset="1" stopColor="#ddd6c8" />
        </radialGradient>
        <linearGradient id={`${u}bwv`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#97b1da" />
          <stop offset="1" stopColor="#5a7bb2" />
        </linearGradient>
        <linearGradient id={`${u}biv`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#456190" />
          <stop offset="1" stopColor="#7a95c2" />
        </linearGradient>
        <linearGradient id={`${u}bw`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6bf9c" />
          <stop offset="1" stopColor="#9c8160" />
        </linearGradient>
        <linearGradient id={`${u}bi`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d6546" />
          <stop offset="1" stopColor="#a58b69" />
        </linearGradient>
        <linearGradient id={`${u}kr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ead7b4" />
          <stop offset="1" stopColor="#d6bb8f" />
        </linearGradient>
        <linearGradient id={`${u}mt`} gradientUnits="userSpaceOnUse" x1="-22" y1="0" x2="22" y2="0">
          <stop offset="0" stopColor="#fbfcfd" />
          <stop offset="0.5" stopColor="#b9c1ca" />
          <stop offset="1" stopColor="#e9ecef" />
        </linearGradient>
        <linearGradient id={`${u}tb`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8f1e4" />
          <stop offset="1" stopColor="#ecdfca" />
        </linearGradient>
      </defs>

      <rect width={SCENE_W} height={layout.height} fill={pal.bg} />

      <text x={PAD + 12} y="88" fontSize="30" fontWeight="700" letterSpacing="5" fill={pal.brand} fontFamily={SANS}>
        МОЙ СТОЛ
      </text>
      <text x={PAD + 12} y="226" fill={pal.brand} fontFamily={SANS} fontWeight="800">
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
      <text x={PAD + 12} y="350" fontSize="30" fill={pal.caption} fontFamily={SANS}>
        {caption}
      </text>

      <rect x={panelX} y={panelY} width={panelW} height={layout.panelH} rx="44" fill={`url(#${u}tb)`} />
      {seams.map((y) => (
        <path key={y} d={`M${panelX + 40} ${panelY + y} H${panelX + panelW - 40}`} stroke="rgba(120,90,55,.1)" strokeWidth="2.5" strokeLinecap="round" />
      ))}
      <rect x={panelX + 1.5} y={panelY + 1.5} width={panelW - 3} height={layout.panelH - 3} rx="43" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="3" />

      <g transform={`translate(${originX} ${originY})`}>
        {layout.nodes.map((node, i) => {
          if (node.type === 'setting') return <Setting key={i} node={node} u={u} badge={pal.badge} />;
          if (node.type === 'bowl') return <Bowl key={i} node={node} u={u} badge={pal.badge} />;
          if (node.type === 'tray') return <Tray key={i} node={node} u={u} badge={pal.badge} />;
          if (node.type === 'drink') return <Unit key={i} placed={{ unit: node.unit, x: node.x, y: node.y, size: node.size }} u={u} badge={pal.badge} />;
          if (node.type === 'sauce') {
            return (
              <g key={i}>
                {node.placed.map((p, j) => (
                  <Unit key={j} placed={p} u={u} badge={pal.badge} />
                ))}
              </g>
            );
          }
          return (
            <g key={i}>
              <PlateShape cx={node.cx} cy={node.cy} D={node.D} u={u} deep={node.kind === 'dish'} blue={node.tone === 'blue'} />
              {sorted(node.placed).map((p, j) => (
                <Unit key={j} placed={p} u={u} badge={pal.badge} />
              ))}
            </g>
          );
        })}
      </g>

      <text x={PAD + 12} y={layout.height - 62} fontSize="64" fontWeight="700" fill={pal.brand} fontFamily={SERIF}>
        Kirka
      </text>
      <text x={SCENE_W - PAD - 12} y={layout.height - 70} fontSize="30" fontWeight="600" fill={pal.strong} textAnchor="end" fontFamily={SANS}>
        kirka-ai.ru
      </text>
      <text x={SCENE_W - PAD - 12} y={layout.height - 34} fontSize="24" fill={pal.soft} textAnchor="end" fontFamily={SANS}>
        Числа-моменты · значения примерные
      </text>
    </svg>
  );
}
