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
    {garnish === 'egg' && <><ellipse cx="29" cy="21" rx="5" ry="3" fill="#FFF8EA" stroke="#D9CDB0" strokeWidth=".8" /><circle cx="29" cy="21" r="1.8" fill="#F2A81D" /></>}
    {garnish === 'butter' && <rect x="20" y="19.5" width="8" height="5" rx="1.5" fill="#F6D04D" />}
    {garnish === 'jam' && <circle cx="24" cy="21.5" r="3.4" fill="#B3123A" />}
    {garnish === 'berry' && [[18, 21], [24, 22.5], [30, 21]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="2" fill="#C2185B" />)}
    {garnish === 'seeds' && [[16, 22], [22, 20], [28, 23], [33, 21]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.1" fill="#8A6A3A" />)}
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
        <path d="M20 11h8c0 5 6 6 6 12v17a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V23c0-6 6-7 6-12z" fill={h(color)} stroke="rgba(0,0,0,.18)" strokeWidth="1.2" />
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


const HEAP = [[14, 35], [20, 37], [27, 36], [33, 35], [38, 34], [9, 37], [17, 30], [24, 31], [31, 30], [36, 29], [15, 24], [22, 25], [29, 24], [34, 23], [21, 18], [27, 18], [24, 14], [12, 31]];
const heap = ([base, grain, kind]) => (
  <g>
    <path d="M3 41C3 23 13 11 24 11s21 12 21 30z" fill={h(base)} stroke="rgba(0,0,0,.14)" strokeWidth="1.4" />
    {HEAP.map(([x, y], i) => {
      const rot = (i * 47) % 180;
      if (kind === 'ball') return <circle key={i} cx={x} cy={y} r="1.6" fill={h(grain)} />;
      if (kind === 'round') return <circle key={i} cx={x} cy={y} r="2.5" fill={h(grain)} stroke="rgba(0,0,0,.18)" strokeWidth=".8" />;
      if (kind === 'flake') return <ellipse key={i} cx={x} cy={y} rx="3.4" ry="1.8" transform={`rotate(${rot} ${x} ${y})`} fill={h(grain)} stroke="rgba(0,0,0,.12)" strokeWidth=".7" />;
      if (kind === 'kidney') return <ellipse key={i} cx={x} cy={y} rx="3.4" ry="2.2" transform={`rotate(${rot} ${x} ${y})`} fill={h(grain)} stroke="rgba(0,0,0,.2)" strokeWidth=".8" />;
      return <ellipse key={i} cx={x} cy={y} rx="2.8" ry="1.3" transform={`rotate(${rot} ${x} ${y})`} fill={h(grain)} stroke="rgba(0,0,0,.12)" strokeWidth=".6" />;
    })}
  </g>
);

const carton = ([body, label, , kind]) => (
  <g>
    <polygon points="13,17 17,8 31,8 35,17" fill={h(body)} stroke="rgba(0,0,0,.18)" strokeWidth="1.2" strokeLinejoin="round" />
    <rect x="17" y="5" width="14" height="4" rx="1" fill={h(body)} stroke="rgba(0,0,0,.18)" strokeWidth="1.2" />
    <rect x="13" y="17" width="22" height="25" rx="2" fill={h(body)} stroke="rgba(0,0,0,.18)" strokeWidth="1.2" />
    <rect x="13" y="24" width="22" height="12" fill={h(label)} />
    {kind === 'drop' && <path d="M24 26c3 4 4 5 4 7a4 4 0 0 1-8 0c0-2 1-3 4-7z" fill="#fff" opacity=".9" />}
    <path d="M16 20v20" stroke={SHINE} strokeWidth="2" strokeLinecap="round" />
  </g>
);

const tub = ([body, lid, fruit]) => (
  <g>
    <path d="M10 16h28l-3 24a3 3 0 0 1-3 2.6H16a3 3 0 0 1-3-2.6z" fill={h(body)} stroke="rgba(0,0,0,.18)" strokeWidth="1.2" />
    <rect x="8.5" y="11" width="31" height="6" rx="2.5" fill={h(lid)} />
    <path d="M11.5 27h25l-.7 6h-23.6z" fill={h(lid)} opacity=".85" />
    <circle cx="24" cy="30" r="4.2" fill={h(fruit)} stroke="rgba(0,0,0,.2)" strokeWidth="1" />
    <path d="M15 21v16" stroke={SHINE} strokeWidth="2" strokeLinecap="round" />
  </g>
);

const veg = ([kind, c1, c2]) => (
  <g>
    {kind === 'head' && (
      <>
        <circle cx="24" cy="26" r="16" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1.2" />
        <path d="M24 10c-7 7-7 25 0 32M24 10c7 7 7 25 0 32M9 25c9-4 21-4 30 0M11 34c8 3 18 3 26 0" stroke={h(c2)} strokeWidth="1.6" fill="none" />
      </>
    )}
    {kind === 'napa' && (
      <>
        <ellipse cx="24" cy="28" rx="11" ry="16" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1.2" />
        <path d="M13 19c2-9 20-9 22 0-4-3-7 1-11-2-4 3-7-1-11 2z" fill={h(c2)} />
        <path d="M24 20v22M18 24c1 8 1 12 0 16M30 24c-1 8-1 12 0 16" stroke={h(c2)} strokeWidth="1.5" fill="none" opacity=".7" />
      </>
    )}
    {kind === 'cluster' && [[15, 30, 9], [31, 30, 9], [23, 17, 9]].map(([x, y, r]) => (
      <g key={x}>
        <circle cx={x} cy={y} r={r} fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1.2" />
        <path d={`M${x} ${y - r + 1}c-4 4-4 12 0 16M${x - r + 1} ${y}c5-2 11-2 16 0`} stroke={h(c2)} strokeWidth="1.2" fill="none" />
      </g>
    ))}
    {kind === 'bulb' && (
      <>
        <path d="M24 12c-3-5-9-5-10-9 5 0 9 2 10 6 1-4 5-6 10-6-1 4-7 4-10 9z" fill={h(c2)} />
        <circle cx="24" cy="29" r="13" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1.2" />
        <path d="M24 42v5" stroke={h(c1)} strokeWidth="2" strokeLinecap="round" />
        <path d="M15 24c2-4 5-6 9-6" stroke={SHINE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    )}
    {kind === 'radish' && (
      <>
        <path d="M24 17c-3-5-8-6-10-11 5 0 9 3 10 7 1-4 5-7 10-7-2 5-7 6-10 11z" fill={h(c2)} />
        <path d="M24 17c9 0 14 6 12 13-2 6-8 9-12 15-4-6-10-9-12-15-2-7 3-13 12-13z" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1.2" />
        <path d="M24 38c-3 3-4 5-4 8" stroke="#F4E9E9" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M17 24c2-3 4-4 7-4" stroke={SHINE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    )}
    {kind === 'stalks' && (
      <>
        {[[-24, 14], [-8, 12], [8, 12], [24, 14]].map(([a, l], i) => (
          <g key={a} transform={`rotate(${a / 2.4} 24 44)`}>
            <rect x="21" y={44 - 30 - l / 3} width="6" height={30 + l / 3} rx="3" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1" />
            <circle cx="24" cy={9 + i} r="5.5" fill={h(c2)} />
          </g>
        ))}
      </>
    )}
    {(kind === 'onion' || kind === 'leek') && [[-10, 0], [0, 3], [10, 0]].map(([dx, dy]) => (
      <g key={dx} transform={`translate(${dx} ${dy})`}>
        <path d={`M${kind === 'leek' ? 21 : 22.5} 4C${kind === 'leek' ? 17 : 20} 14 ${kind === 'leek' ? 20 : 22} 22 ${kind === 'leek' ? 21 : 22.5} 26h${kind === 'leek' ? 6 : 3}C${kind === 'leek' ? 28 : 26} 22 ${kind === 'leek' ? 31 : 28} 14 ${kind === 'leek' ? 27 : 25.5} 4z`} fill={h(c1)} />
        <rect x={kind === 'leek' ? 21 : 22.5} y="26" width={kind === 'leek' ? 6 : 3} height="14" rx="1.5" fill={h(c2)} stroke="rgba(0,0,0,.15)" strokeWidth=".8" />
        <path d="M24 40l-1.5 5M24 40l1.5 5" stroke="#D8D0C0" strokeWidth="1" />
      </g>
    ))}
    {kind === 'leaf' && (
      <>
        <path d="M24 5C39 13 41 30 24 43 7 30 9 13 24 5z" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1.2" />
        <path d="M24 8v34M24 18l-7-4M24 25l8-5M24 31l-8-5" stroke={h(c2)} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </>
    )}
    {kind === 'oval' && (
      <>
        <ellipse cx="24" cy="24" rx="16" ry="19" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1.2" />
        <path d="M24 10v36M24 20l-8-5M24 28l9-6M24 35l-8-5" stroke={h(c2)} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </>
    )}
    {kind === 'ruffle' && (
      <>
        <path d="M24 6c4-2 7 2 10 1 3 3 1 6 4 9 3 3 1 6 2 9-1 4-4 5-5 8-1 4-5 4-8 5-3 2-6 0-9-1-4 0-5-3-7-6-3-2-3-5-2-8-2-3 0-6 1-8 0-4 3-5 5-7 3-1 5-3 9-2z" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1.2" />
        <path d="M24 42V16M24 30l-8-8M24 26l8-8M24 36l-6-5" stroke={h(c2)} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>
    )}
    {kind === 'lobed' && (
      <>
        <path d="M24 44V8" stroke={h(c2)} strokeWidth="2.2" strokeLinecap="round" />
        {[[14, 37, 7], [20, 28, 6.5], [26, 19, 6], [32, 11, 5]].map(([y, , r], i) => (
          <g key={y}>
            <ellipse cx={24 - r - 1.5} cy={y - 5 + i} rx={r} ry="3.8" transform={`rotate(-18 ${24 - r} ${y})`} fill={h(c1)} />
            <ellipse cx={24 + r + 1.5} cy={y - 5 + i} rx={r} ry="3.8" transform={`rotate(18 ${24 + r} ${y})`} fill={h(c1)} />
          </g>
        ))}
        <ellipse cx="24" cy="6" rx="3.5" ry="4.5" fill={h(c1)} />
      </>
    )}
    {kind === 'clover' && (
      <>
        <path d="M24 42V28" stroke={h(c2)} strokeWidth="2.4" strokeLinecap="round" />
        {[[15, 21], [33, 21], [24, 11]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="8.5" fill={h(c1)} stroke="rgba(0,0,0,.12)" strokeWidth="1" />)}
        <path d="M24 28 17 22M24 28l7-6M24 28V15" stroke={h(c2)} strokeWidth="1.2" fill="none" opacity=".7" />
      </>
    )}
    {kind === 'arrow' && (
      <>
        <path d="M24 5C30 14 41 20 38 33L24 44 10 33C7 20 18 14 24 5z" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1.2" />
        <path d="M24 9v33M24 22l-8 6M24 22l8 6" stroke={h(c2)} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </>
    )}
    {kind === 'pods' && [[-16, 4], [0, 0], [16, 4]].map(([a, dy]) => (
      <path key={a} transform={`rotate(${a} 24 40) translate(0 ${dy})`} d="M24 6c5 1 6 9 5 18-1 8-3 14-5 18-2-4-4-10-5-18-1-9 0-17 5-18z" fill={h(c1)} stroke={h(c2)} strokeWidth="1.4" />
    ))}
    {kind === 'okra' && [[-18, 2], [0, 0], [18, 2]].map(([a, dy]) => (
      <g key={a} transform={`rotate(${a} 24 42) translate(0 ${dy})`}>
        <path d="M18 18c0-6 3-11 6-14 3 3 6 8 6 14 0 8-2 18-6 24-4-6-6-16-6-24z" fill={h(c1)} stroke={h(c2)} strokeWidth="1.4" />
        <path d="M24 6v34" stroke={h(c2)} strokeWidth="1" opacity=".6" />
        <rect x="19" y="36" width="10" height="5" rx="2" fill={h(c2)} />
      </g>
    ))}
    {kind === 'peapod' && (
      <>
        <path d="M6 28C12 8 36 8 42 22c-8 12-28 16-36 6z" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.4" />
        {[[14, 24], [22, 22], [30, 21], [37, 22]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4.2" fill={h(c2)} stroke="rgba(0,0,0,.2)" strokeWidth="1" />)}
      </>
    )}
    {kind === 'choke' && (
      <>
        <path d="M24 44c-9-4-15-12-14-22 1-8 8-14 14-14s13 6 14 14c1 10-5 18-14 22z" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.4" />
        {[[24, 16], [16, 22], [32, 22], [24, 26], [18, 32], [30, 32], [24, 38]].map(([x, y]) => <path key={x + y} d={`M${x - 6} ${y}q6-8 12 0`} stroke={h(c2)} strokeWidth="2" fill="none" strokeLinecap="round" />)}
      </>
    )}
    {kind === 'sprig' && (
      <>
        <path d="M24 44V12" stroke={h(c1)} strokeWidth="2" strokeLinecap="round" />
        {[14, 20, 26, 32, 38].map((y) => <path key={y} d={`M24 ${y}c-6-3-9-6-11-10M24 ${y}c6-3 9-6 11-10`} stroke={h(c1)} strokeWidth="1.6" fill="none" strokeLinecap="round" />)}
        <path d="M24 12c-2-4-2-6 0-8 2 2 2 4 0 8z" fill={h(c1)} />
      </>
    )}
    {kind === 'ginger' && (
      <>
        <path d="M6 28c-1-5 3-7 6-7 0-5 5-7 9-4 2-4 8-4 10 0 4-1 8 2 7 6 3 1 4 5 1 8-1 5-6 6-9 5-3 4-9 4-12 1-5 1-10-2-9-6-1-1-3-2-3-3z" fill={h(c1)} stroke={h(c2)} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 24c3 1 6 1 8 0M26 30c3 1 6 0 8-1M16 33c2 1 4 1 6 0" stroke={h(c2)} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </>
    )}
  </g>
);

const dumpling = ([kind, dough, edge, fill]) => (
  <g>
    {(kind === 'crescent' || kind === 'fried') && (
      <>
        <path d="M4 35C4 19 13 11 24 11s20 8 20 24z" fill={h(dough)} stroke={h(edge)} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M6 35h36" stroke={h(edge)} strokeWidth="3" strokeDasharray="2.2 2" />
        {kind === 'fried' && [[16, 24], [26, 19], [32, 27], [22, 29]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.8" fill="rgba(255,225,150,.75)" />)}
        {fill && fill !== 'none' && <ellipse cx="24" cy="22" rx="6.5" ry="3.6" fill={h(fill)} opacity=".9" />}
        <path d="M11 22c2-5 6-8 11-9" stroke={SHINE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    )}
    {kind === 'knot' && (
      <>
        <path d="M6 34c0-12 8-19 18-19s18 7 18 19c0 6-6 9-18 9S6 40 6 34z" fill={h(dough)} stroke={h(edge)} strokeWidth="1.8" />
        <path d="M24 15c-8 3-13 10-14 22M24 15c-3 6-4 14-3 26M24 15c3 6 4 14 3 26M24 15c8 3 13 10 14 22" stroke={h(edge)} strokeWidth="1.4" fill="none" />
        <circle cx="24" cy="12" r="4" fill={h(dough)} stroke={h(edge)} strokeWidth="1.6" />
      </>
    )}
    {kind === 'triangle' && (
      <>
        <path d="M24 7 43 39H5z" fill={h(dough)} stroke={h(edge)} strokeWidth="2.2" strokeLinejoin="round" />
        {[[24, 24], [18, 32], [30, 32], [24, 33]].map(([x, y]) => <ellipse key={x + y} cx={x} cy={y} rx="2" ry="1.1" fill={h(fill)} />)}
        <path d="M17 24 24 12" stroke={SHINE} strokeWidth="2" strokeLinecap="round" />
      </>
    )}
    {kind === 'patty' && (
      <>
        <circle cx="24" cy="26" r="17" fill={h(dough)} stroke={h(edge)} strokeWidth="1.8" />
        <ellipse cx="24" cy="24" rx="7" ry="5" fill={h(fill)} stroke={h(edge)} strokeWidth="1.4" />
        <path d="M11 18c3-5 8-8 13-8" stroke={SHINE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    )}
    {kind === 'chunks' && [[14, 18, -20], [30, 14, 15], [22, 32, 5]].map(([x, y, r]) => (
      <rect key={x} x={x - 8} y={y - 5} width="16" height="10" rx="5" transform={`rotate(${r} ${x} ${y})`} fill={h(dough)} stroke={h(edge)} strokeWidth="1.6" />
    ))}
  </g>
);

const PLATE = <ellipse cx="24" cy="38" rx="21" ry="6.5" fill="#F6F2EA" stroke="#B9B2A6" strokeWidth="1.3" />;
const SPOTS = [[14, 30], [22, 33], [30, 31], [35, 34], [18, 25], [26, 27], [32, 24], [22, 20], [28, 18]];

const dish = ([kind, c1, c2, c3]) => (
  <g>
    {kind !== 'layers' && kind !== 'sticks' && kind !== 'brick' && kind !== 'fold' && kind !== 'fries' && PLATE}
    {kind === 'pasta' && (
      <>
        <ellipse cx="24" cy="30" rx="16" ry="9" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1" />
        <path d="M10 30c4-8 24-8 28 0M13 33c4-7 18-7 22 0M16 27c3-5 13-5 16 0M9 34c6 4 24 4 30 0" stroke="rgba(0,0,0,.2)" strokeWidth="1.2" fill="none" />
        {c2 && c2 !== 'none' && <ellipse cx="24" cy="24" rx="8.5" ry="4.6" fill={h(c2)} />}
        {c3 && c3 !== 'none' && [[20, 23], [25, 22], [29, 25], [23, 26]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.6" fill={h(c3)} />)}
      </>
    )}
    {kind === 'sticks' && (
      <>
        {[12, 16, 20, 24, 28, 32, 36].map((x, i) => <path key={x} d={`M${x} ${6 + (i % 2)}V${42 - (i % 3)}`} stroke={h(c1)} strokeWidth="2.6" strokeLinecap="round" />)}
        <rect x="9" y="22" width="30" height="6" rx="2" fill={h(c2)} />
      </>
    )}
    {kind === 'brick' && (
      <>
        <rect x="6" y="12" width="36" height="26" rx="6" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.2" />
        <path d="M10 18c4-3 4 3 8 0s4 3 8 0 4 3 8 0 4 3 8 0M10 25c4-3 4 3 8 0s4 3 8 0 4 3 8 0 4 3 8 0M10 32c4-3 4 3 8 0s4 3 8 0 4 3 8 0 4 3 8 0" stroke="rgba(120,70,10,.45)" strokeWidth="1.6" fill="none" />
        <rect x="30" y="6" width="12" height="8" rx="2" fill={h(c2)} />
      </>
    )}
    {kind === 'layers' && (
      <>
        <ellipse cx="24" cy="41" rx="20" ry="3" fill={SHADE} opacity=".3" />
        <path d="M6 18 12 11h32l-6 7z" fill={h(c3)} />
        {[c1, c2, c1, c2].map((c, i) => <rect key={i} x="6" y={18 + i * 5.5} width="32" height="5.5" fill={h(c)} />)}
        <path d="M38 18 44 11v22l-6 7z" fill={h(c1)} /><path d="M38 18 44 11v22l-6 7z" fill={SHADE} opacity=".25" />
      </>
    )}
    {kind === 'mash' && (
      <>
        <path d="M6 36C6 22 14 14 24 14s18 8 18 22z" fill={h(c1)} stroke="rgba(0,0,0,.14)" strokeWidth="1.2" />
        <path d="M14 30c3-4 7-5 10-3M22 24c3-3 7-3 10 0M18 34c4-2 10-2 14 0" stroke="rgba(0,0,0,.12)" strokeWidth="1.4" fill="none" />
        <rect x="20" y="16" width="8" height="5" rx="1.5" fill={h(c2)} />
        {[[14, 28], [33, 29], [28, 33]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.4" fill={h(c3)} />)}
      </>
    )}
    {kind === 'spud' && [[15, 31, -15], [31, 31, 12], [23, 22, 0]].map(([x, y, r]) => (
      <g key={x + y}>
        <ellipse cx={x} cy={y} rx="9.5" ry="7" transform={`rotate(${r} ${x} ${y})`} fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.2" />
        <circle cx={x - 3} cy={y - 1} r=".9" fill={h(c2)} /><circle cx={x + 3} cy={y + 2} r=".9" fill={h(c2)} />
      </g>
    ))}
    {kind === 'chunks' && [[14, 32, 10], [24, 34, -8], [33, 31, 18], [19, 24, 25], [29, 23, -12], [24, 16, 5]].map(([x, y, r]) => (
      <g key={x + y}>
        <rect x={x - 5.5} y={y - 4.5} width="11" height="9" rx="2.4" transform={`rotate(${r} ${x} ${y})`} fill={h(c1)} stroke={h(c2)} strokeWidth="1.3" />
        <circle cx={x - 1} cy={y - 1} r="1" fill="rgba(255,235,170,.9)" />
      </g>
    ))}
    {kind === 'half' && (
      <>
        <ellipse cx="24" cy="29" rx="18" ry="11" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.3" />
        <ellipse cx="24" cy="28" rx="14.5" ry="8" fill="#F8EBC0" />
        <path d="M14 27c3-2 6-2 9-1M26 29c3-1 6-1 8 0" stroke="rgba(0,0,0,.12)" strokeWidth="1.2" fill="none" />
        <rect x="19" y="23" width="9" height="5" rx="1.5" fill={h(c3)} />
      </>
    )}
    {kind === 'stack' && (
      <>
        {Array.from({ length: Number(c3) || 4 }).map((_, i, a) => {
          const y = 36 - i * (a.length > 4 ? 4 : 5.5);
          return (
            <g key={i}>
              <path d={`M6 ${y}v-5a18 6 0 0 1 36 0v5a18 6 0 0 1-36 0z`} fill={h(c1)} stroke="rgba(0,0,0,.18)" strokeWidth="1" />
              <ellipse cx="24" cy={y - 5} rx="18" ry="6" fill={h(c1)} stroke="rgba(0,0,0,.12)" strokeWidth=".8" />
            </g>
          );
        })}
        <circle cx="24" cy={30 - (Number(c3) || 4) * 4.4} r="4.4" fill={h(c2)} stroke="rgba(0,0,0,.12)" strokeWidth=".8" />
      </>
    )}
    {kind === 'fold' && (
      <>
        <ellipse cx="24" cy="41" rx="18" ry="3" fill={SHADE} opacity=".3" />
        <path d="M6 36C6 20 16 10 24 10s18 10 18 26z" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.4" />
        <path d="M24 10c0 10-6 20-18 26M24 10c0 10 6 20 18 26" stroke="rgba(0,0,0,.15)" strokeWidth="1.2" fill="none" />
        <ellipse cx="30" cy="29" rx="6" ry="3" fill={h(c2)} />
      </>
    )}
    {kind === 'triangles' && [[16, 28, -15], [31, 27, 12], [23, 16, 0]].map(([x, y, r]) => (
      <path key={x} transform={`rotate(${r} ${x} ${y})`} d={`M${x} ${y - 9}L${x + 9} ${y + 7}H${x - 9}z`} fill={h(c1)} stroke={h(c2)} strokeWidth="1.4" strokeLinejoin="round" />
    ))}
    {kind === 'open' && (
      <>
        <rect x="6" y="14" width="36" height="24" rx="6" fill={h(c1)} stroke="rgba(120,80,20,.5)" strokeWidth="1.6" />
        {c3 === 'cheese'
          ? [[8, 18], [14, 26]].map(([x, y]) => <path key={x} d={`M${x} ${y}h28l-3 8h-22z`} fill={h(c2)} stroke="rgba(0,0,0,.15)" strokeWidth=".8" />)
          : [[14, 22], [24, 22], [34, 22], [19, 30], [29, 30]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="6" fill={h(c2)} stroke="rgba(0,0,0,.2)" strokeWidth="1" />)}
      </>
    )}
    {kind === 'stew' && (
      <>
        <ellipse cx="24" cy="29" rx="17" ry="9.5" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1" />
        {SPOTS.map(([x, y], i) => <rect key={x + y} x={x - 3.4} y={y - 3.4} width="6.8" height="6.4" rx="2.4" transform={`rotate(${i * 35} ${x} ${y})`} fill={h(i % 3 === 0 ? c3 : c2)} stroke="rgba(0,0,0,.2)" strokeWidth=".8" />)}
      </>
    )}
    {kind === 'fries' && (
      <>
        {[14, 19, 24, 29, 34].map((x, i) => <rect key={x} x={x - 2} y={8 + (i % 2) * 3} width="4" height="26" rx="1.5" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth=".8" transform={`rotate(${(i - 2) * 5} ${x} 34)`} />)}
        <path d="M10 26h28l-3 16H13z" fill={h(c2)} />
        <path d="M13 30h22" stroke="rgba(255,255,255,.5)" strokeWidth="2" />
      </>
    )}
  </g>
);

const salad = ([base, c1, c2, c3]) => (
  <g>
    <path d="M4 22h40c0 11-8 19-20 19S4 33 4 22z" fill="#F6F2EA" stroke="#B9B2A6" strokeWidth="1.5" />
    <path d="M6 23C7 10 16 6 24 6s17 4 18 17c-6 3-30 3-36 0z" fill={h(base)} stroke="rgba(0,0,0,.14)" strokeWidth="1.2" />
    {[[14, 17, c1], [21, 11, c2], [28, 15, c3], [34, 19, c1], [18, 21, c3], [26, 20, c2], [31, 10, c2], [12, 22, c2], [23, 16, c1]].map(([x, y, c], i) => (
      <rect key={x + y} x={x - 2.6} y={y - 2.3} width="5.2" height="4.6" rx="1.6" transform={`rotate(${i * 40} ${x} ${y})`} fill={h(c)} stroke="rgba(0,0,0,.12)" strokeWidth=".7" />
    ))}
  </g>
);

const bread = ([crust, crumb, kind]) => (
  <g>
    {(kind === 'slice' || kind === 'seeds') && (
      <>
        <path d="M11 41V21C3 21 3 6 15 6h18c12 0 12 15 4 15v20z" fill={h(crumb)} stroke={h(crust)} strokeWidth="4" strokeLinejoin="round" />
        {kind === 'seeds' && [[17, 18], [25, 15], [31, 21], [20, 27], [28, 31], [16, 34]].map(([x, y], i) => <ellipse key={x + y} cx={x} cy={y} rx="1.5" ry=".8" transform={`rotate(${i * 50} ${x} ${y})`} fill="rgba(60,40,20,.6)" />)}
        <path d="M17 12c3-2 7-2 10 0" stroke={SHINE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    )}
    {kind === 'square' && (
      <>
        <rect x="8" y="7" width="32" height="34" rx="6" fill={h(crumb)} stroke={h(crust)} strokeWidth="4.5" />
        <path d="M15 16c3-2 8-2 12-1" stroke={SHINE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    )}
    {kind === 'loaf' && (
      <>
        <rect x="3" y="15" width="42" height="19" rx="9.5" transform="rotate(-18 24 24)" fill={h(crumb)} stroke={h(crust)} strokeWidth="1.5" />
        {[[13, 29], [21, 26], [29, 23], [37, 20]].map(([x, y]) => <path key={x} d={`M${x} ${y + 3}l3-8`} stroke={h(crust)} strokeWidth="2.4" strokeLinecap="round" />)}
      </>
    )}
    {kind === 'long' && (
      <>
        <rect x="2" y="19" width="44" height="12" rx="6" transform="rotate(-25 24 25)" fill={h(crumb)} stroke={h(crust)} strokeWidth="1.5" />
        {[[11, 33], [18, 29], [25, 26], [32, 22], [38, 19]].map(([x, y]) => <path key={x} d={`M${x} ${y + 2.5}l2.4-6`} stroke={h(crust)} strokeWidth="2" strokeLinecap="round" />)}
      </>
    )}
    {kind === 'cubes' && [[12, 30, 12], [26, 33, -10], [34, 21, 20], [18, 18, -15], [27, 12, 8]].map(([x, y, r]) => (
      <g key={x + y}>
        <rect x={x - 6} y={y - 6} width="12" height="12" rx="2.6" transform={`rotate(${r} ${x} ${y})`} fill={h(crumb)} stroke={h(crust)} strokeWidth="1.6" />
        <circle cx={x - 1.5} cy={y - 1} r="1" fill={h(crust)} opacity=".6" />
      </g>
    ))}
    {kind === 'eclair' && (
      <>
        <rect x="3" y="15" width="42" height="18" rx="9" fill={h(crumb)} stroke={h(crust)} strokeWidth="1.4" />
        <path d="M5 21c0-5 4-8 9-8h20c5 0 9 3 9 8-3 3-5-1-8 2s-5-1-8 2-5-1-8 2-5-1-8 2-6 0-6-2z" fill={h(crust)} />
        <path d="M5 33c3 3 35 3 38 0" stroke="#FFF3D6" strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    )}
    {kind === 'bun' && (
      <>
        <path d="M5 34C5 18 14 10 24 10s19 8 19 24c0 4-4 6-8 6H13c-4 0-8-2-8-6z" fill={h(crumb)} stroke={h(crust)} strokeWidth="1.6" />
        {[[16, 20], [24, 16], [32, 21], [20, 27], [29, 28]].map(([x, y], i) => <ellipse key={x + y} cx={x} cy={y} rx="2.2" ry="1" transform={`rotate(${i * 40} ${x} ${y})`} fill="#fff" opacity=".85" />)}
        <path d="M12 20c3-5 7-7 12-7" stroke={SHINE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    )}
  </g>
);

const wurst = ([skin, inner, kind]) => (
  <g>
    {kind === 'slices' && [[15, 17], [26, 22], [18, 31]].map(([x, y], i) => (
      <g key={x}>
        <circle cx={x + 3} cy={y + 3} r="12" fill={h(skin)} stroke="rgba(0,0,0,.2)" strokeWidth="1.2" />
        <circle cx={x + 3} cy={y + 3} r="9.5" fill={h(inner)} />
        {[[-3, -2], [2, 1], [-1, 5], [5, -4]].map(([dx, dy]) => <circle key={dx + dy} cx={x + 3 + dx} cy={y + 3 + dy} r="1.1" fill={i % 2 ? '#F3E8DA' : 'rgba(255,255,255,.55)'} />)}
      </g>
    ))}
    {kind === 'ham' && [[8, 12, -6], [10, 25, 5]].map(([x, y, r]) => (
      <g key={y} transform={`rotate(${r} 24 24)`}>
        <rect x={x} y={y} width="30" height="15" rx="7" fill={h(inner)} stroke={h(skin)} strokeWidth="2.4" />
        <path d={`M${x + 6} ${y + 5}c4-2 8 2 12 0`} stroke="rgba(255,255,255,.55)" strokeWidth="1.6" fill="none" />
      </g>
    ))}
    {kind === 'strips' && [8, 19, 30].map((y, i) => (
      <path key={y} d={`M4 ${y + 3}c5-6 7 4 12-1s7 4 12-1 7 4 12-1 3 0 4-2v8c-3 1-5 0-5-1-5 5-7-4-12 1s-7-4-12 1-7-4-12 1c-1 0-1-1-1-2z`} fill={h(skin)} stroke="rgba(0,0,0,.18)" strokeWidth="1" transform={`translate(${i % 2 ? 1 : -1} 0)`} />
    ))}
    {kind === 'strips' && [11, 22, 33].map((y) => <path key={y} d={`M6 ${y}c5-5 7 3 12-1s7 3 12-1 7 3 11-1`} stroke={h(inner)} strokeWidth="2.2" fill="none" strokeLinecap="round" />)}
    {kind === 'slab' && (
      <>
        <rect x="5" y="12" width="38" height="24" rx="5" fill={h(skin)} stroke="rgba(0,0,0,.18)" strokeWidth="1.2" />
        <path d="M5 30h38v1.5c0 2.5-2 4.5-4.5 4.5h-29C7 36 5 34 5 31.500z" fill="#B9805A" />
        <path d="M10 22c6-3 10 3 16 0s8 2 12 0" stroke={h(inner)} strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    )}
    {(kind === 'link' || kind === 'twin' || kind === 'grill') && (kind === 'link' ? [[24]] : [[17], [31]]).map(([y]) => (
      <g key={y}>
        <rect x="4" y={y - (kind === 'link' ? 6 : 5.5)} width="40" height={kind === 'link' ? 12 : 11} rx="6" transform={`rotate(-10 24 ${y})`} fill={h(skin)} stroke={h(inner)} strokeWidth="1.5" />
        {kind === 'grill' && <path d={`M14 ${y - 3}l4 8M22 ${y - 5}l4 8M30 ${y - 6}l4 8`} stroke="rgba(60,25,10,.5)" strokeWidth="2" strokeLinecap="round" />}
        <path d={`M10 ${y - 3}c8-3 18-4 26-6`} stroke={SHINE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    ))}
    {kind === 'hotdog' && (
      <>
        <rect x="3" y="20" width="42" height="17" rx="8.5" fill={h(inner)} stroke="rgba(120,80,20,.5)" strokeWidth="1.4" />
        <rect x="2" y="14" width="44" height="11" rx="5.5" fill={h(skin)} stroke="rgba(0,0,0,.2)" strokeWidth="1.2" />
        <path d="M7 18c3-3 4 3 7 0s4 3 7 0 4 3 7 0 4 3 7 0 4 3 7 0" stroke="#F2C94C" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    )}
  </g>
);

const burger = ([bun, patty, kind]) => {
  const big = kind === 'big';
  return (
    <g>
      {kind === 'bun' ? (
        <>
          <path d="M5 22C5 11 14 5 24 5s19 6 19 17z" fill={h(bun)} stroke="rgba(0,0,0,.2)" strokeWidth="1.2" />
          <rect x="5" y="27" width="38" height="9" rx="4.5" fill={h(bun)} stroke="rgba(0,0,0,.2)" strokeWidth="1.2" />
          {[[16, 13], [24, 10], [32, 13], [20, 17], [29, 18]].map(([x, y], i) => <ellipse key={x} cx={x} cy={y} rx="2" ry="1" transform={`rotate(${i * 40} ${x} ${y})`} fill="#FFF3D0" />)}
        </>
      ) : (
        <>
          <path d="M5 18C5 8 14 3 24 3s19 5 19 15z" fill={h(bun)} stroke="rgba(0,0,0,.2)" strokeWidth="1.2" />
          {[[16, 10], [24, 8], [32, 10], [20, 14], [29, 14]].map(([x, y], i) => <ellipse key={x} cx={x} cy={y} rx="2" ry="1" transform={`rotate(${i * 40} ${x} ${y})`} fill="#FFF3D0" />)}
          <path d="M4 20c4 3 5-2 8 1s5-2 8 1 5-2 8 1 5-2 8 1 5-2 8 0v2H4z" fill="#5FAE3C" />
          {(kind === 'cheese' || big) && <path d="M5 23h38l-4 5-5-3-5 4-5-4-5 3-5-3z" fill="#F7C531" />}
          <rect x="5" y="24" width="38" height="7" rx="3.5" fill={h(patty)} stroke="rgba(0,0,0,.2)" strokeWidth="1" />
          {kind === 'chicken' && [[12, 27], [20, 28], [28, 27], [36, 28]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.2" fill="rgba(255,225,150,.8)" />)}
          {big && <><rect x="6" y="32" width="36" height="4" rx="2" fill={h(bun)} /><rect x="5" y="36" width="38" height="6" rx="3" fill={h(patty)} stroke="rgba(0,0,0,.2)" strokeWidth="1" /></>}
          {kind === 'chicken' && <path d="M8 32c4 2 8-1 12 1s8-1 12 1 6 0 8-1" stroke="#FFF8EA" strokeWidth="3" fill="none" strokeLinecap="round" />}
          <rect x="5" y={big ? 42 : 34} width="38" height="6" rx="3" fill={h(bun)} stroke="rgba(0,0,0,.2)" strokeWidth="1.2" />
        </>
      )}
    </g>
  );
};

const pizza = ([crust, sauce, kind]) => (
  <g>
    <circle cx="24" cy="24" r="20" fill={h(crust)} stroke="rgba(0,0,0,.2)" strokeWidth="1.4" />
    <circle cx="24" cy="24" r="16.5" fill={h(sauce)} />
    {kind === 'pepperoni' && [[17, 17], [30, 17], [24, 25], [15, 29], [32, 30], [24, 12], [24, 36]].map(([x, y]) => <g key={x + y}><circle cx={x} cy={y} r="4.2" fill="#B3261E" stroke="#8A1A14" strokeWidth=".8" /><circle cx={x - 1} cy={y - 1} r=".8" fill="#E8776F" /></g>)}
    {kind === 'margherita' && (
      <>
        {[[17, 18], [30, 19], [24, 28], [16, 30], [32, 31]].map(([x, y]) => <ellipse key={x + y} cx={x} cy={y} rx="5.2" ry="4" fill="#FFF8EA" stroke="rgba(0,0,0,.1)" strokeWidth=".8" />)}
        {[[24, 17], [22, 35], [33, 25]].map(([x, y]) => <path key={x} d={`M${x} ${y}c3-4 6-2 6 1-3 2-5 2-6-1z`} fill="#3E7B27" />)}
      </>
    )}
    {kind === 'cheese4' && (
      <>
        <path d="M24 24V7.500A16.500 16.500 0 0 1 40.500 24z" fill="#FFF3C4" />
        <path d="M24 24h16.500A16.500 16.500 0 0 1 24 40.500z" fill="#F2B84A" />
        <path d="M24 24v16.500A16.500 16.500 0 0 1 7.500 24z" fill="#FFFFFF" />
        <path d="M24 24H7.500A16.500 16.500 0 0 1 24 7.500z" fill="#E88A2A" />
        <path d="M24 7.500v33M7.500 24h33" stroke="rgba(0,0,0,.18)" strokeWidth="1.2" />
        {[[31, 16], [31, 31], [16, 31], [16, 16]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1.6" fill="rgba(255,255,255,.7)" />)}
      </>
    )}
    {kind === 'mix' && [[18, 18, '#B3261E'], [30, 19, '#3E7B27'], [24, 27, '#F7C531'], [16, 30, '#3E7B27'], [31, 31, '#B3261E'], [24, 14, '#F7C531']].map(([x, y, c]) => <circle key={x + y} cx={x} cy={y} r="3.2" fill={c} />)}
  </g>
);

const icecream = ([kind, c1, c2]) => (
  <g>
    {kind === 'cone' && (
      <>
        <path d="M14 24h20L24 45z" fill="#D9A55B" stroke="#A9772E" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M17 29l12 6M21 25l9 12M31 29l-12 6M27 25l-9 12" stroke="#A9772E" strokeWidth="1" />
        <circle cx="24" cy="21" r="10.5" fill={h(c1)} stroke="rgba(0,0,0,.14)" strokeWidth="1.2" />
        <circle cx="24" cy="10" r="7.5" fill={h(c2)} stroke="rgba(0,0,0,.14)" strokeWidth="1.2" />
      </>
    )}
    {kind === 'bar' && (
      <>
        <rect x="21" y="32" width="6" height="14" rx="3" fill="#E3B877" />
        <path d="M11 33V15c0-6 5-10 13-10s13 4 13 10v18z" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.2" />
        <path d="M15 12c2-3 6-4 9-4" stroke={SHINE} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M30 20l7 3" stroke={h(c2)} strokeWidth="3" strokeLinecap="round" />
      </>
    )}
    {kind === 'cup' && (
      <>
        <path d="M11 26h26l-3 17H14z" fill="#F6F2EA" stroke="#B9B2A6" strokeWidth="1.3" />
        <path d="M12 32h24" stroke={h(c2)} strokeWidth="3.5" />
        <circle cx="24" cy="21" r="11.5" fill={h(c1)} stroke="rgba(0,0,0,.14)" strokeWidth="1.2" />
        <path d="M16 16c2-3 5-4 8-4" stroke={SHINE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    )}
    {kind === 'swirl' && (
      <>
        <path d="M11 30h26l-3 14H14z" fill="#F6F2EA" stroke="#B9B2A6" strokeWidth="1.3" />
        <path d="M10 30c-1-4 3-6 6-6-1-4 3-8 8-8 0-3 3-5 5-4-1 3 1 4 3 5 4 1 6 5 5 9 3 1 3 4 1 4z" fill={h(c1)} stroke="rgba(0,0,0,.14)" strokeWidth="1.2" />
        <path d="M14 27c6 2 14 2 20 0M18 21c4 1 8 1 12 0" stroke="rgba(0,0,0,.14)" strokeWidth="1.3" fill="none" />
      </>
    )}
    {kind === 'dish' && (
      <>
        <path d="M6 28h36c-1 8-7 14-18 14S7 36 6 28z" fill="#E8F1F7" stroke="#9FB6C4" strokeWidth="1.4" />
        <circle cx="16" cy="22" r="8" fill={h(c1)} stroke="rgba(0,0,0,.14)" strokeWidth="1.2" />
        <circle cx="30" cy="22" r="8" fill={h(c2)} stroke="rgba(0,0,0,.14)" strokeWidth="1.2" />
        <circle cx="23" cy="14" r="7.5" fill={h(c1)} stroke="rgba(0,0,0,.14)" strokeWidth="1.2" />
      </>
    )}
  </g>
);

const egg = ([kind, c1, c2]) => (
  <g>
    {kind === 'half' && (
      <>
        <path d="M24 5C14 5 8 20 8 29c0 8 7 12 16 12s16-4 16-12C40 20 34 5 24 5z" fill="#FFFDF7" stroke="#D9CDB0" strokeWidth="1.5" />
        <ellipse cx="24" cy="29" rx="8.5" ry="8" fill={h(c1)} /><ellipse cx="22" cy="27" rx="3" ry="2.4" fill="rgba(255,255,255,.35)" />
      </>
    )}
    {kind === 'quail' && [[15, 28, -12], [31, 29, 14]].map(([x, y, r]) => (
      <g key={x}>
        <ellipse cx={x} cy={y} rx="10" ry="12.5" transform={`rotate(${r} ${x} ${y})`} fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.2" />
        {[[-3, -4], [3, 2], [-2, 6], [4, -6], [0, 0]].map(([dx, dy]) => <circle key={dx + dy} cx={x + dx} cy={y + dy} r="1.3" fill={h(c2)} />)}
      </g>
    ))}
    {kind === 'white' && (
      <>
        <path d="M8 26c-2-9 7-17 17-15 9 1 16 9 14 17-2 8-12 12-21 10-6-1-9-5-10-12z" fill="#FFFFFF" stroke="#D9CDB0" strokeWidth="1.5" />
        <path d="M14 18c3-3 7-4 11-3" stroke="rgba(150,170,190,.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    )}
    {kind === 'yolk' && (
      <>
        <circle cx="24" cy="25" r="15" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1.3" />
        <ellipse cx="18.500" cy="19" rx="4.500" ry="3" fill="rgba(255,255,255,.45)" />
      </>
    )}
    {kind === 'fried' && (
      <>
        <path d="M5 26c-2-8 5-16 13-14 4-3 12-2 15 2 7 0 12 7 9 14-2 7-10 8-14 7-4 4-12 4-16 0-5 1-9-3-7-9z" fill="#FFFFFF" stroke="#D9CDB0" strokeWidth="1.5" />
        <circle cx="23" cy="25" r="8" fill={h(c1)} /><ellipse cx="20.500" cy="22" rx="2.800" ry="2" fill="rgba(255,255,255,.45)" />
      </>
    )}
    {kind === 'omelet' && (
      <>
        <path d="M4 33C4 17 13 9 24 9s20 8 20 24c0 3-3 4-6 4H10c-3 0-6-1-6-4z" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.4" />
        <path d="M24 9c0 8-4 17-14 28M24 9c0 8 4 17 14 28" stroke="rgba(150,90,10,.25)" strokeWidth="1.3" fill="none" />
        {[[15, 25], [31, 26], [23, 31]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.5" fill={h(c2)} />)}
        <path d="M11 20c3-5 7-7 12-8" stroke={SHINE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    )}
  </g>
);

const fruit = ([kind, c1, c2, c3]) => (
  <g>
    {kind === 'bunch' && (
      <>
        <path d="M24 4c0 6-2 8-5 10" stroke={h(c2)} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M24 8c4-3 9-2 11 1-3 3-8 3-11-1z" fill={h(c2)} />
        {[[15, 18], [24, 18], [33, 18], [19.500, 26], [28.500, 26], [24, 34], [14, 27], [34, 27], [24, 42]].slice(0, 8).map(([x, y]) => <g key={x + y}><circle cx={x} cy={y} r="5.600" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1" /><circle cx={x - 1.800} cy={y - 1.800} r="1.200" fill="rgba(255,255,255,.55)" /></g>)}
      </>
    )}
    {kind === 'berries' && (
      <>
        {[[14, 28], [24, 30], [34, 28], [19, 20], [29, 20], [24, 12], [12, 38], [24, 40], [36, 38]].map(([x, y]) => <g key={x + y}><circle cx={x} cy={y} r={Number(c3) || 5.200} fill={h(c1)} stroke="rgba(0,0,0,.22)" strokeWidth="1" /><circle cx={x - 1.600} cy={y - 1.600} r="1.100" fill="rgba(255,255,255,.55)" /></g>)}
        {c2 && c2 !== 'none' && <path d="M24 8c-2-3-1-5 0-6" stroke={h(c2)} strokeWidth="2" fill="none" />}
      </>
    )}
    {kind === 'strawb' && (
      <>
        <path d="M24 44C9 33 4 22 9 14c4-6 11-4 15 1 4-5 11-7 15-1 5 8 0 19-15 30z" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.2" />
        {[[15, 22], [24, 20], [33, 22], [19, 29], [29, 29], [24, 36], [14, 31], [34, 31]].map(([x, y]) => <ellipse key={x + y} cx={x} cy={y} rx="1" ry="1.600" fill={h(c2)} />)}
        <path d="M24 12c-6-5-12-3-14 0 5 0 9 1 14 0zM24 12c6-5 12-3 14 0-5 0-9 1-14 0zM24 12c-2-4 0-7 2-9" fill={h(c3, '4C9A2A')} stroke={h(c3, '4C9A2A')} strokeWidth="1.2" />
      </>
    )}
    {kind === 'rasp' && (
      <>
        <path d="M24 44C12 38 8 28 12 18c2-5 7-8 12-8s10 3 12 8c4 10 0 20-12 26z" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.2" />
        {[[17, 19], [24, 17], [31, 19], [13, 26], [20, 25], [28, 25], [35, 26], [16, 33], [24, 32], [32, 33], [20, 39], [28, 39]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="3.500" fill={h(c1)} stroke="rgba(0,0,0,.28)" strokeWidth="1" />)}
        <path d="M18 9c3 2 9 2 12 0-2-4-10-4-12 0z" fill={h(c2, '4C9A2A')} />
      </>
    )}
    {kind === 'single' && (
      <>
        <circle cx="24" cy="27" r="16" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.3" />
        {c3 === 'crease' && <path d="M24 11c-4 8-4 22 0 31" stroke="rgba(0,0,0,.2)" strokeWidth="1.600" fill="none" />}
        {c3 === 'calyx' && <path d="M24 12l-8-2 5 5-5 3 8 0 8 0-5-3 5-5z" fill={h(c2)} />}
        {c3 !== 'calyx' && <><path d="M24 11c0-4 2-6 4-7" stroke="#6B4A2E" strokeWidth="2" strokeLinecap="round" fill="none" /><path d="M26 8c4-3 9-2 11 1-4 3-8 2-11-1z" fill={h(c2)} /></>}
        <path d="M13 22c2-5 6-8 11-8" stroke={SHINE} strokeWidth="2.400" fill="none" strokeLinecap="round" />
      </>
    )}
    {kind === 'dried' && [[0, 0, 1], [14, 12, 0.6]].map(([dx, dy, k]) => (
      <g key={dx} transform={`translate(${dx - (k < 1 ? 0 : 3)} ${dy}) scale(${k})`}>
        <path d="M6 26c-2-9 6-16 16-15s17 8 15 17c-2 8-10 11-18 10-8-1-12-5-13-12z" fill={h(c1)} stroke={h(c2)} strokeWidth="1.600" />
        <path d="M12 22c3-3 6-3 9-1M16 31c4-2 8-1 12 1M25 17c3 1 5 3 6 6" stroke={h(c2)} strokeWidth="1.200" fill="none" strokeLinecap="round" opacity=".8" />
        <path d="M11 18c3-3 7-4 11-3" stroke={SHINE} strokeWidth="1.800" fill="none" strokeLinecap="round" />
      </g>
    ))}
    {kind === 'pair' && (
      <>
        <path d="M16 34C17 20 22 12 25 5M32 36C32 22 28 12 25 5" stroke={h(c2)} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M26 6c5-3 11-1 13 3-5 3-10 2-13-3z" fill={h(c2)} />
        {[[16, 35], [32, 37]].map(([x, y]) => <g key={x}><circle cx={x} cy={y} r="9.500" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.200" /><circle cx={x - 3} cy={y - 3} r="2" fill="rgba(255,255,255,.5)" /></g>)}
      </>
    )}
    {kind === 'citrus' && (
      <>
        <circle cx="24" cy="24" r="19" fill={h(c1)} stroke="rgba(0,0,0,.18)" strokeWidth="1.200" />
        <circle cx="24" cy="24" r="16" fill={h(c2)} />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;
          return <path key={i} d={`M24 24L${24 + Math.cos(a - 0.34) * 14} ${24 + Math.sin(a - 0.34) * 14}A14 14 0 0 1 ${24 + Math.cos(a + 0.34) * 14} ${24 + Math.sin(a + 0.34) * 14}z`} fill={h(c3)} stroke={h(c2)} strokeWidth="1.200" />;
        })}
        <circle cx="24" cy="24" r="2" fill={h(c2)} />
      </>
    )}
    {kind === 'halfseed' && (
      <>
        <ellipse cx="24" cy="25" rx="17" ry="20" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.300" />
        <ellipse cx="24" cy="25" rx="14" ry="17" fill={h(c2)} />
        <ellipse cx="24" cy="25" rx="6" ry="8" fill="rgba(0,0,0,.08)" />
        {[[22, 20], [27, 22], [21, 27], [26, 29], [24, 24], [29, 26], [20, 22]].map(([x, y]) => <ellipse key={x + y} cx={x} cy={y} rx="1.300" ry="1.900" fill={h(c3)} />)}
      </>
    )}
    {kind === 'wedge' && (
      <>
        <path d="M3 16h42a21 21 0 0 1-42 0z" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.300" />
        <path d="M7 16h34a17 17 0 0 1-34 0z" fill={h(c2)} />
        {[[15, 22], [22, 27], [30, 22], [26, 19], [18, 18]].map(([x, y]) => <ellipse key={x + y} cx={x} cy={y} rx="1.200" ry="1.800" fill={h(c3)} />)}
      </>
    )}
    {kind === 'lychee' && (
      <>
        <circle cx="19" cy="27" r="13" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.200" />
        {[[13, 22], [19, 18], [24, 24], [14, 30], [21, 33], [26, 29]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1.200" fill="rgba(120,30,30,.35)" />)}
        <circle cx="33" cy="30" r="10" fill="#FFF8EA" stroke="#E3D5C0" strokeWidth="1.200" /><circle cx="33" cy="30" r="3.500" fill="#7A4A2E" />
      </>
    )}
    {kind === 'zuc' && (
      <>
        <rect x="4" y="17" width="40" height="15" rx="7.500" transform="rotate(-28 24 24)" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.300" />
        <path d="M11 34c8-6 20-14 28-19M9 29c8-5 18-12 26-17" stroke={h(c2)} strokeWidth="1.400" fill="none" opacity=".6" />
        <path d="M37 11l4-4" stroke="#5E8F2E" strokeWidth="3.500" strokeLinecap="round" />
      </>
    )}
    {kind === 'root' && (
      <>
        <path d="M24 10c-3-5-8-6-10-10M24 10c3-5 8-6 10-10M24 10V0" stroke={h(c2)} strokeWidth="2.200" strokeLinecap="round" fill="none" />
        <path d="M24 8c8 0 10 5 9 11-1 10-5 20-9 26-4-6-8-16-9-26-1-6 1-11 9-11z" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.300" />
        <path d="M18 17h12M19 24h10M20 31h8" stroke="rgba(0,0,0,.14)" strokeWidth="1.200" />
      </>
    )}
    {kind === 'florets' && (
      <>
        <path d="M4 26c6-6 12-8 20-8s14 2 20 8c-2 8-8 14-20 14S6 34 4 26z" fill={h(c2)} />
        {[[16, 24], [24, 18], [32, 24], [20, 30], [28, 30], [24, 25]].map(([x, y]) => <g key={x + y}><circle cx={x} cy={y} r="7" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1" /><circle cx={x - 2} cy={y - 2} r="1.400" fill="rgba(255,255,255,.7)" /></g>)}
      </>
    )}
    {kind === 'spears' && [[11, 0], [19, 4], [28, 4], [36, 0]].map(([x, dy]) => (
      <g key={x}>
        <rect x={x - 2.800} y={12 + dy} width="5.600" height={32 - dy} rx="2.800" fill={h(c1)} stroke="rgba(0,0,0,.18)" strokeWidth="1" />
        <path d={`M${x - 2.800} ${14 + dy}c0-5 1.500-8 2.800-9 1.300 1 2.800 4 2.800 9z`} fill={h(c2)} />
        <path d={`M${x - 2} ${18 + dy}h4`} stroke={h(c2)} strokeWidth="1" />
      </g>
    ))}
    {kind === 'olive' && [[15, 28, -20], [32, 26, 25]].map(([x, y, r]) => (
      <g key={x}>
        <ellipse cx={x} cy={y} rx="10" ry="13" transform={`rotate(${r} ${x} ${y})`} fill={h(c1)} stroke="rgba(0,0,0,.25)" strokeWidth="1.200" />
        <ellipse cx={x} cy={y - 6} rx="3.600" ry="2.800" fill={h(c2)} />
        <ellipse cx={x - 3} cy={y} rx="1.600" ry="4" fill="rgba(255,255,255,.35)" />
      </g>
    ))}
    {kind === 'ring' && [[16, 16], [32, 18], [23, 33]].map(([x, y]) => (
      <g key={x}>
        <circle cx={x} cy={y} r="9" fill="none" stroke={h(c1)} strokeWidth="6" />
        <circle cx={x} cy={y} r="9" fill="none" stroke={h(c2)} strokeWidth="6" strokeDasharray="1 5" opacity=".55" />
        <circle cx={x} cy={y} r="12" fill="none" stroke="rgba(0,0,0,.14)" strokeWidth="1" />
      </g>
    ))}
    {kind === 'stuffed' && (
      <>
        <path d="M5 20c0-5 4-9 9-9 4 0 8 3 10 3s6-3 10-3c5 0 9 4 9 9 0 14-6 24-19 24S5 34 5 20z" fill={h(c1)} stroke="rgba(0,0,0,.2)" strokeWidth="1.300" />
        <ellipse cx="24" cy="19" rx="14" ry="6.500" fill={h(c2)} stroke="rgba(0,0,0,.18)" strokeWidth="1" />
        {[[17, 18], [24, 16], [31, 18], [21, 21], [28, 21]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="1.700" fill="rgba(140,80,30,.55)" />)}
      </>
    )}
  </g>
);

const nutShape = (kind, c1, c2) => {
  const edge = 'rgba(0,0,0,.28)';
  if (kind === 'walnut') return <g><circle r="9.500" fill={h(c1)} stroke={edge} /><path d="M-9 0c3-3 5 3 9 0s6 3 9 0M0-9v18" stroke={edge} fill="none" /></g>;
  if (kind === 'peanut') return <g><ellipse cx="-4.500" rx="6.500" ry="5.800" fill={h(c1)} stroke={edge} /><ellipse cx="4.500" rx="6.500" ry="5.800" fill={h(c1)} stroke={edge} /><path d="M-3-3c0 2 0 4 0 6M3-3c0 2 0 4 0 6M-8-1l1 1M7 1l1 1" stroke={edge} fill="none" /></g>;
  if (kind === 'almond') return <g><path d="M0-11c7 4 9 13 0 21-9-8-7-17 0-21z" fill={h(c1)} stroke={edge} /><path d="M0-8v15" stroke={edge} fill="none" opacity=".6" /></g>;
  if (kind === 'cashew') return <g><path d="M-10 2C-9-6 0-9 7-5c4 2 4 8 1 10-1-4-4-5-7-4-3 1-5 4-9 3z" fill={h(c1)} stroke={edge} /></g>;
  if (kind === 'pistachio') return <g><ellipse rx="6.500" ry="9" fill={h(c1)} stroke={edge} /><ellipse cx="0" cy="-2" rx="3.200" ry="5.500" fill={h(c2)} /><path d="M0-9v6" stroke={edge} /></g>;
  if (kind === 'hazel') return <g><circle r="8.500" fill={h(c1)} stroke={edge} /><path d="M-8-3c2-6 14-6 16 0-5-2-11-2-16 0z" fill={h(c2)} /></g>;
  if (kind === 'macadamia') return <g><circle r="8.500" fill={h(c1)} stroke={edge} /><circle cx="-2" cy="-2" r="2" fill="rgba(255,255,255,.5)" /></g>;
  if (kind === 'pine') return <g><path d="M0-10c3 3 3 12 0 20-3-8-3-17 0-20z" fill={h(c1)} stroke={edge} /></g>;
  if (kind === 'brazil') return <g><path d="M-8 6C-9-4-3-9 4-8 9-4 9 3 5 9-1 10-6 9-8 6z" fill={h(c1)} stroke={edge} /><path d="M-3 4C-2-2 1-5 5-6" stroke={edge} fill="none" opacity=".6" /></g>;
  return <g><ellipse rx="6.500" ry="9.500" fill={h(c1)} stroke={edge} /><path d="M-5-4c3 2 7 2 10 0M-5 2c3 2 7 2 10 0M0-9v18" stroke={edge} fill="none" opacity=".5" /></g>;
};

const nut = ([kind, c1, c2]) => (
  <g>
    {[[15, 31, -20, 1.4], [33, 30, 25, 1.25], [24, 15, 8, 1.2]].map(([x, y, r, k]) => (
      <g key={x} transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`}>{nutShape(kind, c1, c2)}</g>
    ))}
  </g>
);

const drinkware = ([kind, liquid, extra]) => (
  <g>
    {kind === 'wine' && (
      <>
        <path d="M13 5h22c1 9 0 17-5 21-3 2-6 2-6 2s-3 0-6-2c-5-4-6-12-5-21z" fill="rgba(210,230,240,.55)" stroke="#9FB6C4" strokeWidth="1.600" />
        <path d="M13.600 14h20.800c0 7-2 11-6 14-2 1.500-3 1.500-4.400 1.500S20 29.500 18 28c-4-3-5.500-7-4.400-14z" fill={h(liquid)} />
        <path d="M24 29v12M16 42h16" stroke="#9FB6C4" strokeWidth="2.400" strokeLinecap="round" />
        <path d="M17 9c0 4 1 7 2 9" stroke={SHINE} strokeWidth="2" strokeLinecap="round" fill="none" />
      </>
    )}
    {kind === 'tumbler' && (
      <>
        <path d="M9 12h30l-3 28a3 3 0 0 1-3 2.600H15a3 3 0 0 1-3-2.600z" fill="rgba(210,230,240,.55)" stroke="#9FB6C4" strokeWidth="1.600" />
        <path d="M10.200 22h27.600l-1.800 18a3 3 0 0 1-3 2.600H15a3 3 0 0 1-3-2.600z" fill={h(liquid)} />
        {extra === 'ice' && [[18, 24], [28, 27]].map(([x, y], i) => <rect key={x} x={x - 5} y={y - 5} width="10" height="10" rx="2" transform={`rotate(${i ? 15 : -10} ${x} ${y})`} fill="rgba(255,255,255,.55)" stroke="rgba(255,255,255,.8)" />)}
        <path d="M15 16v22" stroke={SHINE} strokeWidth="2" strokeLinecap="round" />
      </>
    )}
    {kind === 'snifter' && (
      <>
        <path d="M16 12c-6 4-8 10-6 15 2 5 8 7 14 7s12-2 14-7c2-5 0-11-6-15z" fill="rgba(210,230,240,.55)" stroke="#9FB6C4" strokeWidth="1.600" />
        <path d="M10.600 25c1 6 7 8 13.400 8s12.400-2 13.400-8c-5-2-21-2-26.800 0z" fill={h(liquid)} />
        <path d="M24 34v7M16 42h16" stroke="#9FB6C4" strokeWidth="2.400" strokeLinecap="round" />
      </>
    )}
  </g>
);

const sushi = ([kind, c1, c2]) => (
  <g>
    <ellipse cx="24" cy="40" rx="20" ry="4" fill="rgba(0,0,0,.15)" />
    {kind === 'maki' && [[15, 26], [33, 26]].map(([x, y]) => (
      <g key={x}>
        <circle cx={x} cy={y} r="11" fill="#2B3A33" /><circle cx={x} cy={y} r="8.500" fill="#FBF8F0" />
        <circle cx={x} cy={y} r="3.800" fill={h(c1)} /><circle cx={x + 3} cy={y - 3} r="2.200" fill={h(c2)} />
      </g>
    ))}
    {kind === 'ura' && [[15, 26], [33, 26]].map(([x, y]) => (
      <g key={x}>
        <circle cx={x} cy={y} r="11" fill="#FBF8F0" stroke="#E0D8C6" strokeWidth="1" />
        {[[-5, -4], [4, -6], [6, 3], [-4, 5], [0, 0]].map(([dx, dy]) => <circle key={dx + dy} cx={x + dx} cy={y + dy} r="1" fill={h(c2)} />)}
        <circle cx={x} cy={y} r="4" fill="#2B3A33" /><circle cx={x} cy={y} r="2.600" fill={h(c1)} />
      </g>
    ))}
    {kind === 'nigiri' && (
      <>
        <rect x="7" y="24" width="34" height="14" rx="7" fill="#FBF8F0" stroke="#E0D8C6" strokeWidth="1.200" />
        <path d="M5 24c4-8 34-10 38 0-8 4-30 4-38 0z" fill={h(c1)} stroke="rgba(0,0,0,.15)" strokeWidth="1" />
        <path d="M12 23c6-2 16-2 22 0" stroke={h(c2)} strokeWidth="2" fill="none" strokeLinecap="round" opacity=".7" />
      </>
    )}
  </g>
);

const skewer = ([kind, c1, c2]) => (
  <g>
    <path d="M4 42 44 6" stroke="#C9A96E" strokeWidth="2.600" strokeLinecap="round" />
    {kind === 'lula' ? (
      <rect x="10" y="17" width="28" height="12" rx="6" transform="rotate(-42 24 24)" fill={h(c1)} stroke="rgba(0,0,0,.25)" strokeWidth="1.300" />
    ) : (
      [[13, 35, 0], [20, 29, 1], [27, 22, 0], [34, 15, 1]].map(([x, y, alt]) => (
        <rect key={x} x={x - 5.500} y={y - 5} width="11" height="10" rx="3" transform={`rotate(-12 ${x} ${y})`} fill={h(alt ? c2 : c1)} stroke="rgba(0,0,0,.25)" strokeWidth="1.200" />
      ))
    )}
    {kind === 'lula' && <path d="M14 33c3-6 8-12 14-16" stroke="rgba(60,25,10,.4)" strokeWidth="2" strokeLinecap="round" fill="none" />}
  </g>
);

const tin = ([body, label, fill]) => (
  <g>
    <rect x="7" y="14" width="34" height="27" rx="4" fill={h(body)} stroke="rgba(0,0,0,.25)" strokeWidth="1.200" />
    <rect x="7" y="20" width="34" height="15" fill={h(label)} />
    <path d="M12 25h14M12 29h9" stroke="rgba(255,255,255,.7)" strokeWidth="1.600" strokeLinecap="round" />
    <ellipse cx="24" cy="14" rx="17" ry="4.500" fill="#D8DCE0" stroke="#9AA0A6" strokeWidth="1.200" />
    {fill && fill !== 'none' && <ellipse cx="24" cy="14" rx="13" ry="3.200" fill={h(fill)} />}
  </g>
);

const templates = { bar, slice, roll, bowl, cut, mince, drum, fish, can, glass, mug, cup, cookie, sweet, jar, heap, carton, tub, veg, dumpling, dish, salad, bread, wurst, burger, pizza, icecream, egg, fruit, nut, drinkware, sushi, skewer, tin };

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
