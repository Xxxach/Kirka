import { useState, useEffect } from 'react';
import { ThemedSelect as Select } from '../components/ThemedSelect';
import Collapse from '../components/Collapse';
import { AdSlot } from '../components/AdSlot';
import { FileDropzone } from '../components/FileDropzone';

const photoModeOptions = [
  { value: 'compress', label: 'Сжатие' },
  { value: 'bg-remove', label: 'Удаление фона' },
  { value: 'upscale', label: 'Увеличение качества' },
];

const compressLevelOptions = [
  { value: 'low', label: 'Слабое' },
  { value: 'medium', label: 'Нормальное' },
  { value: 'high', label: 'Сильное' },
];

const scaleOptions = [
  { value: '2', label: 'x2' },
  { value: '3', label: 'x3' },
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
    setLoading(true);
    setError('');
    setFillState('loading');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', photoForm.mode.value);
      formData.append('compression', photoForm.compression.value);
      formData.append('scale', photoForm.scale.value);

      const photoApiUrl =
        import.meta.env.VITE_PHOTO_API_URL || 'http://localhost:5001';
      const res = await fetch(`${photoApiUrl}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Не удалось обработать фото');
      }

      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);

      if (resultUrl) URL.revokeObjectURL(resultUrl);

      setFillState('done');
      await new Promise((r) => setTimeout(r, 300));
      setResultUrl(imageUrl);
    } catch (err) {
      setError(err.message);
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
        <Select
          options={photoModeOptions}
          value={photoForm.mode}
          onChange={handleModeChange}
          placeholder="Выбери режим"
        />
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
          <Select
            options={scaleOptions}
            value={photoForm.scale}
            onChange={handleScaleChange}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
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
