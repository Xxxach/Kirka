export const ZIP_MAX_FILES = 30;
export const ZIP_MAX_BYTES = 50 * 1024 * 1024;

const STORE_EXT = /\.(jpe?g|png|gif|webp|avif|heic|zip|rar|7z|gz|mp3|m4a|aac|ogg|mp4|mov|mkv|webm|pdf|docx|xlsx|pptx)$/i;
const MIN_DATE = Date.UTC(1980, 0, 1);

export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

export function uniqueName(name, used) {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let n = 2;
  while (used.has(`${base} (${n})${ext}`)) n += 1;
  const next = `${base} (${n})${ext}`;
  used.add(next);
  return next;
}

export function safeArchiveName(raw) {
  const clean = raw
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()
    .replace(/\.zip$/i, '')
    .slice(0, 60)
    .trim();
  return `${clean || 'archive'}.zip`;
}

export async function zipFiles(files) {
  const { zip } = await import('fflate');
  const used = new Set();
  const entries = {};
  for (const file of files) {
    const data = new Uint8Array(await file.arrayBuffer());
    entries[uniqueName(file.name, used)] = [
      data,
      {
        level: STORE_EXT.test(file.name) ? 0 : 6,
        mtime: Math.max(file.lastModified || Date.now(), MIN_DATE),
      },
    ];
  }
  const out = await new Promise((resolve, reject) => {
    zip(entries, (err, data) => (err ? reject(err) : resolve(data)));
  });
  return new Blob([out], { type: 'application/zip' });
}
