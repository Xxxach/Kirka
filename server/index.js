import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

const {
  CF_ACCOUNT_ID,
  CF_API_TOKEN,
  CF_MODEL = '@cf/meta/llama-3.1-8b-instruct',
  DEEPSEEK_BASE_URL,
  DEEPSEEK_API_KEY,
  DEEPSEEK_MODEL = 'deepseek-chat',
  PORT = 3001,
  FRONTEND_ORIGIN = 'http://localhost:5173',
  TRUST_PROXY = 'false',
} = process.env;

// ---------- Проверка обязательных переменных ----------
// Без этого сервер поднимется, но упадёт при первом же запросе,
// и это будет непонятно почему. Лучше сказать сразу и явно.
if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
  console.error(
    '\n[Ошибка запуска] Не заполнены CF_ACCOUNT_ID / CF_API_TOKEN в server/.env\n' +
      'Без них не работает даже "Упрощённая" модель. Заполни server/.env и перезапусти.\n',
  );
  process.exit(1);
}

// ---------- Провайдеры AI ----------

async function askCloudflare(prompt) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CF_API_TOKEN}` },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  });
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  return data.result.response.trim();
}

async function askDeepSeek(prompt) {
  if (!DEEPSEEK_BASE_URL || !DEEPSEEK_API_KEY) {
    const err = new Error('pro_unavailable');
    err.userMessage = 'Улучшенная модель временно недоступна. Попробуй обычную.';
    throw err;
  }
  const r = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
    }),
  });
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  return data.choices[0].message.content.trim();
}

// ---------- Тарифы: свой дневной лимит и своя очередь на каждый ----------

const TIERS = {
  basic: { call: askCloudflare, limit: 300 },
  pro: { call: askDeepSeek, limit: 30 },
};

const DAY_MS = 24 * 60 * 60 * 1000;
const usage = new Map(); // ключ: `${ip}:${tier}`

function checkLimit(req, res, next) {
  const tier = TIERS[req.body.tier] ? req.body.tier : 'basic';
  const key = `${req.ip}:${tier}`;
  const now = Date.now();
  let entry = usage.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + DAY_MS };
  }

  const limit = TIERS[tier].limit;
  if (entry.count >= limit) {
    const minutesLeft = Math.ceil((entry.resetAt - now) / 60000);
    return res.status(429).json({
      error: 'limit_reached',
      message: `Лимит для этой модели исчерпан (${limit}/день). Попробуй через ${minutesLeft} мин.`,
    });
  }

  entry.count += 1;
  usage.set(key, entry);
  req.tier = tier;
  req.remaining = limit - entry.count;
  next();
}

const app = express();
// true только если сервер реально стоит за прокси (Nginx/Cloudflare) —
// иначе клиент может подделать IP через заголовок и обойти лимиты.
app.set('trust proxy', TRUST_PROXY === 'true');
app.use(helmet());
app.use(compression());
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json({ limit: '20kb' }));

// Лёгкая точка для "будильника" (UptimeRobot / cron-job.org),
// чтобы бесплатный Render не засыпал через 15 минут простоя.
app.get('/health', (req, res) => res.status(200).send('ok'));

// ---------- Обратная связь ----------

const feedbackUsage = new Map(); // ip -> { count, resetAt }
const FEEDBACK_DAILY_LIMIT = 10;

app.post('/api/feedback', async (req, res) => {
  const message = (req.body?.message || '').trim();
  if (!message) {
    return res.status(400).json({ message: 'Сообщение не может быть пустым' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ message: 'Слишком длинное сообщение' });
  }

  const now = Date.now();
  let entry = feedbackUsage.get(req.ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + DAY_MS };
  }
  if (entry.count >= FEEDBACK_DAILY_LIMIT) {
    return res.status(429).json({ message: 'Слишком много сообщений, попробуй завтра' });
  }
  entry.count += 1;
  feedbackUsage.set(req.ip, entry);

  const page = (req.body?.page || '').slice(0, 100);
  const line = `[${new Date().toISOString()}] (${page}) ${message.replace(/\s+/g, ' ')}\n`;

  console.log('--- Обратная связь ---\n' + line);
  try {
    const fs = await import('node:fs/promises');
    await fs.appendFile('feedback.log', line, 'utf8');
  } catch {
    // Диск на бесплатном хостинге может быть недоступен/временным —
    // это не критично, в логах консоли сообщение уже есть.
  }

  res.json({ ok: true });
});

// ---------- Промпты ----------

function buildResumeOrLetterPrompt(body) {
  const { mode, prof, experience, unit, rangeFrom, rangeTo, paragraphs, keywords, keyPhrases, wishes } = body;
  const docType = mode === 'letter' ? 'сопроводительное письмо' : 'резюме (текст о себе)';

  return `
Ты — профессиональный HR-копирайтер. Напиши ${docType} на русском языке.

ПАРАМЕТРЫ:
- Сфера деятельности: ${prof || 'не указана'}
- Опыт работы: ${experience || 'не указан'} лет
- Объём текста: от ${rangeFrom || 'любого'} до ${rangeTo || 'любого'} ${unit || 'символов'}
- Количество абзацев: строго ${paragraphs || 3}
- Обязательно использовать эти ключевые слова (в любой форме): ${keywords || 'нет обязательных слов'}
- Обязательно включить дословно эти фразы: ${keyPhrases || 'нет обязательных фраз'}
- Дополнительные пожелания: ${wishes || 'нет'}

