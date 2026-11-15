// Иконка продукта: обычный эмодзи или своя SVG-картинка, если в стандарте эмодзи нет
// (поле emoji вида 'svg:имя').
function ChipsBag() {
  return (
    <svg viewBox="0 0 48 48" width="1.2em" height="1.2em" aria-hidden="true" focusable="false">
      <path
        d="M9 6 12 9 15 6 18 9 21 6 24 9 27 6 30 9 33 6 36 9 39 6C41.5 17 41.5 31 39 42L36 39 33 42 30 39 27 42 24 39 21 42 18 39 15 42 12 39 9 42C6.5 31 6.5 17 9 6Z"
        fill="#F0B429"
        stroke="#9A5B0B"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M13.5 13C12.6 21 12.6 29 13.5 36" stroke="#fff" strokeOpacity=".45" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <ellipse cx="24" cy="24" rx="8.5" ry="7" fill="#D64533" />
      <ellipse cx="24" cy="24" rx="5" ry="4" fill="#FBE08A" stroke="#9A5B0B" strokeWidth="1.1" />
      <path d="M21 23.5c1.2-.9 2.6-.9 3.6 0M23.2 25.4c1-.6 2-.5 2.8.2" stroke="#C98A1B" strokeWidth=".9" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const custom = {
  'svg:chips': ChipsBag,
};

export function FoodIcon({ icon }) {
  const Custom = custom[icon];
  if (Custom) return <Custom />;
  return <span aria-hidden="true">{icon}</span>;
}
