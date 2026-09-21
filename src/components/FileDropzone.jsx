export function FileDropzone({ onChange, accept, fileName, hint, previewUrl }) {
  return (
    <label className="relative flex flex-col items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-[#7A2432]/50 bg-white h-60 rounded-2xl shadow-sm w-full cursor-pointer transition-colors text-center px-4 overflow-hidden">
      <input type="file" accept={accept} onChange={onChange} className="hidden" />
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
            Нажми, чтобы выбрать файл
          </span>
          {hint && <span className="text-xs text-slate-400">{hint}</span>}
        </>
      )}
    </label>
  );
}
