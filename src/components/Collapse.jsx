function Collapse({ show, children }) {
  return (
    <div
      className={`transition-all duration-300 ${
        show
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 -translate-x-4 pointer-events-none absolute'
      }`}
    >
      {children}
    </div>
  );
}

export default Collapse;
