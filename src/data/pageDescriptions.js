import { modeByPath } from './textModes';

const textDescriptions = Object.fromEntries(
  Object.entries(modeByPath).map(([path, mode]) => [
    path,
    { title: mode.label, text: mode.description, points: mode.points },
  ]),
);

export const pageDescriptions = {
  ...textDescriptions,
  '/photo-page': {
    title: 'Фото-моменты',
    text: 'Сжатие и обработка фотографий прямо на сайте, без установки программ.',
    points: ['Сжатие фото', 'Обработка изображений'],
  },
  '/kod-page': {
    title: 'Код-моменты',
    text: 'ИИ без промптов: выберите языки, вставьте код и нажмите кнопку. Перевод из одного языка программирования в другой.',
    points: ['Перевод между языками', 'Быстрый результат'],
  },
  '/file-page': {
    title: 'Файл-моменты',
    text: 'Конвертация файлов из одного формата в другой.',
    points: ['PDF', 'Word', 'Изображения'],
  },
};

export const defaultDescription = {
  title: 'Kirka',
  text: 'ИИ без промптов: выберите вид, нажмите кнопку, и текст готов. Бесплатный сервис: тексты, перевод кода, сжатие фото и конвертация файлов.',
  points: [],
};

export const descriptionFooter =
  'Сервис бесплатный и находится в бета-тесте. Дневной лимит: 30-300 запросов.';
