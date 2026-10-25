export const ZIP_MAX_FILES = 300;
export const ZIP_MAX_BYTES = 100 * 1024 * 1024;

const STORE_EXT = /\.(jpe?g|png|gif|webp|avif|heic|zip|rar|7z|gz|mp3|m4a|aac|ogg|mp4|mov|mkv|webm|pdf|docx|xlsx|pptx)$/i;
const MIN_DATE = Date.UTC(1980, 0, 1);

export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${Number((bytes / 1024 / 1024).toFixed(1))} МБ`;
}

export const itemKey = (item) => `${item.path}|${item.file.size}|${item.file.lastModified}`;

export function uniqueName(path, used) {
  if (!used.has(path)) {
    used.add(path);
    return path;
  }
  const slash = path.lastIndexOf('/');
  const dir = path.slice(0, slash + 1);
  const name = path.slice(slash + 1);
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let n = 2;
  while (used.has(`${dir}${base} (${n})${ext}`)) n += 1;
  const next = `${dir}${base} (${n})${ext}`;
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

export function groupItems(items) {
  const groups = [];
  const folders = new Map();
  for (const item of items) {
    const slash = item.path.indexOf('/');
    if (slash === -1) {
      groups.push({ key: itemKey(item), name: item.path, size: item.file.size, count: 1, folder: false });
      continue;
    }
    const top = item.path.slice(0, slash);
    let group = folders.get(top);
    if (!group) {
      group = { key: `dir:${top}`, name: top, size: 0, count: 0, folder: true };
      folders.set(top, group);
      groups.push(group);
    }
    group.size += item.file.size;
    group.count += 1;
  }
  return groups;
}

export function removeGroup(items, group) {
  return items.filter((item) =>
    group.folder ? !item.path.startsWith(`${group.name}/`) : itemKey(item) !== group.key,
  );
}

async function pushFile(entry, file) {
  if (typeof file.stream !== 'function') {
    entry.push(new Uint8Array(await file.arrayBuffer()), true);
    return;
  }
  const reader = file.stream().getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      entry.push(new Uint8Array(0), true);
      return;
    }
    entry.push(value);
  }
}

export async function zipFiles(items) {
  const { Zip, ZipPassThrough, ZipDeflate } = await import('fflate');
  const used = new Set();
  const chunks = [];
  await new Promise((resolve, reject) => {
    const zip = new Zip((err, chunk, final) => {
      if (err) {
        reject(err);
        return;
      }
      chunks.push(chunk);
      if (final) resolve();
    });
    (async () => {
      try {
        for (const { file, path } of items) {
          const name = uniqueName(path, used);
          const entry = STORE_EXT.test(name) ? new ZipPassThrough(name) : new ZipDeflate(name, { level: 6 });
          entry.mtime = Math.max(file.lastModified || Date.now(), MIN_DATE);
          zip.add(entry);
          await pushFile(entry, file);
        }
        zip.end();
      } catch (e) {
        reject(e);
      }
    })();
  });
  return new Blob(chunks, { type: 'application/zip' });
}
