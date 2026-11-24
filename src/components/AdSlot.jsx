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
      className={`${height} w-full rounded-2xl ad-slot flex items-center justify-center ${className}`}
    >
      <span className="px-3 text-center text-xs font-semibold text-white select-none">Здесь может быть ваша реклама</span>
    </div>
  );
}
