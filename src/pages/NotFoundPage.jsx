import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex items-center justify-center px-5 py-20">
      <div className="max-w-sm text-center bg-white/70 rounded-3xl border border-white/60 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] p-8">
        <p className="text-5xl font-semibold text-[#7A2432] mb-2">404</p>
        <h1 className="text-lg font-semibold text-slate-800 mb-2">
          Такой страницы нет
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Возможно, адрес набран с ошибкой или страница была перемещена.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#7A2432] hover:bg-[#5c1c28] rounded-full text-white px-8 py-2.5 transition-colors"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
