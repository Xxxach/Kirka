import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { modeOptions, modeGroups } from '../src/data/textModes.js';
import { textAbout, NO_PROMPT_LEAD } from '../src/data/textAbout.js';

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
    description: 'ИИ без промптов: перевод кода с одного языка программирования на другой. Выберите языки, нажмите, готово. Бесплатно.',
  },
  {
    slug: 'file-page',
    title: 'Конвертация файлов: PDF, Word, изображения — Kirka',
    description: 'Конвертация файлов онлайн: PDF, Word и изображения, а также упаковка файлов в ZIP-архив. Бесплатно и без регистрации.',
  },
  {
    slug: 'privacy',
    title: 'Политика конфиденциальности — Kirka',
    description: 'Какие данные обрабатывает Kirka, зачем, как долго хранит и как вы можете ими управлять.',
  },
];

const textPages = modeOptions
  .filter((mode) => mode.slug)
  .map((mode) => ({
    slug: mode.slug,
    title: mode.title,
    description: mode.description,
    mode,
  }));

const pages = [...textPages, ...staticPages];

const toolLinks = [
  { slug: 'photo-page', label: 'Фото: сжатие и обработка' },
  { slug: 'kod-page', label: 'Перевод кода' },
  { slug: 'file-page', label: 'Конвертация файлов' },
];

const esc = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const source = readFileSync(join(dist, 'index.html'), 'utf8');

const href = (slug) => (slug ? `/${slug}/` : '/');

const navHtml = `<nav>${[
  ...modeGroups.map(
    (group) =>
      `<h2>${esc(group.label)}</h2><ul>${group.options
        .map((option) => `<li><a href="${href(option.slug)}">${esc(option.label)}</a></li>`)
        .join('')}</ul>`,
  ),
  `<h2>Инструменты</h2><ul>${toolLinks
    .map((tool) => `<li><a href="${href(tool.slug)}">${esc(tool.label)}</a></li>`)
    .join('')}<li><a href="/privacy/">Политика конфиденциальности</a></li></ul>`,
].join('')}</nav>`;

const bodyHtml = ({ title, description, mode }) => {
  const about = mode ? textAbout[mode.value] : null;
  if (!about) {
    return `<h1>${esc(title.replace(/\s+[—-]\s+Kirka$/, ''))}</h1><p>${esc(description)}</p>${navHtml}`;
  }
  const faq = about.faq
    .map((item) => `<h3>${esc(item.q)}</h3><p>${esc(item.a)}</p>`)
    .join('');
  const points = mode.points.map((point) => `<li>${esc(point)}</li>`).join('');
  return `<h1>${esc(about.h1)}</h1><p>${esc(`${NO_PROMPT_LEAD} ${about.intro}`)}</p><ul>${points}</ul><h2>Частые вопросы</h2>${faq}${navHtml}`;
};

const faqJsonLd = (mode) => {
  const about = textAbout[mode.value];
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: about.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
};

const rootPattern = /<div id="root">[\s\S]*?<\/div>/;

const withBody = (html, page) => {
  let out = replaceOnce(html, rootPattern, () => `<div id="root">${bodyHtml(page)}</div>`);
  if (page.mode && textAbout[page.mode.value]) {
    out = replaceOnce(out, /<\/head>/, () => `${faqJsonLd(page.mode)}</head>`);
  }
  return out;
};

const replaceOnce = (html, pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`Не найден фрагмент: ${pattern}`);
  return html.replace(pattern, replacement);
};

pages.forEach((page) => {
  const { slug, title, description } = page;
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

  html = withBody(html, page);

  const dir = join(dist, slug);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
});

const rootMode = modeOptions.find((mode) => !mode.slug);
writeFileSync(
  join(dist, 'index.html'),
  withBody(source, { title: rootMode.title, description: rootMode.description, mode: rootMode }),
);

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
