export const modeGroups = [
  {
    label: 'Работа и документы',
    options: [
      {
        value: 'resume',
        slug: '',
        label: 'Резюме',
        title: 'Kirka (Кирка) — ИИ без промптов: тексты, код, фото и файлы',
        description: 'ИИ без промптов: выберите сферу и опыт, нажмите кнопку и получите готовое резюме. Бесплатно, без регистрации.',
        points: ['Резюме', 'Опыт и навыки', 'Без регистрации'],
      },
      {
        value: 'letter',
        slug: 'soprovoditelnoe-pismo',
        label: 'Сопроводительное письмо',
        title: 'Сопроводительное письмо онлайн с ИИ — Kirka',
        description: 'ИИ без промптов: сопроводительное письмо к резюме за минуту. Выберите сферу, нажмите, готово. Бесплатно.',
        points: ['К вакансии', 'Ваш опыт', 'Деловой стиль'],
      },
      {
        value: 'claim',
        slug: 'zayavlenie-pretenziya',
        label: 'Заявление / претензия',
        title: 'Заявление и претензия онлайн с ИИ — Kirka',
        description: 'ИИ без промптов: опишите ситуацию своими словами и получите заявление или претензию в официальном стиле. Бесплатно.',
        points: ['Претензия', 'Заявление', 'Официальный стиль'],
      },
      {
        value: 'business',
        slug: 'delovoe-pismo',
        label: 'Деловое письмо',
        title: 'Деловое письмо онлайн с ИИ — Kirka',
        description: 'ИИ без промптов: деловое письмо партнёру, клиенту или начальнику. Выберите тон, нажмите, готово. Бесплатно.',
        points: ['Партнёрам', 'Клиентам', 'Вежливый тон'],
      },
      {
        value: 'vacancy',
        slug: 'opisanie-vakansii',
        label: 'Описание вакансии',
        title: 'Описание вакансии онлайн с ИИ — Kirka',
        description: 'ИИ без промптов: описание вакансии с обязанностями, требованиями и условиями за минуту. Бесплатно, без регистрации.',
        points: ['Обязанности', 'Требования', 'Условия'],
      },
      {
        value: 'reference',
        slug: 'harakteristika',
        label: 'Характеристика',
        title: 'Характеристика с места работы или учёбы онлайн — Kirka',
        description: 'ИИ без промптов: характеристика на сотрудника или ученика в деловом стиле. Выберите, нажмите, готово. Бесплатно.',
        points: ['С места работы', 'С места учёбы', 'Деловой стиль'],
      },
      {
        value: 'motivation',
        slug: 'motivacionnoe-pismo',
        label: 'Мотивационное письмо',
        title: 'Мотивационное письмо онлайн с ИИ — Kirka',
        description: 'ИИ без промптов: мотивационное письмо для вуза, стажировки или программы. Расскажите о себе и получите текст.',
        points: ['Для вуза', 'Для стажировки', 'О себе'],
      },
    ],
  },
  {
    label: 'Продажи и бизнес',
    options: [
      {
        value: 'marketplace',
        slug: 'opisanie-tovara',
        label: 'Описание товара для маркетплейса',
        title: 'Описание товара для Wildberries, Ozon, Яндекс Маркета — Kirka',
        description: 'ИИ без промптов: описание товара для Wildberries, Ozon и Яндекс Маркета с ключевыми словами. Бесплатно.',
        points: ['Wildberries', 'Ozon', 'Яндекс Маркет'],
      },
      {
        value: 'ad',
        slug: 'obyavlenie',
        label: 'Объявление',
        title: 'Текст объявления для Авито онлайн с ИИ — Kirka',
        description: 'ИИ без промптов: текст объявления для Авито и других площадок. Заполните поля, нажмите, готово. Бесплатно.',
        points: ['Авито', 'Продажа', 'Без воды'],
      },
      {
        value: 'review',
        slug: 'otvet-na-otzyv',
        label: 'Ответ на отзыв',
        title: 'Ответ на отзыв клиента онлайн с ИИ — Kirka',
        description: 'ИИ без промптов: вежливый ответ на отзыв покупателя, хороший или негативный. Вставьте отзыв, нажмите, готово.',
        points: ['Негативные', 'Положительные', 'Вежливо'],
      },
      {
        value: 'slogan',
        slug: 'slogan',
        label: 'Слоган / название',
        title: 'Придумать слоган для бизнеса онлайн с ИИ — Kirka',
        description: 'ИИ без промптов: слоганы для бизнеса в разных стилях, несколько вариантов на выбор. Бесплатный генератор.',
        points: ['Несколько вариантов', 'Разные стили', 'Для бизнеса'],
      },
      {
        value: 'service',
        slug: 'opisanie-uslugi',
        label: 'Описание услуги',
        title: 'Описание услуги для профиля или сайта онлайн — Kirka',
        description: 'ИИ без промптов: описание услуги для профиля, сайта или объявления: выгода клиента и что входит. Бесплатно.',
        points: ['Для профиля', 'Для сайта', 'Выгода клиента'],
      },
    ],
  },
  {
    label: 'Соцсети и общение',
    options: [
      {
        value: 'post',
        slug: 'post-dlya-socsetej',
        label: 'Пост для соцсети',
        title: 'Пост для VK, Telegram и Instagram онлайн с ИИ — Kirka',
        description: 'ИИ без промптов: пост для VK, Telegram и Instagram с цепляющим началом и призывом. Выберите тему и нажмите.',
        points: ['VK', 'Telegram', 'Instagram'],
      },
      {
        value: 'greeting',
        slug: 'pozdravlenie',
        label: 'Поздравление',
        title: 'Поздравление с праздником онлайн с ИИ — Kirka',
        description: 'ИИ без промптов: тёплое поздравление на любой повод. Выберите праздник и тон, нажмите, готово.',
        points: ['День рождения', 'Юбилей', 'Свадьба'],
      },
      {
        value: 'toast',
        slug: 'tost',
        label: 'Тост / речь',
        title: 'Тост на день рождения, юбилей и свадьбу онлайн — Kirka',
        description: 'ИИ без промптов: тост или речь на день рождения, юбилей и свадьбу. Выберите повод и длину, нажмите, готово.',
        points: ['Юбилей', 'Свадьба', 'Корпоратив'],
      },
      {
        value: 'script',
        slug: 'scenarij-video',
        label: 'Сценарий короткого видео',
        title: 'Сценарий для Reels, Shorts и TikTok онлайн — Kirka',
        description: 'ИИ без промптов: сценарий для Reels, Shorts, TikTok и VK Клипов с хуком, кадрами и призывом. Бесплатно.',
        points: ['Reels', 'Shorts', 'TikTok'],
      },
      {
        value: 'bio',
        slug: 'opisanie-profilya',
        label: 'Описание профиля (био)',
        title: 'Описание профиля (био) для Instagram, Telegram, VK — Kirka',
        description: 'ИИ без промптов: три варианта описания профиля с учётом лимита символов Instagram, Telegram и VK. Бесплатно.',
        points: ['Instagram', 'Telegram', 'VK'],
      },
      {
        value: 'headline',
        slug: 'zagolovki',
        label: 'Заголовки',
        title: 'Придумать заголовок для статьи, поста и видео — Kirka',
        description: 'ИИ без промптов: заголовки для статьи, поста или видео, несколько вариантов на выбор. Бесплатно.',
        points: ['Для статьи', 'Для поста', 'Для видео'],
      },
      {
        value: 'reply',
        slug: 'otvet-na-soobshchenie',
        label: 'Ответ на письмо / сообщение',
        title: 'Ответ на письмо или сообщение онлайн с ИИ — Kirka',
        description: 'ИИ без промптов: вставьте письмо или сообщение, выберите тон и получите готовый ответ. Бесплатно.',
        points: ['Вежливо', 'Коротко', 'Официально'],
      },
    ],
  },
  {
    label: 'Учёба и редактура',
    options: [
      {
        value: 'improve',
        slug: 'uluchshit-tekst',
        label: 'Улучшить текст',
        title: 'Улучшить, исправить и сократить текст онлайн — Kirka',
        description: 'ИИ без промптов: исправьте ошибки, сократите или сделайте текст понятнее одним нажатием. Бесплатный ИИ-редактор.',
        points: ['Исправить', 'Сократить', 'Переписать'],
      },
      {
        value: 'summary',
        slug: 'kratkij-pereskaz',
        label: 'Краткий пересказ',
        title: 'Краткий пересказ текста онлайн с ИИ — Kirka',
        description: 'ИИ без промптов: краткий пересказ, главное списком или главная мысль текста за секунды. Бесплатно.',
        points: ['Пересказ', 'Списком', 'Главная мысль'],
      },
      {
        value: 'essay',
        slug: 'sochinenie',
        label: 'Сочинение / эссе',
        title: 'Сочинение и эссе на любую тему онлайн — Kirka',
        description: 'ИИ без промптов: образец сочинения или эссе со вступлением, аргументами и выводом. Бесплатный черновик.',
        points: ['Сочинение', 'Эссе', 'Черновик'],
      },
    ],
  },
];

export const modeOptions = modeGroups.flatMap((group) => group.options);

export const modeByValue = Object.fromEntries(modeOptions.map((mode) => [mode.value, mode]));

export const modePath = (value) => {
  const slug = modeByValue[value]?.slug;
  return slug ? `/${slug}` : '/';
};

export const modeByPath = Object.fromEntries(modeOptions.map((mode) => [modePath(mode.value), mode]));

export const normalizePath = (pathname) => pathname.replace(/\/+$/, '') || '/';

export const modeForPath = (pathname) => modeByPath[normalizePath(pathname)];

export const isTextPathname = (pathname) => Object.hasOwn(modeByPath, normalizePath(pathname));
