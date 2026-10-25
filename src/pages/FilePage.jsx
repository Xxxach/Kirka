import { useState, useEffect } from 'react';
import { getApiBase, friendlyError } from '../api';
import { trackGoal } from '../analytics';
import { ThemedSelect as Select } from '../components/ThemedSelect';
import Collapse from '../components/Collapse';
import { AdSlot } from '../components/AdSlot';
import { FileDropzone } from '../components/FileDropzone';
import {
  ZIP_MAX_FILES,
  ZIP_MAX_BYTES,
  formatSize,
  safeArchiveName,
  zipFiles,
} from '../utils/zipFiles';

const categoryOptions = [
  { value: 'image', label: 'Изображение' },
  { value: 'document', label: 'Текст / документ' },
  { value: 'archive', label: 'В архив (ZIP)' },
];

const imageFormatOptions = [
  { value: 'png', label: '→ PNG' },
  { value: 'jpg', label: '→ JPG' },
  { value: 'webp', label: '→ WEBP' },
  { value: 'ico', label: '→ ICO (иконка)' },
];

const docFormatOptions = [
  { value: 'docx', label: '→ Word (.docx)' },
  { value: 'pdf', label: '→ PDF' },
];

const docTierOptions = [
  { value: 'basic', label: 'Упрощённая (только текст)' },
  { value: 'pro', label: 'Улучшенная (таблицы и фото)' },
];

const barStyles = {
  idle: { width: '0%', transition: 'none' },
  loading: { width: '85%', transition: 'width 2.5s ease-out' },
  done: { width: '100%', transition: 'width 0.3s ease-out' },
};

