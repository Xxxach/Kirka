import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { TextPage } from './pages/TextPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Header } from './components/Header';
import { useAdBlockDetector } from './hooks/useAdBlockDetector';

const loadPhotoPage = () =>
  import('./pages/PhotoPage').then((m) => ({ default: m.PhotoPage }));
const loadKodPage = () =>
  import('./pages/KodPage').then((m) => ({ default: m.KodPage }));
const loadFilePage = () =>
  import('./pages/FilePage').then((m) => ({ default: m.FilePage }));

const PhotoPage = lazy(loadPhotoPage);
const KodPage = lazy(loadKodPage);
const FilePage = lazy(loadFilePage);

function App() {
  const adBlocked = useAdBlockDetector();

  useEffect(() => {
    // Тихо докачиваем остальные страницы, когда браузер свободен
    // (после первой отрисовки, вне ввода/анимаций) — чтобы переход
    // на "Фото"/"Код" был мгновенным, а не тормозил первую загрузку.
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
    const cancelIdle = window.cancelIdleCallback || clearTimeout;

    const id = idle(() => {
      loadPhotoPage();
      loadKodPage();
      loadFilePage();
    });

    return () => cancelIdle(id);
  }, []);

  if (adBlocked) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm px-6">
        <div className="max-w-sm text-center bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Обнаружен блокировщик рекламы
          </h2>
          <p className="text-sm text-slate-500 mb-5">
            Сайт бесплатный только благодаря рекламе. Отключи AdBlock для
            этого сайта и обнови страницу.
          </p>
          <button
            className="bg-[#7A2432] hover:bg-[#5c1c28] rounded-full text-white px-8 py-2.5 transition-colors"
            onClick={() => window.location.reload()}
          >
            Я отключил, обновить
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Header />
      <Suspense fallback={null}>
        <Routes>
          <Route index element={<TextPage />} />
          <Route path="photo-page" element={<PhotoPage />} />
          <Route path="kod-page" element={<KodPage />} />
          <Route path="file-page" element={<FilePage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <footer className="text-center py-4">
        <Link
          to="/privacy"
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Политика конфиденциальности
        </Link>
      </footer>
    </BrowserRouter>
  );
}

export default App;
