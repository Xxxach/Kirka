/**
 * Заглушка под рекламный блок. Когда подключишь реальную сеть
 * (Яндекс.Директ / AdSense и т.п.) — код показа баннера добавляется
 * сюда, в одно место, вместо трёх разных.
 */
export function AdSlot({ className = '', height = 'h-14' }) {
  return (
    <div
      role="complementary"
      aria-label="Реклама"
      className={`${height} w-full rounded-2xl border border-slate-200/60 bg-linear-to-r from-gray-600 via-gray-500 to-gray-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_2px_8px_-2px_rgba(0,0,0,0.08)] flex items-center justify-center ${className}`}
    >
      <span className="text-xs text-white/70 select-none">Реклама</span>
    </div>
  );
}
