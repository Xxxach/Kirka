import { useState, useEffect } from 'react';
import { getApiBase, friendlyError } from '../api';
import { trackGoal } from '../analytics';
import { ThemedSelect as Select } from '../components/ThemedSelect';
import Collapse from '../components/Collapse';
import { AdSlot } from '../components/AdSlot';
import { FileDropzone } from '../components/FileDropzone';

// locked: true — режим закрыт на время бета-теста (тяжёлые операции).
// Чтобы открыть, достаточно убрать locked и суффикс «— скоро» в label
// (и включить HEAVY_MODES_ENABLED=true на photo-server).
const photoModeOptions = [
  { value: 'compress', label: 'Сжатие' },
  { value: 'bg-remove', label: 'Удаление фона — скоро', locked: true },
  { value: 'upscale', label: 'Увеличение качества' },
];

const compressLevelOptions = [
  { value: 'low', label: 'Слабое' },
  { value: 'medium', label: 'Нормальное' },
  { value: 'high', label: 'Сильное' },
];

// Должно совпадать с MAX_INPUT_SIDE и MAX_OUTPUT_PIXELS на photo-server.
const MAX_UPSCALE_SIDE = 4000;
const MAX_UPSCALE_OUTPUT_PIXELS = 64_000_000;

function readImageSize(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null); // браузер не смог открыть (например, HEIC) — пусть решает сервер
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

// Модель увеличения. «Улучшенная» откроется после переезда на мощный сервер.
const upscaleTierOptions = [
  { value: 'basic', label: 'Упрощённая (быстро, большие фото)' },
  { value: 'pro', label: 'Улучшенная — скоро', locked: true },
];

const scaleOptions = [
  { value: '2', label: 'x2' },
  { value: '4', label: 'x4' },
];

const barStyles = {
  idle: { width: '0%', transition: 'none' },
  loading: { width: '85%', transition: 'width 2.5s ease-out' },
  done: { width: '100%', transition: 'width 0.3s ease-out' },
};

export function PhotoPage() {
  const [photoForm, setPhotoForm] = useState({
    mode: photoModeOptions[0],
    compression: compressLevelOptions[1],
    scale: scaleOptions[0],
    tier: upscaleTierOptions[0],
  });
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fillState, setFillState] = useState('idle');

  const getResultLabel = () => {
    if (photoForm.mode.value === 'bg-remove') return 'без фона';
    if (photoForm.mode.value === 'upscale') {
      return `увеличено ${photoForm.scale.label}`;
    }
    const labels = {
      low: 'слабо сжатый',
      medium: 'средне сжатый',
      high: 'сильно сжатый',
    };
    return labels[photoForm.compression.value];
  };

  const getResultFileName = () => {
    if (!file) return '';
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    const ext = photoForm.mode.value === 'bg-remove' ? 'png' : 'jpg';
    return `${nameWithoutExt} - ${getResultLabel()}.${ext}`;
  };

  const handleGenerate = async () => {
    if (!file) {
      setError('Сначала выбери файл');
      return;
    }
    if (photoForm.mode.value === 'upscale') {
      const size = await readImageSize(file);
      if (size) {
        const k = Number(photoForm.scale.value);
        if (Math.max(size.w, size.h) > MAX_UPSCALE_SIDE) {
          setError(
            `Фото слишком большое для увеличения: до ${MAX_UPSCALE_SIDE} px по большей стороне. У тебя ${size.w}×${size.h}.`,
          );
          return;
        }
        if (size.w * size.h * k * k > MAX_UPSCALE_OUTPUT_PIXELS) {
          setError(
            `Результат получится слишком большим (${size.w * k}×${size.h * k}). ${k > 2 ? 'Выбери x2 или уменьши фото.' : 'Уменьши фото.'}`,
          );
          return;
        }
      }
    }
    setLoading(true);
    setError('');
    setFillState('loading');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', photoForm.mode.value);
      formData.append('compression', photoForm.compression.value);
      formData.append('scale', photoForm.scale.value);
      formData.append('tier', photoForm.tier.value);

      const photoApiUrl = await getApiBase('photo');
      const res = await fetch(`${photoApiUrl}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Не удалось обработать фото');
      }

      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);

      if (resultUrl) URL.revokeObjectURL(resultUrl);

      trackGoal('photo_processed', { mode: photoForm.mode.value });
      setFillState('done');
      await new Promise((r) => setTimeout(r, 300));
      setResultUrl(imageUrl);
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
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResultUrl(null);
  };

  const handleModeChange = (selectedOption) => {
    setPhotoForm((prev) => ({ ...prev, mode: selectedOption }));
  };

  const handleCompressChange = (selectedOption) => {
    setPhotoForm((prev) => ({ ...prev, compression: selectedOption }));
  };

  const handleTierChange = (selectedOption) => {
    setPhotoForm((prev) => ({ ...prev, tier: selectedOption }));
  };

  const handleScaleChange = (selectedOption) => {
    setPhotoForm((prev) => ({ ...prev, scale: selectedOption }));
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
        <div className="flex flex-col gap-1">
          <Select
            options={photoModeOptions}
            value={photoForm.mode}
            onChange={handleModeChange}
            isOptionDisabled={(option) => option.locked}
            placeholder="Выбери режим"
          />
          <p className="text-xs text-slate-400 px-1">
            Новые возможности будут открываться в ходе бета-теста.
          </p>
        </div>
        <Collapse show={photoForm.mode.value === 'compress'}>
          <Select
            options={compressLevelOptions}
            value={photoForm.compression}
            onChange={handleCompressChange}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </Collapse>
        <Collapse show={photoForm.mode.value === 'upscale'}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Select
                options={upscaleTierOptions}
                value={photoForm.tier}
                onChange={handleTierChange}
                isOptionDisabled={(option) => option.locked}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
              <p className="text-xs text-slate-400 px-1">
                Улучшенная модель с лучшей детализацией откроется в ходе бета-теста.
              </p>
            </div>
            <Select
              options={scaleOptions}
              value={photoForm.scale}
              onChange={handleScaleChange}
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
        </Collapse>

        <AdSlot />
        <div className="flex flex-col gap-1">
          {error && <p className="text-red-600 px-1">{error}</p>}
          <button
            className="bg-[#7A2432] hover:bg-[#5c1c28] rounded-full text-white px-12 py-3 shadow-sm transition-colors disabled:opacity-50"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Выполняю...' : 'Выполнить'}
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
          <FileDropzone
            accept="image/*"
            onChange={handleFileChange}
            fileName={file?.name}
            previewUrl={previewUrl}
            hint="Перетащи фото или нажми, чтобы выбрать"
          />
        </div>
        <div className="overflow-hidden">
          <div className="h-60">
            {resultUrl ? (
              <div className="relative h-60 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                <img
                  src={resultUrl}
                  alt="Результат"
                  className="h-full w-full object-contain p-3"
                />
                <span className="absolute bottom-1.5 left-1.5 text-center right-1.5 truncate rounded-lg bg-slate-900/60 px-2 py-1 text-xs text-white">
                  {getResultFileName()}
                </span>
              </div>
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
                download={getResultFileName()}
                className="inline-block text-center bg-blue-600 text-white rounded-2xl px-6 py-2 text-sm hover:bg-blue-700"
              >
                Скачать результат
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