ЗАПРЕЩЕНО:
- Не пиши приветствие ("Здравствуйте", "Добрый день" и т.п.)
- Не добавляй комментарии о том, что ты сгенерировал текст
- Не выходи за пределы указанного диапазона объёма
- Не игнорируй количество абзацев

ФОРМАТ ОТВЕТА: только готовый текст документа, разбитый на абзацы пустой строкой между ними. Ничего больше.
`.trim();
}

function buildGreetingPrompt(body) {
  const { occasion, recipientName, tone, length, wishes } = body;
  return `
Ты — автор тёплых и живых поздравлений на русском языке.

ПАРАМЕТРЫ:
- Повод: ${occasion || 'общий праздник'}
- Кому адресовано: ${recipientName || 'без имени'}
- Тон: ${tone || 'тёплый'}
- Длина: ${length || 'среднее'} (короткое = 2-3 предложения, среднее = абзац, длинное = 2-3 абзаца)
- Что упомянуть: ${wishes || 'ничего конкретного, просто хорошее поздравление'}

ЗАПРЕЩЕНО:
- Не используй шаблонные клише без конкретики
- Не подписывай поздравление именем отправителя
- Не добавляй пояснений от себя

ФОРМАТ ОТВЕТА: только текст поздравления. Ничего больше.
`.trim();
}

function buildAdPrompt(body) {
  const { itemName, price, condition, length, keywords } = body;
  return `
Ты — копирайтер объявлений для маркетплейсов (Avito и подобных).

ПАРАМЕТРЫ:
- Товар: ${itemName || 'не указан'}
- Цена: ${price || 'не указана'}
- Состояние: ${condition || 'не указано'}
- Длина текста: ${length || 'среднее'}
- Ключевые особенности: ${keywords || 'нет особых'}

ЗАПРЕЩЕНО:
- Не придумывай факты о товаре, которых нет в параметрах
- Не пиши "звоните", "пишите" и контактные призывы
- Не используй emoji

ФОРМАТ ОТВЕТА: только текст объявления, готовый к публикации. Ничего больше.
`.trim();
}

function buildPostPrompt(body) {
  const { platform, postTone, length, cta, keywords } = body;
  return `
Ты — SMM-копирайтер, пишешь пост для социальной сети ${platform || 'VK'}.

ПАРАМЕТРЫ:
- Тема поста: ${keywords || 'свободная тема'}
- Тон: ${postTone || 'дружелюбный'}
- Длина: ${length || 'среднее'}
- Призыв к действию в конце: ${cta || 'не добавлять'}

ЗАПРЕЩЕНО:
- Не используй более 3 emoji за весь пост
- Не добавляй хэштеги, если явно не попросили
- Не пиши "вот пост для вас" или подобные вводные фразы

ФОРМАТ ОТВЕТА: только текст поста, готовый к публикации. Ничего больше.
`.trim();
}

function buildSloganPrompt(body) {
  const { businessName, businessType, sloganStyle, variantsCount, keywords } = body;
  return `
Ты — нейминг-копирайтер, придумываешь слоганы для бизнеса.

ПАРАМЕТРЫ:
- Название бизнеса: ${businessName || 'без названия'}
- Сфера: ${businessType || 'не указана'}
- Стиль: ${sloganStyle || 'креативный'}
- Ценности/ключевые слова: ${keywords || 'нет конкретных'}
- Количество вариантов: строго ${variantsCount || 5}

ЗАПРЕЩЕНО:
- Не повторяй один и тот же смысл в разных вариантах
- Не делай слоганы длиннее 8 слов
- Не добавляй пояснений к вариантам

ФОРМАТ ОТВЕТА: пронумерованный список из ${variantsCount || 5} слоганов, каждый с новой строки. Ничего больше.
`.trim();
}

const promptBuilders = {
  resume: buildResumeOrLetterPrompt,
  letter: buildResumeOrLetterPrompt,
  greeting: buildGreetingPrompt,
  ad: buildAdPrompt,
  post: buildPostPrompt,
  slogan: buildSloganPrompt,
};

const routeHandlers = {
  text: (body) => (promptBuilders[body.mode] || buildResumeOrLetterPrompt)(body),
  code: ({ code, targetLang }) =>
    `Переведи код на ${targetLang}, сохрани логику без изменений. Выведи ТОЛЬКО код, без \`\`\` и пояснений.\n\n${code}`,
};

for (const [route, build] of Object.entries(routeHandlers)) {
  app.post(`/api/${route === 'text' ? 'generate-text' : 'convert-code'}`, checkLimit, async (req, res) => {
    try {
      const call = TIERS[req.tier].call;
      const result = await call(build(req.body));
      res.json({ result, remaining: req.remaining, tier: req.tier });
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ error: 'AI request failed', message: e.userMessage || 'Не удалось выполнить запрос' });
    }
  });
}

app.listen(PORT, () => console.log(`Server on :${PORT}`));
