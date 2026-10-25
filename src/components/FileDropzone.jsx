import { useEffect, useState } from 'react';

function matchesAccept(accept) {
  if (!accept) return () => true;
  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  return (file) => {
    const name = file.name.toLowerCase();
    const type = (file.type || '').toLowerCase();
    return tokens.some((token) => {
      if (token.startsWith('.')) return name.endsWith(token);
      if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
      return type === token;
    });
  };
}

export function FileDropzone({
  onChange,
  accept,
  fileName,
  hint,
  previewUrl,
  multiple = false,
  title = 'Нажми, чтобы выбрать файл',
  onDropFiles,
}) {
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    if (!rejected) return undefined;
    const timer = setTimeout(() => setRejected(false), 2500);
    return () => clearTimeout(timer);
  }, [rejected]);

  const handleDragOver = (e) => {
    if (!Array.from(e.dataTransfer?.types || []).includes('Files')) return;
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (onDropFiles) {
      onDropFiles(e.dataTransfer);
      return;
    }
    const files = Array.from(e.dataTransfer.files).filter(matchesAccept(accept));
    if (!files.length) {
      setRejected(true);
      return;
    }
    onChange({ target: { files: multiple ? files : [files[0]], value: '' } });
  };

  const frame = dragging
    ? 'border-[#7A2432] bg-[#7A2432]/5'
    : 'border-slate-300 hover:border-[#7A2432]/50 bg-white';

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center gap-2 border border-dashed ${frame} h-60 rounded-2xl shadow-sm w-full cursor-pointer transition-colors text-center px-4 overflow-hidden`}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        className="hidden"
      />
      {previewUrl ? (
        <>
          <img
            src={previewUrl}
            alt={fileName || 'Выбранный файл'}
            className="absolute inset-0 h-full w-full object-contain p-3"
          />
          <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate rounded-lg bg-slate-900/60 px-2 py-1 text-xs text-white">
            {fileName}
          </span>
        </>
      ) : (
        <>
          <span className="text-sm font-medium text-slate-600 break-all">
            {dragging ? 'Отпусти, чтобы добавить' : title}
          </span>
          {hint && (
            <span className={`text-xs ${rejected ? 'text-red-600' : 'text-slate-400'}`}>
              {rejected ? 'Этот тип файла здесь не подходит' : hint}
            </span>
          )}
        </>
      )}
    </label>
  );
}