export function FilePage() {
  const [category, setCategory] = useState(categoryOptions[0]);
  const [imageFormat, setImageFormat] = useState(imageFormatOptions[0]);
  const [docFormat, setDocFormat] = useState(docFormatOptions[0]);
  const [docTier, setDocTier] = useState(docTierOptions[0]);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [zipName, setZipName] = useState('');
  const [zipInfo, setZipInfo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fillState, setFillState] = useState('idle');

  const isImage = category.value === 'image';
  const isDoc = category.value === 'document';
  const isArchive = category.value === 'archive';
  const filesTotal = files.reduce((sum, item) => sum + item.size, 0);

  const getResultFileName = () => {
    if (!file) return '';
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    const ext = isImage ? imageFormat.value : docFormat.value;
    return `${nameWithoutExt}.${ext}`;
  };

  const handleGenerate = async () => {
    if (!file) {
      setError('Сначала выбери файл');
      return;
    }
    setLoading(true);
    setError('');
    setFillState('loading');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (isImage) {
        formData.append('mode', 'convert');
        formData.append('target_format', imageFormat.value);
      } else {
        formData.append('mode', 'convert-doc');
        formData.append('target_format', docFormat.value);
        formData.append('tier', docTier.value);
      }

      const photoApiUrl = await getApiBase('photo');
      const res = await fetch(`${photoApiUrl}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Не удалось сконвертировать файл');
      }

      const blob = await res.blob();
      const fileUrl = URL.createObjectURL(blob);

      if (resultUrl) URL.revokeObjectURL(resultUrl);

      trackGoal('file_converted', { kind: isImage ? 'image' : 'document' });
      setFillState('done');
      await new Promise((r) => setTimeout(r, 300));
      setResultUrl(fileUrl);
    } catch (err) {
      setError(friendlyError(err));
      console.error(err);
    } finally {
      setLoading(false);
      setFillState('idle');
    }
  };

  const clearResult = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setZipInfo(null);
  };

  const addFiles = (incoming) => {
    const fresh = incoming.filter(
      (item) =>
        !files.some(
          (old) =>
            old.name === item.name &&
            old.size === item.size &&
            old.lastModified === item.lastModified,
        ),
    );
    if (!fresh.length) return;
    const next = [...files, ...fresh];
    if (next.length > ZIP_MAX_FILES) {
      setError(`Можно добавить до ${ZIP_MAX_FILES} файлов.`);
      return;
    }
    if (next.reduce((sum, item) => sum + item.size, 0) > ZIP_MAX_BYTES) {
      setError(`Общий размер не больше ${formatSize(ZIP_MAX_BYTES)}.`);
      return;
    }
    setError('');
    clearResult();
    setFiles(next);
  };

  const handleArchiveInput = (e) => {
    const picked = Array.from(e.target.files);
    e.target.value = '';
    addFiles(picked);
  };

  const removeFile = (index) => {
    clearResult();
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePack = async () => {
    if (!files.length) {
      setError('Сначала добавь файлы');
      return;
    }
    setLoading(true);
    setError('');
    setFillState('loading');
    try {
      const blob = await zipFiles(files);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      trackGoal('archive_created', { files: files.length });
      setFillState('done');
      await new Promise((r) => setTimeout(r, 300));
      setZipInfo({ count: files.length, size: blob.size });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(friendlyError(err));
      console.error(err);
    } finally {
      setLoading(false);
      setFillState('idle');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);

    setFile(selectedFile);
    setPreviewUrl(isImage ? URL.createObjectURL(selectedFile) : null);
    setResultUrl(null);
  };

  const handleCategoryChange = (option) => {
    setCategory(option);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setFiles([]);
    setPreviewUrl(null);
    setResultUrl(null);
    setZipInfo(null);
    setError('');
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 px-4 sm:px-5 py-1 gap-6 md:gap-10">
      <div className="flex flex-col justify-between gap-3">
        <div className="flex flex-col gap-3">
          <Select
            options={categoryOptions}
            value={category}
            onChange={handleCategoryChange}
            placeholder="Что конвертируем"
          />

          <Collapse show={isImage}>
            <Select
              options={imageFormatOptions}
              value={imageFormat}
              onChange={setImageFormat}
              placeholder="Формат на выходе"
            />
          </Collapse>

          <Collapse show={isDoc}>
            <div className="flex flex-col gap-2">
              <Select
                options={docFormatOptions}
                value={docFormat}
                onChange={setDocFormat}
                placeholder="Формат на выходе"
              />
              <Select
                options={docTierOptions}
                value={docTier}
                onChange={setDocTier}
                placeholder="Модель"
              />
              {docTier.value === 'basic' ? (
                <p className="text-xs text-amber-600">
                  Упрощённая переносит только текст — без таблиц и картинок в
                  документе. PDF-сканы (без текстового слоя) не распознаются.
                </p>
              ) : (
                <p className="text-xs text-amber-600">
                  Улучшенная (с таблицами и фото) пока не подключена в бете —
                  сработает только Упрощённая.
                </p>
              )}
            </div>
          </Collapse>

          <Collapse show={isArchive}>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={zipName}
                maxLength={60}
                onChange={(e) => setZipName(e.target.value)}
                placeholder="Имя архива (необязательно)"
                className="p-3 border border-slate-200 outline-none focus:border-[#7A2432]/50 focus:ring-1 focus:ring-[#7A2432]/30 bg-white rounded-xl w-full text-sm placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-500">
                Файлы упаковываются прямо в браузере и никуда не отправляются.
                Лимит: до {ZIP_MAX_FILES} файлов и {formatSize(ZIP_MAX_BYTES)} в сумме.
              </p>
            </div>
          </Collapse>
        </div>

        <AdSlot />

        <div className="flex flex-col gap-1">
          {error && <p className="text-red-600 px-1">{error}</p>}
          <button
            className="gel bg-[#7A2432] hover:bg-[#5c1c28] rounded-full text-white px-12 py-3 shadow-sm transition-colors disabled:opacity-50"
            onClick={isArchive ? handlePack : handleGenerate}
            disabled={loading}
          >
            {isArchive
              ? loading
                ? 'Упаковываю...'
                : 'Упаковать в ZIP'
              : loading
                ? 'Конвертирую...'
                : 'Конвертировать'}
          </button>
          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-[#7A2432] rounded-full"
              style={barStyles[fillState]}
            />
          </div>
        </div>
      </div>
      <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          {isArchive ? (
            <FileDropzone
              multiple
              onChange={handleArchiveInput}
              onDropFiles={addFiles}
              title={files.length ? 'Нажми, чтобы добавить ещё' : 'Нажми, чтобы выбрать файлы'}
              hint={
                files.length
                  ? `Добавлено: ${files.length} · ${formatSize(filesTotal)}`
                  : 'Любые файлы, можно перетащить сразу несколько'
              }
            />
          ) : (
            <FileDropzone
              accept={isImage ? 'image/*' : '.pdf,.docx,.doc'}
              onChange={handleFileChange}
              fileName={file?.name}
              previewUrl={previewUrl}
              hint={
                isImage
                  ? 'Перетащи картинку или нажми, чтобы выбрать'
                  : 'Перетащи PDF или Word-файл, либо нажми, чтобы выбрать'
              }
            />
          )}
        </div>
        <div className="overflow-hidden">
          <div className="h-60">
            {isArchive ? (
              files.length ? (
                <ul className="h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {files.map((item, index) => (
                    <li
                      key={`${item.name}-${item.size}-${item.lastModified}`}
                      className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-0"
                    >
                      <span className="min-w-0 flex-1 truncate text-slate-700">{item.name}</span>
                      <span className="shrink-0 text-xs text-slate-400">{formatSize(item.size)}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        aria-label={`Убрать ${item.name}`}
                        className="shrink-0 px-1 text-lg leading-none text-slate-400 transition-colors hover:text-[#7A2432]"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-60 flex items-center justify-center border border-dashed border-slate-300 rounded-2xl text-sm text-slate-400 text-center px-4">
                  Здесь появится список файлов
                </div>
              )
            ) : resultUrl ? (
              isImage ? (
                <div className="relative h-60 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                  <img
                    src={resultUrl}
                    alt="Результат"
                    className="h-full w-full object-contain p-3"
                  />
                  <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate rounded-lg bg-slate-900/60 px-2 py-1 text-xs text-white">
                    {getResultFileName()}
                  </span>
                </div>
              ) : (
                <div className="h-60 flex flex-col items-center justify-center gap-2 border border-slate-200 rounded-2xl shadow-sm bg-white text-center px-4">
                  <span className="text-sm font-medium text-slate-700 break-all">
                    {getResultFileName()}
                  </span>
                  <span className="text-xs text-emerald-600">Готово</span>
                </div>
              )
            ) : (
              <div className="h-60 flex items-center justify-center border border-dashed border-slate-300 rounded-2xl text-sm text-slate-400 text-center px-4">
                Здесь появится результат
              </div>
            )}
          </div>
          <div className="h-12 mt-2">
            {resultUrl && (
              <a
                href={resultUrl}
                download={isArchive ? safeArchiveName(zipName) : getResultFileName()}
                className="inline-block text-center bg-blue-600 text-white rounded-2xl px-6 py-2 text-sm hover:bg-blue-700"
              >
                {isArchive && zipInfo
                  ? `Скачать архив · ${zipInfo.count} файл. · ${formatSize(zipInfo.size)}`
                  : 'Скачать результат'}
              </a>
            )}
            {isArchive && !resultUrl && files.length > 0 && (
              <p className="px-1 pt-2 text-xs text-slate-400">
                Всего: {files.length} из {ZIP_MAX_FILES} файлов, {formatSize(filesTotal)} из{' '}
                {formatSize(ZIP_MAX_BYTES)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
