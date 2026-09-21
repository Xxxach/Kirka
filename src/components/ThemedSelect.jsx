import Select, { components } from 'react-select';

const accentTheme = (theme) => ({
  ...theme,
  borderRadius: 8,
  colors: {
    ...theme.colors,
    primary: '#7A2432',
    primary75: '#a45a63',
    primary50: '#e9d6da',
    primary25: '#f3e8ea',
    neutral20: '#cbd5e1',
    neutral30: '#94a3b8',
  },
});

// Стрелочка плавно разворачивается при открытии списка.
function DropdownIndicator(props) {
  return (
    <components.DropdownIndicator {...props}>
      <svg
        viewBox="0 0 20 20"
        width={16}
        height={16}
        style={{
          transform: props.selectProps.menuIsOpen
            ? 'rotate(180deg)'
            : 'rotate(0deg)',
          transition: 'transform 300ms ease',
        }}
      >
        <path
          d="M5 7l5 5 5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </components.DropdownIndicator>
  );
}

const defaultStyles = {
  menu: (base) => ({
    ...base,
    animation: 'kirka-select-fade 220ms ease-out',
  }),
  option: (base) => ({
    ...base,
    transition: 'background-color 160ms ease, color 160ms ease',
  }),
};

// Аккуратно совмещает наши стили по умолчанию с теми, что передаст
// конкретная страница (например menuPortal у PhotoPage), не затирая их.
function mergeStyles(base, overrides = {}) {
  const merged = { ...base };
  for (const key of Object.keys(overrides)) {
    const baseFn = base[key];
    const overrideFn = overrides[key];
    merged[key] = baseFn
      ? (styles, state) => overrideFn(baseFn(styles, state), state)
      : overrideFn;
  }
  return merged;
}

export function ThemedSelect({
  components: customComponents,
  styles,
  ...rest
}) {
  return (
    <Select
      {...rest}
      theme={accentTheme}
      components={{ DropdownIndicator, ...customComponents }}
      styles={mergeStyles(defaultStyles, styles)}
    />
  );
}
