import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { modeOptions, modeGroups } from '../src/data/textModes.js';
import { textAbout, NO_PROMPT_LEAD } from '../src/data/textAbout.js';
import { toolAbout } from '../src/data/toolAbout.js';
import { calorieSections } from '../src/data/calorieSections.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const SITE = (process.env.SITE_URL || 'https://kirka-ai.ru').replace(/\/+$/, '');

const staticPages = [
  {
    slug: 'photo-page',
    title: 'Фото: сжатие и обработка — Kirka',
    description: 'Сжатие и улучшение фото онлайн: уменьшите размер снимка или добавьте резкость прямо в браузере. Бесплатно и без регистрации.',
  },
  {
    slug: 'kod-page',
    title: 'Перевод кода между языками — Kirka',
    description: 'Перевод кода онлайн между JavaScript, TypeScript, Python, Java и C#. ИИ без промптов, бесплатно и без регистрации.',
  },
  {
    slug: 'file-page',
    title: 'Конвертация файлов: PDF, Word, изображения — Kirka',
    description: 'Конвертация файлов онлайн: PDF, Word и изображения, а также упаковка файлов в ZIP-архив. Бесплатно и без регистрации.',
  },
  {
    slug: 'chisla-page',
    title: 'Калькулятор калорий и БЖУ без граммов — Kirka',
    description: 'Калькулятор калорий и БЖУ онлайн без граммов: выберите продукт и порцию в ложках, чашках или штуках. Бесплатно и без регистрации.',
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
  { slug: 'chisla-page', label: 'Калькулятор калорий' },
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

const cleanTitle = (title) => title.replace(/\s+[\u2014-]\s+Kirka$/, '');

const aboutOf = ({ mode, slug }) => (mode ? textAbout[mode.value] : toolAbout[slug]);

const calorieHtml = () =>
  `<h2>Калорийность продуктов на 100 г</h2>${calorieSections()
    .map(
      (section) =>
        `<h3>${esc(section.label)}</h3><table><thead><tr><th>Продукт</th><th>Ккал</th><th>Б</th><th>Ж</th><th>У</th></tr></thead><tbody>${section.rows
          .map((row) => `<tr><td>${esc(row.name)}</td><td>${row.kcal}</td><td>${row.p}</td><td>${row.f}</td><td>${row.c}</td></tr>`)
          .join('')}</tbody></table>`,
    )
    .join('')}`;

const bodyHtml = (page) => {
  const { title, description, mode } = page;
  const about = aboutOf(page);
  if (!about) {
    return `<h1>${esc(cleanTitle(title))}</h1><p>${esc(description)}</p>${navHtml}`;
  }
  const lead = mode ? NO_PROMPT_LEAD : about.lead;
  const pointList = mode ? mode.points : about.points;
  const faq = about.faq
    .map((item) => `<h3>${esc(item.q)}</h3><p>${esc(item.a)}</p>`)
    .join('');
  const points = pointList.map((point) => `<li>${esc(point)}</li>`).join('');
  const table = page.slug === 'chisla-page' ? calorieHtml() : '';
  return `<h1>${esc(about.h1)}</h1><p>${esc(`${lead} ${about.intro}`)}</p><ul>${points}</ul><h2>Частые вопросы</h2>${faq}${table}${navHtml}`;
};

const ldScript = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

// Микроразметка для поисковиков: вопросы-ответы, хлебные крошки и описание приложения.
const jsonLd = (page) => {
  const out = [];
  const about = aboutOf(page);
  if (about) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: about.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }
  if (page.slug) {
    const url = `${SITE}/${page.slug}/`;
    const name = cleanTitle(page.title);
    out.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Kirka', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name, item: url },
      ],
    });
    if (toolAbout[page.slug]) {
      out.push({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name,
        url,
        description: page.description,
        applicationCategory: page.slug === 'chisla-page' ? 'HealthApplication' : 'UtilitiesApplication',
        operatingSystem: 'Any',
        inLanguage: 'ru',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'RUB' },
      });
    }
  }
  return out.map(ldScript).join('');
};

const rootPattern = /<div id="root">[\s\S]*?<\/div>/;

const withBody = (html, page) => {
  let out = replaceOnce(html, rootPattern, () => `<div id="root">${bodyHtml(page)}</div>`);
  const ld = jsonLd(page);
  if (ld) out = replaceOnce(out, /<\/head>/, () => `${ld}</head>`);
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

  if (existsSync(join(root, 'public', 'og', `${slug}.png`))) {
    const image = `${SITE}/og/${slug}.png`;
    const alt = title.replace(/\s+[\u2014-]\s+Kirka$/, '');
    html = replaceOnce(html, /(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`);
    html = replaceOnce(html, /(<meta property="og:image:alt" content=")[^"]*(")/, `$1${esc(alt)}$2`);
    html = replaceOnce(html, /(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`);
  }

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
