const JUNK = /(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini)$/i;

const readFile = (entry) => new Promise((resolve, reject) => entry.file(resolve, reject));

async function readAll(reader) {
  const all = [];
  for (;;) {
    const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
    if (!batch.length) return all;
    all.push(...batch);
  }
}

async function walk(entry, prefix, out, limit) {
  if (out.items.length > limit) {
    out.truncated = true;
    return;
  }
  if (entry.isFile) {
    const path = `${prefix}${entry.name}`;
    if (!JUNK.test(path)) out.items.push({ file: await readFile(entry), path });
    return;
  }
  const children = await readAll(entry.createReader());
  for (const child of children) {
    if (out.truncated) return;
    await walk(child, `${prefix}${entry.name}/`, out, limit);
  }
}

export async function collectDropped(dataTransfer, limit) {
  const entries = Array.from(dataTransfer.items || [])
    .map((item) => item.webkitGetAsEntry?.())
    .filter(Boolean);
  if (!entries.length) {
    const items = Array.from(dataTransfer.files || [])
      .filter((file) => !JUNK.test(file.name))
      .map((file) => ({ file, path: file.name }));
    return { items, truncated: false };
  }
  const out = { items: [], truncated: false };
  for (const entry of entries) {
    if (out.truncated) break;
    await walk(entry, '', out, limit);
  }
  return out;
}
