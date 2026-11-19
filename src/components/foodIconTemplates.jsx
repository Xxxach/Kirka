// Параметрические SVG-иконки продуктов. Строка иконки: 'svg:шаблон:параметр:параметр…'
// Цвета пишутся без #, например 'svg:bar:2B5BA6:5A3420:E64A3C:nuts'.
const h = (v, fallback = '999999') => `#${v || fallback}`;
const SHADE = 'rgba(0,0,0,.28)';
const SHINE = 'rgba(255,255,255,.5)';

const bar = ([wrap, choc, label, kind]) => (
  <g transform="rotate(-14 24 24)">
    <rect x="5" y="13" width="38" height="22" rx="4" fill={h(wrap)} />
    <rect x="31" y="13" width="12" height="22" rx="3.5" fill={h(choc)} />
    <path d="M31 24h12M37 13v22" stroke={SHADE} strokeWidth="1.2" />
    {kind === 'nuts' && [[34, 18], [40, 20], [35, 29], [40, 30]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1.7" fill="#E9C27A" />)}
    {kind === 'wafer' && <path d="M32 18h10M32 30h10" stroke="#E9C27A" strokeWidth="1.6" />}
    {kind === 'caramel' && <path d="M32 20c3 2 6-2 10 0" stroke="#F0B429" strokeWidth="2" fill="none" />}
    <rect x="9" y="18" width="17" height="12" rx="3" fill={h(label)} />
    <path d="M6 15h22" stroke={SHINE} strokeWidth="1.6" strokeLinecap="round" />
  </g>
);

const slice = ([sponge, cream, top, deco]) => (
  <g>
    <ellipse cx="24" cy="41" rx="20" ry="3" fill={SHADE} opacity=".35" />
    <path d="M5 24 12 13h33l-6 11z" fill={h(top)} />
    <rect x="5" y="24" width="34" height="16" rx="2.5" fill={h(sponge)} />
    <rect x="5" y="30" width="34" height="4" fill={h(cream)} />
    <path d="M39 24 45 13v16l-6 11z" fill={h(sponge)} />
    <path d="M39 24 45 13v16l-6 11z" fill={SHADE} opacity=".25" />
    {deco === 'cherry' && <><circle cx="25" cy="15" r="3.2" fill="#C8102E" /><path d="M25 12c1-3 3-3 4-4" stroke="#3E7B27" strokeWidth="1.3" fill="none" /></>}
    {deco === 'berry' && [[19, 16], [26, 17], [32, 15]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="2.5" fill="#B3123A" />)}
    {deco === 'dust' && [[16, 17], [22, 15], [28, 17], [34, 15], [24, 19]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1" fill="#fff" opacity=".8" />)}
    {deco === 'drip' && <path d="M5 24h34v3c-3 2-4-1-7 1s-3 3-6 1-5 1-8-1-5 2-8 0-5 1-5 0z" fill={h(top)} />}
    {deco === 'stripe' && <path d="M8 22 15 15M18 22 25 15M28 22 35 15" stroke="rgba(255,255,255,.5)" strokeWidth="1.6" />}
  </g>
);

const roll = ([sponge, cream]) => (
  <g>
    <ellipse cx="24" cy="40" rx="18" ry="3" fill={SHADE} opacity=".3" />
    <rect x="6" y="14" width="32" height="24" rx="12" fill={h(sponge)} />
    <ellipse cx="38" cy="26" rx="8" ry="12" fill={h(cream)} />
    <ellipse cx="38" cy="26" rx="8" ry="12" fill="none" stroke={h(sponge)} strokeWidth="2" />
    <path d="M38 26m-2 0a2 4 0 1 1 4 0 4 7 0 1 1-8 0" fill="none" stroke={h(sponge)} strokeWidth="1.8" />
  </g>
);

const bowl = ([broth, garnish]) => (
  <g>
    <path d="M4 22h40c0 11-8 19-20 19S4 33 4 22z" fill="#F6F2EA" stroke="#B9B2A6" strokeWidth="1.5" />
    <ellipse cx="24" cy="22" rx="20" ry="5.2" fill={h(broth)} />
    <ellipse cx="24" cy="22" rx="20" ry="5.2" fill="none" stroke="#B9B2A6" strokeWidth="1.5" />
    {garnish === 'cream' && <circle cx="24" cy="21.5" r="3.2" fill="#FFF8EA" />}
    {garnish === 'herb' && [[16, 22], [22, 20], [28, 23], [33, 21]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.5" fill="#3E7B27" />)}
    {garnish === 'balls' && [[17, 22], [24, 21], [31, 22.5]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="2.6" fill="#B07A45" />)}
    {garnish === 'noodle' && <path d="M12 22c3-3 5 2 8-1s5 2 8-1 5 2 8-1" stroke="#F3DFA2" strokeWidth="1.6" fill="none" />}
    {garnish === 'oil' && [[16, 21], [24, 23], [31, 21]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.3" fill="#F6C94A" opacity=".8" />)}
    <path d="M17 12c-2-2 2-3 0-6M25 12c-2-2 2-3 0-6M33 12c-2-2 2-3 0-6" stroke="#B9B2A6" strokeWidth="1.4" strokeLinecap="round" fill="none" />
  </g>
);

const cut = ([color, edge, kind]) => (
  <g>
    <path d="M7 28C5 17 14 10 26 11c11 1 17 8 15 18-2 8-12 10-21 9-7-1-12-4-13-10z" fill={h(color)} stroke={h(edge)} strokeWidth="2" strokeLinejoin="round" />
    {kind === 'grill' && <path d="M15 17 24 30M22 14 32 28M29 14 37 24" stroke="rgba(40,20,10,.55)" strokeWidth="2.2" strokeLinecap="round" />}
    {kind === 'bone' && <><circle cx="35" cy="24" r="4.2" fill="#F7EFE0" stroke={h(edge)} strokeWidth="1.5" /><circle cx="35" cy="24" r="1.6" fill={h(edge)} /></>}
    {kind === 'liver' && [[16, 22], [25, 27], [30, 18], [20, 31]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.4" fill="rgba(0,0,0,.28)" />)}
    {kind === 'marble' && <path d="M12 20c5-3 8 2 13-1M16 30c5-3 9 1 15-2" stroke="rgba(255,235,220,.8)" strokeWidth="2" fill="none" strokeLinecap="round" />}
    {kind === 'crust' && [[16, 20], [24, 17], [31, 22], [22, 29], [30, 30]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1.2" fill="rgba(255,225,150,.7)" />)}
    <path d="M12 16c3-3 8-4 12-4" stroke={SHINE} strokeWidth="2" strokeLinecap="round" fill="none" />
  </g>
);

const mince = ([color]) => (
  <g>
    <path d="M5 38C5 22 14 12 24 12s19 10 19 26z" fill={h(color)} />
    {[[14, 32], [20, 26], [26, 31], [32, 25], [24, 20], [35, 33], [17, 36], [29, 36]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="3" fill="rgba(0,0,0,.18)" />)}
    {[[16, 30], [22, 24], [28, 29], [34, 23], [26, 18]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1.3" fill={SHINE} />)}
  </g>
);

const drum = ([skin, edge, kind]) => (
  <g>
    {kind === 'nug' ? (
      <>
        <rect x="6" y="14" width="22" height="20" rx="8" fill={h(skin)} stroke={h(edge)} strokeWidth="2" />
        <rect x="20" y="22" width="22" height="18" rx="8" fill={h(skin)} stroke={h(edge)} strokeWidth="2" />
        {[[12, 20], [18, 28], [27, 30], [34, 34]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.3" fill="rgba(255,225,150,.8)" />)}
      </>
    ) : (
      <>
        <path d="M30 28 40 38" stroke="#F7EFE0" strokeWidth="5" strokeLinecap="round" />
        <circle cx="41" cy="41" r="3.2" fill="#F7EFE0" /><circle cx="38" cy="43" r="2.6" fill="#F7EFE0" />
        <ellipse cx="20" cy="19" rx="14" ry="12" transform="rotate(35 20 19)" fill={h(skin)} stroke={h(edge)} strokeWidth="2" />
        {kind === 'crispy' && [[14, 16], [20, 12], [24, 21], [15, 24]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1.3" fill="rgba(255,225,150,.8)" />)}
        <path d="M11 14c2-3 6-4 9-3" stroke={SHINE} strokeWidth="2" strokeLinecap="round" fill="none" />
      </>
    )}
  </g>
);

const fish = ([body, belly, kind]) => (
  <g>
    <path d="M4 24C10 13 25 11 33 20l10-9v26l-10-9C25 37 10 35 4 24z" fill={h(body)} stroke="rgba(0,0,0,.25)" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 27c6 7 18 8 25 1-8 3-17 3-25-1z" fill={h(belly)} />
    <circle cx="12" cy="22" r="1.8" fill="#222" />
    {kind === 'stripes' && <path d="M17 16c2 4 2 9 0 14M23 15c2 4 2 10 0 16M29 17c2 3 2 7 0 11" stroke="rgba(20,40,60,.55)" strokeWidth="1.8" fill="none" strokeLinecap="round" />}
    {kind === 'dots' && [[18, 20], [24, 18], [29, 22], [22, 25], [17, 26]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1.2" fill="rgba(90,30,20,.7)" />)}
    {kind === 'crisp' && [[16, 19], [22, 17], [28, 21], [20, 26], [27, 26]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1.5" fill="rgba(255,230,160,.8)" />)}
    <path d="M12 17c4-3 10-3 14-1" stroke={SHINE} strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </g>
);

const can = ([color, band, kind]) => (
  <g>
    {kind === 'bottle' ? (
      <>
        <rect x="19" y="4" width="10" height="7" rx="2" fill={h(band)} />
        <path d="M20 11h8c0 5 6 6 6 12v17a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V23c0-6 6-7 6-12z" fill={h(color)} />
        <rect x="14" y="26" width="20" height="9" fill={h(band)} />
      </>
    ) : (
      <>
        <rect x="14" y="7" width="20" height="35" rx="4" fill={h(color)} />
        <ellipse cx="24" cy="8" rx="9.5" ry="2.6" fill="#D8DCE0" stroke="#9AA0A6" strokeWidth="1" />
        <rect x="14" y="21" width="20" height="9" fill={h(band)} />
      </>
    )}
    <path d="M18 14v24" stroke={SHINE} strokeWidth="2.4" strokeLinecap="round" />
  </g>
);

const glass = ([liquid, kind]) => (
  <g>
    {kind === 'straw' && <path d="M29 4 25 22" stroke="#E8505B" strokeWidth="2.6" strokeLinecap="round" />}
    <path d="M10 10h28l-3.5 29a3 3 0 0 1-3 2.6h-15a3 3 0 0 1-3-2.6z" fill="rgba(210,230,240,.55)" stroke="#9FB6C4" strokeWidth="1.6" />
    <path d="M11.2 19h25.6l-2.3 20a3 3 0 0 1-3 2.6h-15a3 3 0 0 1-3-2.6z" fill={h(liquid)} />
    {kind === 'foam' && <path d="M10.6 10c2-4 6-4 8 0 2-4 6-4 8 0 2-3 5-3 6 0l-.6 6H11.2z" fill="#FFF8EA" />}
    {kind === 'fruit' && <><circle cx="38" cy="12" r="5" fill="#F7C948" stroke="#E09B1A" strokeWidth="1.5" /><path d="M38 7v10M33 12h10" stroke="#E09B1A" strokeWidth="1" /></>}
    <path d="M15 22v14" stroke={SHINE} strokeWidth="2.2" strokeLinecap="round" />
  </g>
);

const mug = ([liquid, foam]) => (
  <g>
    <path d="M36 16h3a5 5 0 0 1 0 14h-4" stroke="#9FB6C4" strokeWidth="3" fill="none" />
    <path d="M8 11h28l-2 28a3 3 0 0 1-3 2.8H13a3 3 0 0 1-3-2.8z" fill="rgba(210,230,240,.6)" stroke="#9FB6C4" strokeWidth="1.6" />
    <path d="M9.4 18h25.2l-1.4 21a3 3 0 0 1-3 2.8H13.8a3 3 0 0 1-3-2.8z" fill={h(liquid)} />
    <path d="M8.5 11c2-5 7-5 9-1 2-4 8-4 9 0 2-3 7-2 9 1z" fill={h(foam, 'FFF8EA')} />
  </g>
);

const cup = ([liquid, foam, extra]) => (
  <g>
    <path d="M7 20h28v9a12 12 0 0 1-12 12h-4A12 12 0 0 1 7 29z" fill="#F6F2EA" stroke="#B9B2A6" strokeWidth="1.6" />
    <path d="M35 22h2.5a5 5 0 0 1 0 10H34" stroke="#B9B2A6" strokeWidth="2.6" fill="none" />
    <ellipse cx="21" cy="20" rx="14" ry="3.6" fill={h(liquid)} />
    {foam && foam !== 'none' && <ellipse cx="21" cy="19.6" rx="9.5" ry="2.3" fill={h(foam)} />}
    {extra === 'heart' && <path d="M21 21c-3-2-4-3-3-4s2.5-.5 3 .5c.5-1 2-1.5 3-.5s0 2-3 4z" fill={h(liquid)} />}
    {extra === 'cube' && <rect x="31" y="27" width="6" height="6" rx="1" fill="#fff" stroke="#C9C2B5" transform="translate(-1 12)" />}
    {extra === 'swirl' && <path d="M14 20c4-2 6 1 10-1" stroke="#FFF8EA" strokeWidth="1.5" fill="none" />}
    <path d="M14 14c-2-2 2-3 0-6M22 14c-2-2 2-3 0-6M30 14c-2-2 2-3 0-6" stroke="#B9B2A6" strokeWidth="1.4" strokeLinecap="round" fill="none" />
  </g>
);

const cookie = ([base, chip, kind]) => (
  <g>
    {kind === 'wafer' ? (
      <>
        <rect x="7" y="9" width="34" height="30" rx="5" fill={h(base)} />
        <path d="M7 19h34M7 29h34M18 9v30M30 9v30" stroke="rgba(120,70,20,.5)" strokeWidth="1.6" />
      </>
    ) : kind === 'cracker' ? (
      <>
        <rect x="8" y="9" width="32" height="30" rx="3" fill={h(base)} />
        {[[16, 16], [24, 16], [32, 16], [16, 24], [24, 24], [32, 24], [16, 32], [24, 32], [32, 32]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1.5" fill="rgba(120,70,20,.5)" />)}
      </>
    ) : kind === 'sandwich' ? (
      <>
        <circle cx="24" cy="24" r="17" fill={h(base)} />
        <circle cx="24" cy="24" r="12.5" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.4" />
        <circle cx="24" cy="24" r="7" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="1.4" />
        <path d="M9 28c3 6 9 10 15 10s12-4 15-10" stroke={h(chip, 'FFFFFF')} strokeWidth="2.4" fill="none" />
      </>
    ) : (
      <>
        <circle cx="24" cy="24" r="17" fill={h(base)} />
        {kind === 'iced' && <circle cx="24" cy="24" r="11" fill="none" stroke={h(chip)} strokeWidth="2.6" strokeDasharray="4 3" />}
        {kind === 'chips' && [[17, 17], [29, 16], [24, 26], [15, 28], [31, 29], [22, 33]].map(([x, y]) => <rect key={x + y} x={x - 2.2} y={y - 2} width="4.4" height="4" rx="1" fill={h(chip)} />)}
        {kind === 'oat' && [[16, 18], [28, 17], [24, 25], [17, 30], [31, 28]].map(([x, y]) => <ellipse key={x + y} cx={x} cy={y} rx="3" ry="1.6" fill={h(chip)} opacity=".7" />)}
        {kind === 'emboss' && <path d="M14 20h20M14 28h20M18 14v20M30 14v20" stroke={h(chip)} strokeWidth="1.2" opacity=".6" />}
        <path d="M12 16c3-4 7-6 12-6" stroke={SHINE} strokeWidth="2" strokeLinecap="round" fill="none" />
      </>
    )}
  </g>
);

const sweet = ([kind, c1, c2, c3]) => (
  <g>
    {kind === 'wrap' && (
      <>
        <path d="M4 14 14 24 4 34zM44 14 34 24 44 34z" fill={h(c1)} opacity=".85" />
        <ellipse cx="24" cy="24" rx="14" ry="10" fill={h(c1)} />
        <ellipse cx="24" cy="24" rx="14" ry="10" fill="none" stroke={SHADE} strokeWidth="1" />
        <path d="M14 20c4-3 12-3 16 0" stroke={SHINE} strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="24" cy="24" r="4" fill={h(c2)} />
      </>
    )}
    {kind === 'ball' && (
      <>
        <circle cx="24" cy="25" r="15" fill={h(c1)} />
        <path d="M12 20c4-5 10-7 16-5M13 30c3 4 9 6 15 4" stroke={SHINE} strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="24" cy="10" r="2.6" fill={h(c2)} />
        {[[16, 24], [24, 20], [30, 27], [22, 30]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1.3" fill={h(c2)} opacity=".6" />)}
      </>
    )}
    {kind === 'cube' && (
      <>
        <rect x="9" y="12" width="30" height="26" rx="5" fill={h(c1)} />
        {[[16, 19], [24, 17], [32, 20], [18, 28], [27, 27], [33, 32], [15, 33]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1.3" fill={h(c2, 'FFFFFF')} opacity=".85" />)}
      </>
    )}
    {kind === 'dots' && [[14, 16, c1], [26, 12, c2], [35, 20, c3], [18, 28, c3], [30, 31, c1], [22, 38, c2], [38, 36, c2], [8, 33, c2]].map(([x, y, c]) => (
      <circle key={x + y} cx={x} cy={y} r="5" fill={h(c)} stroke="rgba(0,0,0,.2)" strokeWidth="1" />
    ))}
    {kind === 'stack' && (
      <>
        <rect x="8" y="26" width="32" height="11" rx="3" fill={h(c1)} />
        <rect x="11" y="16" width="26" height="11" rx="3" fill={h(c2)} />
        <rect x="14" y="7" width="20" height="10" rx="3" fill={h(c3)} />
        <path d="M11 30h26M15 20h18M18 10h12" stroke={SHINE} strokeWidth="1.4" />
      </>
    )}
    {kind === 'puff' && (
      <>
        <rect x="10" y="10" width="28" height="28" rx="12" fill={h(c1)} />
        <path d="M16 18c3-3 8-3 12-1" stroke="rgba(255,255,255,.7)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <rect x="10" y="10" width="28" height="28" rx="12" fill="none" stroke={SHADE} strokeWidth="1" opacity=".5" />
      </>
    )}
    {kind === 'slab' && (
      <>
        <path d="M6 14h36l-4 22H10z" fill={h(c1)} />
        <path d="M6 14h36" stroke={h(c2)} strokeWidth="5" />
        {[[16, 25], [26, 22], [33, 28], [21, 31]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1.6" fill={h(c2)} opacity=".7" />)}
      </>
    )}
  </g>
);

const jar = ([lid, content, label]) => (
  <g>
    <rect x="12" y="6" width="24" height="8" rx="2.5" fill={h(lid)} />
    <path d="M13 14h22c3 3 4 5 4 9v14a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4V23c0-4 1-6 4-9z" fill={h(content)} />
    <rect x="9" y="22" width="30" height="14" fill={h(label)} />
    <path d="M14 18v22" stroke={SHINE} strokeWidth="2.4" strokeLinecap="round" />
  </g>
);

const templates = { bar, slice, roll, bowl, cut, mince, drum, fish, can, glass, mug, cup, cookie, sweet, jar };

export function ParamIcon({ icon }) {
  const [name, ...params] = icon.slice(4).split(':');
  const Template = templates[name];
  if (!Template) return null;
  return (
    <svg viewBox="0 0 48 48" width="1.2em" height="1.2em" aria-hidden="true" focusable="false">
      {Template(params)}
    </svg>
  );
}
