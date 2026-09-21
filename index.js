import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const {
  CF_ACCOUNT_ID,
  CF_API_TOKEN,
  CF_MODEL = '@cf/meta/llama-3.1-8b-instruct',
  PORT = 3001,
} = process.env;

const DAILY_LIMIT = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const usage = new Map();

function checkLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  let entry = usage.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + DAY_MS };
  }

  if (entry.count >= DAILY_LIMIT) {
    const minutesLeft = Math.ceil((entry.resetAt - now) / 60000);
    return res.status(429).json({
      error: 'limit_reached',
      message: `Лимит бесплатных генераций исчерпан (${DAILY_LIMIT}/день). Попробуй через ${minutesLeft} мин.`,
    });
  }

  entry.count += 1;
  usage.set(ip, entry);
  req.remaining = DAILY_LIMIT - entry.count;
  next();
}

const app = express();
app.set('trust proxy', true);
app.use(cors(), express.json());

async function ask(prompt) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CF_API_TOKEN}`,
    },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  });
  if (!r.ok) throw new Error(await r.text());
  const data = await r.json();
  return data.result.response.trim();
}

const prompts = {
  text: ({
    mode,
    unit,
    prof,
    paragraphs,
    rangeFrom,
    rangeTo,
    keywords,
    keyPhrases,
    experience,
    wishes,
  }) =>
    `Сгенерируй текст в режиме: ${mode}. Сфера деятельности: ${prof || 'не указана'}. Раздели текст на ${paragraphs || 3} абзаца(ев). Объем текста должен быть в ${unit}: от ${rangeFrom} до ${rangeTo}. Обязательно используй ключевые слова: ${keywords || 'нет'}. Обязательно вставь в текст эти точные фразы: ${keyPhrases || 'нет'}. Базовая информация о соискателе: ${experience || 'не указана'}. Дополнительные пожелания: ${wishes || 'нет'}. Выведи ТОЛЬКО готовый текст без приветствий и лишних комментариев.`,
};

for (const [route, build] of Object.entries(prompts)) {
  app.post(
    `/api/${route === 'text' ? 'generate-text' : 'convert-code'}`,
    checkLimit,
    async (req, res) => {
      try {
        const result = await ask(build(req.body));
        res.json({ result, remaining: req.remaining });
      } catch (e) {
        console.error(e.message);
        res.status(500).json({ error: 'AI request failed' });
      }
    },
  );
}

app.listen(PORT, () => console.log(`Server on :${PORT}`));
