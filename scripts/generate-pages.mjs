import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { modeOptions } from '../src/data/textModes.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const SITE = (process.env.SITE_URL || 'https://kirka-ai.ru').replace(/\/+$/, '');

const staticPages = [
  {
    slug: 'photo-page',
    title: 'Фото: сжатие и обработка — Kirka',
    description: 'Сжатие и обработка фотографий онлайн: уменьшите размер фото прямо в браузере. Бесплатно и без регистрации.',
  },
  {
    slug: 'kod-page',
    title: 'Перевод кода между языками — Kirka',
    description: 'Перевод кода с одного языка программирования на другой с помощью ИИ. Бесплатно и без регистрации.',
  },
  {
    slug: 'file-page',
    title: 'Конвертация файлов: PDF, Word, изображения — Kirka',
    description: 'Конвертация файлов онлайн: PDF, Word и изображения. Бесплатно и без регистрации.',
  },
  {
    slug: 'privacy',
    title: 'Политика конфиденциальности — Kirka',
    description: 'Какие данные обрабатывает Kirka, зачем, как долго хранит и как вы можете ими управлять.',
  },
];

const pages = [
  ...modeOptions
    .filter((mode) => mode.slug)
    .map((mode) => ({ slug: mode.slug, title: mode.title, description: mode.description })),
  ...staticPages,
];

const esc = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const source = readFileSync(join(dist, 'index.html'), 'utf8');

const replaceOnce = (html, pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`Не найден фрагмент: ${pattern}`);
  return html.replace(pattern, replacement);
};

pages.forEach(({ slug, title, description }) => {
  const url = `${SITE}/${slug}/`;
  let html = source;
  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = replaceOnce(
    html,
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${esc(description)}$2`,
  );
  html = replaceOnce(html, /(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  html = replaceOnce(
    html,
    /(<meta property="og:title"\s+content=")[^"]*(")/,
    `$1${esc(title)}$2`,
  );
  html = replaceOnce(
    html,
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
    `$1${esc(description)}$2`,
  );
  html = replaceOnce(html, /(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);

  const dir = join(dist, slug);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
});

const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${SITE}/`, priority: '1.0' },
  ...pages.map(({ slug }) => ({
    loc: `${SITE}/${slug}/`,
    priority: slug === 'privacy' ? '0.3' : '0.8',
  })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, priority }) =>
      `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>
`;
writeFileSync(join(dist, 'sitemap.xml'), sitemap);

console.log(`Сгенерировано страниц: ${pages.length}`);
