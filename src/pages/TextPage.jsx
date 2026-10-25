import { AdSlot } from '../components/AdSlot';
import { getApiBase, friendlyError } from '../api';
import { trackGoal } from '../analytics';
import { ThemedSelect as Select } from '../components/ThemedSelect';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ModePicker } from '../components/ModePicker';
import { AboutBlock } from '../components/AboutBlock';
import { RefineBar } from '../components/RefineBar';
import { modeForPath, modePath } from '../data/textModes';

// Значение этих полей уходит на сервер как value (там по нему подбирается инструкция).
const marketplaceOptions = [
  { value: 'wb', label: 'Wildberries' },
  { value: 'ozon', label: 'Ozon' },
  { value: 'ymarket', label: 'Яндекс Маркет' },
  { value: 'avito', label: 'Авито' },
];

const ratingOptions = [
  { value: '5', label: '5 — отлично' },
  { value: '4', label: '4 — хорошо' },
  { value: '3', label: '3 — средне' },
  { value: '2', label: '2 — плохо' },
  { value: '1', label: '1 — ужасно' },
];

const replyToneOptions = [
  { value: 'polite', label: 'Вежливый' },
  { value: 'friendly', label: 'Дружелюбный' },
  { value: 'empathic', label: 'Сочувствующий' },
  { value: 'official', label: 'Официальный' },
];

const docKindOptions = [
  { value: 'shop_claim', label: 'Претензия в магазин' },
  { value: 'utility_claim', label: 'Претензия в управляющую компанию' },
  { value: 'resignation', label: 'Заявление об увольнении' },
  { value: 'vacation', label: 'Заявление на отпуск' },
  { value: 'explanation', label: 'Объяснительная записка' },
  { value: 'free', label: 'Заявление в свободной форме' },
];

const improveGoalOptions = [
  { value: 'fix', label: 'Исправить ошибки' },
  { value: 'short', label: 'Сделать короче' },
  { value: 'polite', label: 'Сделать вежливее' },
  { value: 'official', label: 'Сделать официальнее' },
  { value: 'simple', label: 'Сделать проще и понятнее' },
  { value: 'persuasive', label: 'Сделать убедительнее' },
];

const letterKindOptions = [
  { value: 'offer', label: 'Коммерческое предложение' },
  { value: 'payment', label: 'Напоминание об оплате' },
  { value: 'request', label: 'Запрос информации или цен' },
  { value: 'thanks', label: 'Благодарность партнёру' },
  { value: 'decline', label: 'Вежливый отказ' },
  { value: 'invite', label: 'Приглашение на встречу' },
];

const summaryKindOptions = [
  { value: 'retell', label: 'Краткий пересказ' },
  { value: 'bullets', label: 'Главное списком' },
  { value: 'thesis', label: 'Главная мысль в 1-2 предложениях' },
];

const businessToneOptions = [
  { value: 'strict', label: 'Строго официальный' },
  { value: 'friendly', label: 'Деловой, дружелюбный' },
];

// Обязательные поля новых видов: [поле, сообщение]. Те же проверки есть на сервере.
const REQUIRED = {
  marketplace: ['itemName', 'Укажи название товара'],
  review: ['reviewText', 'Вставь текст отзыва'],
  claim: ['situation', 'Опиши, что произошло'],
  improve: ['sourceText', 'Вставь текст, который нужно улучшить'],
  business: ['details', 'Опиши, о чём письмо'],
  vacancy: ['itemName', 'Укажи должность'],
  reference: ['details', 'Опиши качества и достижения'],
  motivation: ['details', 'Расскажи о себе'],
  summary: ['sourceText', 'Вставь текст для пересказа'],
  reply: ['sourceText', 'Вставь сообщение, на которое нужно ответить'],
  script: ['keywords', 'Укажи тему видео'],
  bio: ['keywords', 'Напиши, чем ты занимаешься'],
  headline: ['keywords', 'Укажи тему'],
  essay: ['itemName', 'Укажи тему сочинения'],
  service: ['itemName', 'Укажи услугу'],
};

const REFINE_MAX = 7000;

const FIELD_LABEL = 'text-xs text-slate-500 font-semibold';

function Field({ label, wide = false, children }) {
  return (
    <div
      className={`flex flex-col gap-1 p-3 ${wide ? 'col-span-1 sm:col-span-2' : ''}`}
    >
      <p className={FIELD_LABEL}>{label}</p>
      {children}
    </div>
  );
}


const unitOptions = [
  { value: 'symbols', label: 'Символы' },
  { value: 'words', label: 'Слова' },
];

const profOptions = [
  { value: 'analit', label: 'Аналитика' },
  { value: 'bugal', label: 'Бухгалтерия' },
  { value: 'dostav', label: 'Доставки' },
  { value: 'it', label: 'IT' },
  { value: 'logist', label: 'Логистика' },
  { value: 'seo', label: 'SEO-специалист' },
  { value: 'stroika', label: 'Строительство' },
  { value: 'finans', label: 'Финансы' },
];

const occasionOptions = [
  { value: 'birthday', label: 'День рождения' },
  { value: 'anniversary', label: 'Юбилей' },
  { value: 'newyear', label: 'Новый год' },
  { value: 'march8', label: '8 марта' },
  { value: 'wedding', label: 'Свадьба' },
  { value: 'other', label: 'Другой повод' },
];

const toneOptions = [
  { value: 'warm', label: 'Тёплый' },
  { value: 'funny', label: 'Шуточный' },
  { value: 'official', label: 'Официальный' },
  { value: 'poetic', label: 'Поэтичный' },
];

const conditionOptions = [
  { value: 'new', label: 'Новое' },
  { value: 'used_good', label: 'Б/у, отличное состояние' },
  { value: 'used_avg', label: 'Б/у, среднее состояние' },
];

const platformOptions = [
  { value: 'vk', label: 'VK' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'instagram', label: 'Instagram' },
];

const postToneOptions = [
  { value: 'friendly', label: 'Дружелюбный' },
  { value: 'expert', label: 'Экспертный' },
  { value: 'sales', label: 'Продающий' },
  { value: 'funny', label: 'Юмористический' },
];

const sloganStyleOptions = [
  { value: 'creative', label: 'Креативный' },
  { value: 'strict', label: 'Строгий' },
  { value: 'funny', label: 'Юмористический' },
  { value: 'inspiring', label: 'Вдохновляющий' },
];

const lengthOptions = [
  { value: 'short', label: 'Короткое' },
  { value: 'medium', label: 'Среднее' },
  { value: 'long', label: 'Длинное' },
];

const tierOptions = [
  { value: 'basic', label: 'Упрощённая (быстро, бесплатно)' },
  { value: 'pro', label: 'Улучшенная (точнее, лимит меньше)' },
];

const barStyles = {
  idle: { width: '0%', transition: 'none' },
  loading: { width: '85%', transition: 'width 2.5s ease-out' },
  done: { width: '100%', transition: 'width 0.3s ease-out' },
};

const initialForm = {
  tier: tierOptions[0],
  unit: unitOptions[0],
  prof: profOptions[0],
  rangeFrom: '',
  rangeTo: '',
  paragraphs: '3',
  keywords: '',
  keyPhrases: '',
  experience: '',
  wishes: '',
  occasion: occasionOptions[0],
  recipientName: '',
  tone: toneOptions[0],
  length: lengthOptions[1],
  itemName: '',
  price: '',
  condition: conditionOptions[0],
  platform: platformOptions[0],
  postTone: postToneOptions[0],
  cta: '',
  businessName: '',
  businessType: '',
  sloganStyle: sloganStyleOptions[0],
  variantsCount: '5',
  marketplace: marketplaceOptions[0],
  audience: '',
  reviewText: '',
  rating: ratingOptions[0],
  replyTone: replyToneOptions[0],
  docKind: docKindOptions[0],
  recipient: '',
  author: '',
  situation: '',
  demand: '',
  sourceText: '',
  improveGoal: improveGoalOptions[0],
  summaryKind: summaryKindOptions[0],
  letterKind: letterKindOptions[0],
  addressee: '',
  details: '',
  businessTone: businessToneOptions[0],
  result: '',
};

export function TextPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fillState, setFillState] = useState('idle');
  const [refining, setRefining] = useState('');
  const [quota, setQuota] = useState(null);
  const [undoStack, setUndoStack] = useState([]);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const mode = modeForPath(pathname)?.value ?? 'resume';

  const handSelectChange = (field) => (option) => {
    setForm((prev) => ({ ...prev, [field]: option }));
  };

  const handInputChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handRangeChange = (field) => (e) => {
    const raw = e.target.value;
    if (raw === '') return setForm((prev) => ({ ...prev, [field]: '' }));

    const value = Math.max(0, Number(raw));
    const other = field === 'rangeFrom' ? 'rangeTo' : 'rangeFrom';

    setForm((prev) => ({
      ...prev,
      [field]: value,
      [other]:
        prev[other] === ''
          ? prev[other]
          : field === 'rangeFrom'
            ? Math.max(value, prev[other])
            : Math.min(value, prev[other]),
    }));
  };

  const handNumberChange = (field) => (e) => {
    const raw = e.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: raw === '' ? '' : Math.max(0, Number(raw)),
    }));
  };

  const handleGenerate = async () => {
    const need = REQUIRED[mode];
    if (need && !String(form[need[0]]).trim()) {
      setError(need[1]);
      return;
    }
    setLoading(true);
    setError('');
    setFillState('loading');
    try {
      const apiUrl = await getApiBase('text');
      const res = await fetch(`${apiUrl}/api/generate-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          tier: form.tier?.value,
          unit: form.unit?.label,
          prof: form.prof?.label,
          paragraphs: form.paragraphs,
          rangeFrom: form.rangeFrom,
          rangeTo: form.rangeTo,
          keywords: form.keywords,
          keyPhrases: form.keyPhrases,
          experience: form.experience,
          wishes: form.wishes,
          occasion: form.occasion?.label,
          recipientName: form.recipientName,
          tone: form.tone?.label,
          length: form.length?.label,
          itemName: form.itemName,
          price: form.price,
          condition: form.condition?.label,
          platform: form.platform?.label,
          postTone: form.postTone?.label,
          cta: form.cta,
          businessName: form.businessName,
          businessType: form.businessType,
          sloganStyle: form.sloganStyle?.label,
          variantsCount: form.variantsCount,
          marketplace: form.marketplace?.label,
          audience: form.audience,
          reviewText: form.reviewText,
          rating: form.rating?.label,
          replyTone: form.replyTone?.label,
          docKind: form.docKind?.value,
          recipient: form.recipient,
          author: form.author,
          situation: form.situation,
          demand: form.demand,
          sourceText: form.sourceText,
          improveGoal: form.improveGoal?.value,
          summaryKind: form.summaryKind?.value,
          letterKind: form.letterKind?.value,
          addressee: form.addressee,
          details: form.details,
          businessTone: form.businessTone?.value,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || 'Не удалось выполнить запрос');

      // Старый сервер не знает новых видов текста и молча отдаёт резюме: он не вернёт mode.
      if (data.mode !== mode)
        throw new Error('Сервер обновляется и пока не поддерживает этот вид текста. Попробуй чуть позже.');

      trackGoal('text_generated', { mode });
      setFillState('done');
      await new Promise((r) => setTimeout(r, 300));
      if (form.result.trim()) setUndoStack((prev) => [...prev.slice(-4), form.result]);
      setForm((prev) => ({ ...prev, result: data.result }));
      rememberQuota(data);
    } catch (err) {
      setError(friendlyError(err));
      console.error(err);
    } finally {
      setLoading(false);
      setFillState('idle');
    }
  };

  const rememberQuota = (data) => {
    if (typeof data.remaining === 'number' && typeof data.limit === 'number') {
      setQuota({ tier: data.tier, remaining: data.remaining, limit: data.limit });
    }
  };

  const handleRefine = async (action) => {
    const text = form.result.trim();
    if (!text || refining) return;
    if (text.length > REFINE_MAX) {
      setError(`Текст слишком длинный для доработки (до ${REFINE_MAX} символов).`);
      return;
    }
    setRefining(action);
    setError('');
    try {
      const apiUrl = await getApiBase('text');
      const res = await fetch(`${apiUrl}/api/refine-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text, tier: form.tier?.value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          data.message ||
            (res.status === 404
              ? 'Сервер обновляется и пока не умеет дорабатывать текст. Попробуй чуть позже.'
              : 'Не удалось выполнить запрос'),
        );
      if (data.action !== action)
        throw new Error('Сервер обновляется и пока не умеет дорабатывать текст. Попробуй чуть позже.');
      trackGoal('text_refined', { action });
      setUndoStack((prev) => [...prev.slice(-4), form.result]);
      setForm((prev) => ({ ...prev, result: data.result }));
      rememberQuota(data);
    } catch (err) {
      setError(friendlyError(err));
      console.error(err);
    } finally {
      setRefining('');
    }
  };

  const handleUndo = () => {
    const last = undoStack[undoStack.length - 1];
    if (last === undefined) return;
    setUndoStack((prev) => prev.slice(0, -1));
    setForm((prev) => ({ ...prev, result: last }));
  };

  const labelClass = 'text-xs text-slate-500 font-semibold';
  const inputClass =
    'w-full min-w-0 px-3 h-9 border border-slate-300 rounded-lg shadow-sm bg-white';
  const textareaClass =
    'w-full min-w-0 p-3 h-28 border border-slate-300 rounded-lg shadow-sm bg-white resize-none';

  return (
    <div className="flex flex-col px-5 py-1 gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1 p-3">
          <p className={labelClass}>Что генерируем</p>
          <ModePicker value={mode} onChange={(next) => navigate(modePath(next))} />
        </div>
        <div className="flex flex-col gap-1 p-3">
          <p className={labelClass}>Модель</p>
          <Select
            options={tierOptions}
            value={form.tier}
            onChange={handSelectChange('tier')}
          />
          {form.tier.value === 'basic' && (
            <p className="text-xs text-amber-600 mt-1">
              Бесплатная модель попроще — иногда путает детали. Для точного
              результата выбери «Улучшенную».
            </p>
          )}
        </div>
        <div className="col-span-1 sm:col-span-2 m-3 p-3 min-h-24">
          <AdSlot />
        </div>

        {(mode === 'resume' || mode === 'letter') && (
          <>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Сфера / Профессия</p>
              <Select
                options={profOptions}
                value={form.prof}
                onChange={handSelectChange('prof')}
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Опыт (в годах)</p>
              <input
                className={inputClass}
                type="number"
                value={form.experience}
                onChange={handNumberChange('experience')}
                placeholder="Например, 3"
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>В чём измерять объём</p>
              <Select
                options={unitOptions}
                value={form.unit}
                onChange={handSelectChange('unit')}
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Диапазон объёма</p>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  type="number"
                  value={form.rangeFrom}
                  onChange={handRangeChange('rangeFrom')}
                  placeholder="От"
                />
                <input
                  className={inputClass}
                  type="number"
                  value={form.rangeTo}
                  onChange={handRangeChange('rangeTo')}
                  placeholder="До"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Кол-во абзацев</p>
              <input
                className={inputClass}
                type="number"
                value={form.paragraphs}
                onChange={handNumberChange('paragraphs')}
                placeholder="Обычно 3"
              />
            </div>
            <div className="flex flex-col gap-1 p-3 col-span-1 sm:col-span-2">
              <p className={labelClass}>Ключевые слова, через запятую</p>
              <input
                className={inputClass}
                type="text"
                value={form.keywords}
                onChange={handInputChange('keywords')}
                placeholder="Например: коммуникабельность, ответственность"
              />
            </div>
            <div className="flex flex-col gap-1 p-3 col-span-1 sm:col-span-2">
              <p className={labelClass}>Точные фразы, через запятую</p>
              <input
                className={inputClass}
                type="text"
                value={form.keyPhrases}
                onChange={handInputChange('keyPhrases')}
                placeholder="Фразы, которые должны попасть в текст дословно"
              />
            </div>
            <div className="flex flex-col gap-1 p-3 col-span-1 sm:col-span-2">
              <p className={labelClass}>Подробности / пожелания</p>
              <input
                className={inputClass}
                type="text"
                value={form.wishes}
                onChange={handInputChange('wishes')}
                placeholder="Любые нюансы"
              />
            </div>
          </>
        )}

        {(mode === 'greeting' || mode === 'toast') && (
          <>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Повод</p>
              <Select
                options={occasionOptions}
                value={form.occasion}
                onChange={handSelectChange('occasion')}
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Кому (имя)</p>
              <input
                className={inputClass}
                type="text"
                value={form.recipientName}
                onChange={handInputChange('recipientName')}
                placeholder="Например: Анна"
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Тон</p>
              <Select
                options={toneOptions}
                value={form.tone}
                onChange={handSelectChange('tone')}
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Длина</p>
              <Select
                options={lengthOptions}
                value={form.length}
                onChange={handSelectChange('length')}
              />
            </div>
            <div className="flex flex-col gap-1 p-3 col-span-1 sm:col-span-2">
              <p className={labelClass}>Что упомянуть (необязательно)</p>
              <input
                className={inputClass}
                type="text"
                value={form.wishes}
                onChange={handInputChange('wishes')}
                placeholder="Общие воспоминания, качества человека, пожелания"
              />
            </div>
          </>
        )}

        {mode === 'ad' && (
          <>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Что продаём</p>
              <input
                className={inputClass}
                type="text"
                value={form.itemName}
                onChange={handInputChange('itemName')}
                placeholder="Например: iPhone 13"
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Цена</p>
              <input
                className={inputClass}
                type="text"
                value={form.price}
                onChange={handInputChange('price')}
                placeholder="Например: 35000"
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Состояние</p>
              <Select
                options={conditionOptions}
                value={form.condition}
                onChange={handSelectChange('condition')}
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Длина</p>
              <Select
                options={lengthOptions}
                value={form.length}
                onChange={handSelectChange('length')}
              />
            </div>
            <div className="flex flex-col gap-1 p-3 col-span-1 sm:col-span-2">
              <p className={labelClass}>Ключевые особенности, через запятую</p>
              <input
                className={inputClass}
                type="text"
                value={form.keywords}
                onChange={handInputChange('keywords')}
                placeholder="Например: без царапин, коробка, чеки"
              />
            </div>
          </>
        )}

        {mode === 'post' && (
          <>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Платформа</p>
              <Select
                options={platformOptions}
                value={form.platform}
                onChange={handSelectChange('platform')}
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Тон</p>
              <Select
                options={postToneOptions}
                value={form.postTone}
                onChange={handSelectChange('postTone')}
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Длина</p>
              <Select
                options={lengthOptions}
                value={form.length}
                onChange={handSelectChange('length')}
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Призыв к действию (необязательно)</p>
              <input
                className={inputClass}
                type="text"
                value={form.cta}
                onChange={handInputChange('cta')}
                placeholder="Например: подписаться, перейти по ссылке"
              />
            </div>
            <div className="flex flex-col gap-1 p-3 col-span-1 sm:col-span-2">
              <p className={labelClass}>Тема поста</p>
              <input
                className={inputClass}
                type="text"
                value={form.keywords}
                onChange={handInputChange('keywords')}
                placeholder="О чём пост"
              />
            </div>
          </>
        )}

        {mode === 'slogan' && (
          <>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Название бизнеса (если есть)</p>
              <input
                className={inputClass}
                type="text"
                value={form.businessName}
                onChange={handInputChange('businessName')}
                placeholder="Необязательно"
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Сфера бизнеса</p>
              <input
                className={inputClass}
                type="text"
                value={form.businessType}
                onChange={handInputChange('businessType')}
                placeholder="Например: кофейня, IT-стартап"
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Стиль</p>
              <Select
                options={sloganStyleOptions}
                value={form.sloganStyle}
                onChange={handSelectChange('sloganStyle')}
              />
            </div>
            <div className="flex flex-col gap-1 p-3">
              <p className={labelClass}>Сколько вариантов</p>
              <input
                className={inputClass}
                type="number"
                value={form.variantsCount}
                onChange={handNumberChange('variantsCount')}
                placeholder="5"
              />
            </div>
            <div className="flex flex-col gap-1 p-3 col-span-1 sm:col-span-2">
              <p className={labelClass}>
                Ценности / ключевые слова, через запятую
              </p>
              <input
                className={inputClass}
                type="text"
                value={form.keywords}
                onChange={handInputChange('keywords')}
                placeholder="Например: скорость, надёжность, забота"
              />
            </div>
          </>
        )}

        {mode === 'marketplace' && (
          <>
            <Field label="Площадка">
              <Select
                options={marketplaceOptions}
                value={form.marketplace}
                onChange={handSelectChange('marketplace')}
              />
            </Field>
            <Field label="Название товара">
              <input
                className={inputClass}
                type="text"
                maxLength={150}
                value={form.itemName}
                onChange={handInputChange('itemName')}
                placeholder="Например: термокружка 450 мл"
              />
            </Field>
            <Field label="Длина описания">
              <Select
                options={lengthOptions}
                value={form.length}
                onChange={handSelectChange('length')}
              />
            </Field>
            <Field label="Для кого (необязательно)">
              <input
                className={inputClass}
                type="text"
                maxLength={150}
                value={form.audience}
                onChange={handInputChange('audience')}
                placeholder="Например: студенты, офисные работники"
              />
            </Field>
            <Field label="Характеристики и преимущества, через запятую" wide>
              <input
                className={inputClass}
                type="text"
                maxLength={500}
                value={form.keywords}
                onChange={handInputChange('keywords')}
                placeholder="Например: нержавеющая сталь, держит тепло 12 часов, не протекает"
              />
            </Field>
          </>
        )}

        {mode === 'review' && (
          <>
            <Field label="Оценка клиента">
              <Select
                options={ratingOptions}
                value={form.rating}
                onChange={handSelectChange('rating')}
              />
            </Field>
            <Field label="Тон ответа">
              <Select
                options={replyToneOptions}
                value={form.replyTone}
                onChange={handSelectChange('replyTone')}
              />
            </Field>
            <Field label="Длина">
              <Select
                options={lengthOptions}
                value={form.length}
                onChange={handSelectChange('length')}
              />
            </Field>
            <Field label="Название компании (необязательно)">
              <input
                className={inputClass}
                type="text"
                maxLength={100}
                value={form.businessName}
                onChange={handInputChange('businessName')}
                placeholder="Например: кофейня «Зерно»"
              />
            </Field>
            <Field label="Текст отзыва" wide>
              <textarea
                className={textareaClass}
                maxLength={2000}
                value={form.reviewText}
                onChange={handInputChange('reviewText')}
                placeholder="Вставь отзыв клиента"
              />
            </Field>
            <Field label="Что предложить клиенту (необязательно)" wide>
              <input
                className={inputClass}
                type="text"
                maxLength={300}
                value={form.wishes}
                onChange={handInputChange('wishes')}
                placeholder="Например: скидка 10% на следующий заказ"
              />
            </Field>
          </>
        )}

        {mode === 'claim' && (
          <>
            <Field label="Вид документа">
              <Select
                options={docKindOptions}
                value={form.docKind}
                onChange={handSelectChange('docKind')}
              />
            </Field>
            <Field label="От кого (ФИО)">
              <input
                className={inputClass}
                type="text"
                maxLength={150}
                value={form.author}
                onChange={handInputChange('author')}
                placeholder="Можно оставить пустым"
              />
            </Field>
            <Field label="Кому (организация, должность)" wide>
              <input
                className={inputClass}
                type="text"
                maxLength={200}
                value={form.recipient}
                onChange={handInputChange('recipient')}
                placeholder="Например: директору ООО «Ромашка»"
              />
            </Field>
            <Field label="Что произошло" wide>
              <textarea
                className={textareaClass}
                maxLength={2000}
                value={form.situation}
                onChange={handInputChange('situation')}
                placeholder="Опиши ситуацию своими словами: даты, суммы, что именно случилось"
              />
            </Field>
            <Field label="Что требуется (необязательно)" wide>
              <input
                className={inputClass}
                type="text"
                maxLength={300}
                value={form.demand}
                onChange={handInputChange('demand')}
                placeholder="Например: вернуть деньги в течение 10 дней"
              />
            </Field>
            <p className="col-span-1 sm:col-span-2 md:col-span-4 px-3 text-xs text-amber-600">
              Это шаблон документа, а не юридическая консультация: проверь текст
              перед отправкой. Паспортные данные и адрес лучше вписать в готовый
              текст самому, здесь их вводить не нужно.
            </p>
          </>
        )}

        {mode === 'improve' && (
          <>
            <Field label="Что сделать с текстом">
              <Select
                options={improveGoalOptions}
                value={form.improveGoal}
                onChange={handSelectChange('improveGoal')}
              />
            </Field>
            <Field label="Текст (до 3000 символов)" wide>
              <textarea
                className={textareaClass}
                maxLength={3000}
                value={form.sourceText}
                onChange={handInputChange('sourceText')}
                placeholder="Вставь текст, который нужно улучшить"
              />
            </Field>
          </>
        )}

        {mode === 'business' && (
          <>
            <Field label="Тип письма">
              <Select
                options={letterKindOptions}
                value={form.letterKind}
                onChange={handSelectChange('letterKind')}
              />
            </Field>
            <Field label="Тон">
              <Select
                options={businessToneOptions}
                value={form.businessTone}
                onChange={handSelectChange('businessTone')}
              />
            </Field>
            <Field label="Длина">
              <Select
                options={lengthOptions}
                value={form.length}
                onChange={handSelectChange('length')}
              />
            </Field>
            <Field label="От компании (необязательно)">
              <input
                className={inputClass}
                type="text"
                maxLength={100}
                value={form.businessName}
                onChange={handInputChange('businessName')}
                placeholder="Например: ИП Иванов"
              />
            </Field>
            <Field label="Кому (компания или имя, необязательно)" wide>
              <input
                className={inputClass}
                type="text"
                maxLength={150}
                value={form.addressee}
                onChange={handInputChange('addressee')}
                placeholder="Например: ООО «Альфа», Петрова А. С."
              />
            </Field>
            <Field label="О чём письмо" wide>
              <textarea
                className={textareaClass}
                maxLength={1500}
                value={form.details}
                onChange={handInputChange('details')}
                placeholder="Что нужно сообщить: условия, суммы, сроки, номера счетов"
              />
            </Field>
          </>
        )}

        {mode === 'vacancy' && (
          <>
            <Field label="Должность">
              <input
                className={inputClass}
                type="text"
                maxLength={100}
                value={form.itemName}
                onChange={handInputChange('itemName')}
                placeholder="Например: менеджер по продажам"
              />
            </Field>
            <Field label="Компания (необязательно)">
              <input
                className={inputClass}
                type="text"
                maxLength={100}
                value={form.businessName}
                onChange={handInputChange('businessName')}
                placeholder="Например: ООО «Ромашка»"
              />
            </Field>
            <Field label="Длина">
              <Select
                options={lengthOptions}
                value={form.length}
                onChange={handSelectChange('length')}
              />
            </Field>
            <Field label="Условия (необязательно)">
              <input
                className={inputClass}
                type="text"
                maxLength={400}
                value={form.wishes}
                onChange={handInputChange('wishes')}
                placeholder="Зарплата, график, формат работы"
              />
            </Field>
            <Field label="Обязанности и требования" wide>
              <textarea
                className={textareaClass}
                maxLength={1500}
                value={form.details}
                onChange={handInputChange('details')}
                placeholder="Что предстоит делать и кого вы ищете. Можно оставить пустым"
              />
            </Field>
          </>
        )}

        {mode === 'reference' && (
          <>
            <Field label="ФИО (на кого характеристика)">
              <input
                className={inputClass}
                type="text"
                maxLength={100}
                value={form.recipientName}
                onChange={handInputChange('recipientName')}
                placeholder="Можно оставить пустым"
              />
            </Field>
            <Field label="Должность или класс">
              <input
                className={inputClass}
                type="text"
                maxLength={100}
                value={form.itemName}
                onChange={handInputChange('itemName')}
                placeholder="Например: старший бухгалтер"
              />
            </Field>
            <Field label="Организация" wide>
              <input
                className={inputClass}
                type="text"
                maxLength={150}
                value={form.businessName}
                onChange={handInputChange('businessName')}
                placeholder="Например: ООО «Ромашка» или школа №5"
              />
            </Field>
            <Field label="Качества и достижения" wide>
              <textarea
                className={textareaClass}
                maxLength={1500}
                value={form.details}
                onChange={handInputChange('details')}
                placeholder="Чем отличился, какие навыки, как работает в коллективе"
              />
            </Field>
            <p className="col-span-1 sm:col-span-2 md:col-span-4 px-3 text-xs text-amber-600">
              Это шаблон: проверь текст и впиши даты и подпись сам.
            </p>
          </>
        )}

        {mode === 'motivation' && (
          <>
            <Field label="Куда пишем">
              <input
                className={inputClass}
                type="text"
                maxLength={150}
                value={form.itemName}
                onChange={handInputChange('itemName')}
                placeholder="Программа, вуз, стажировка или компания"
              />
            </Field>
            <Field label="Длина">
              <Select
                options={lengthOptions}
                value={form.length}
                onChange={handSelectChange('length')}
              />
            </Field>
            <Field label="О себе" wide>
              <textarea
                className={textareaClass}
                maxLength={1500}
                value={form.details}
                onChange={handInputChange('details')}
                placeholder="Образование, опыт, интересы, чего хочешь достичь"
              />
            </Field>
          </>
        )}

        {mode === 'service' && (
          <>
            <Field label="Услуга">
              <input
                className={inputClass}
                type="text"
                maxLength={150}
                value={form.itemName}
                onChange={handInputChange('itemName')}
                placeholder="Например: репетитор по математике"
              />
            </Field>
            <Field label="Для кого (необязательно)">
              <input
                className={inputClass}
                type="text"
                maxLength={150}
                value={form.audience}
                onChange={handInputChange('audience')}
                placeholder="Например: школьники 9-11 классов"
              />
            </Field>
            <Field label="Цена (необязательно)">
              <input
                className={inputClass}
                type="text"
                maxLength={60}
                value={form.price}
                onChange={handInputChange('price')}
                placeholder="Например: от 1500 ₽ за занятие"
              />
            </Field>
            <Field label="Длина">
              <Select
                options={lengthOptions}
                value={form.length}
                onChange={handSelectChange('length')}
              />
            </Field>
            <Field label="Преимущества, опыт, условия" wide>
              <input
                className={inputClass}
                type="text"
                maxLength={500}
                value={form.keywords}
                onChange={handInputChange('keywords')}
                placeholder="Например: 5 лет опыта, онлайн и очно, пробное занятие бесплатно"
              />
            </Field>
          </>
        )}

        {mode === 'script' && (
          <>
            <Field label="Тон">
              <Select
                options={postToneOptions}
                value={form.postTone}
                onChange={handSelectChange('postTone')}
              />
            </Field>
            <Field label="Длительность">
              <Select
                options={lengthOptions}
                value={form.length}
                onChange={handSelectChange('length')}
              />
            </Field>
            <Field label="Призыв к действию (необязательно)" wide>
              <input
                className={inputClass}
                type="text"
                maxLength={150}
                value={form.cta}
                onChange={handInputChange('cta')}
                placeholder="Например: подпишись, напиши в комментариях"
              />
            </Field>
            <Field label="Тема видео" wide>
              <input
                className={inputClass}
                type="text"
                maxLength={400}
                value={form.keywords}
                onChange={handInputChange('keywords')}
                placeholder="О чём ролик"
              />
            </Field>
          </>
        )}

        {mode === 'bio' && (
          <>
            <Field label="Платформа">
              <Select
                options={platformOptions}
                value={form.platform}
                onChange={handSelectChange('platform')}
              />
            </Field>
            <Field label="Тон">
              <Select
                options={postToneOptions}
                value={form.postTone}
                onChange={handSelectChange('postTone')}
              />
            </Field>
            <Field label="Чем занимаешься, чем полезен" wide>
              <input
                className={inputClass}
                type="text"
                maxLength={300}
                value={form.keywords}
                onChange={handInputChange('keywords')}
                placeholder="Например: фотограф, свадьбы, Москва"
              />
            </Field>
          </>
        )}

        {mode === 'headline' && (
          <>
            <Field label="Тон">
              <Select
                options={postToneOptions}
                value={form.postTone}
                onChange={handSelectChange('postTone')}
              />
            </Field>
            <Field label="Сколько вариантов">
              <input
                className={inputClass}
                type="number"
                value={form.variantsCount}
                onChange={handNumberChange('variantsCount')}
                placeholder="5"
              />
            </Field>
            <Field label="Тема" wide>
              <input
                className={inputClass}
                type="text"
                maxLength={300}
                value={form.keywords}
                onChange={handInputChange('keywords')}
                placeholder="О чём статья, пост или видео"
              />
            </Field>
          </>
        )}

        {mode === 'reply' && (
          <>
            <Field label="Тон ответа">
              <Select
                options={replyToneOptions}
                value={form.replyTone}
                onChange={handSelectChange('replyTone')}
              />
            </Field>
            <Field label="Длина">
              <Select
                options={lengthOptions}
                value={form.length}
                onChange={handSelectChange('length')}
              />
            </Field>
            <Field label="Сообщение, на которое отвечаем" wide>
              <textarea
                className={textareaClass}
                maxLength={3000}
                value={form.sourceText}
                onChange={handInputChange('sourceText')}
                placeholder="Вставь письмо или сообщение"
              />
            </Field>
            <Field label="Что хочу ответить (необязательно)" wide>
              <input
                className={inputClass}
                type="text"
                maxLength={600}
                value={form.details}
                onChange={handInputChange('details')}
                placeholder="Например: согласен, но нужна неделя"
              />
            </Field>
          </>
        )}

        {mode === 'summary' && (
          <>
            <Field label="Что сделать">
              <Select
                options={summaryKindOptions}
                value={form.summaryKind}
                onChange={handSelectChange('summaryKind')}
              />
            </Field>
            <Field label="Текст (до 5000 символов)" wide>
              <textarea
                className={textareaClass}
                maxLength={5000}
                value={form.sourceText}
                onChange={handInputChange('sourceText')}
                placeholder="Вставь текст, который нужно пересказать"
              />
            </Field>
          </>
        )}

        {mode === 'essay' && (
          <>
            <Field label="Тема">
              <input
                className={inputClass}
                type="text"
                maxLength={150}
                value={form.itemName}
                onChange={handInputChange('itemName')}
                placeholder="Например: Роль книги в жизни человека"
              />
            </Field>
            <Field label="Объём">
              <Select
                options={lengthOptions}
                value={form.length}
                onChange={handSelectChange('length')}
              />
            </Field>
            <Field label="Тезисы и пожелания (необязательно)" wide>
              <textarea
                className={textareaClass}
                maxLength={1000}
                value={form.details}
                onChange={handInputChange('details')}
                placeholder="Какие мысли и примеры использовать"
              />
            </Field>
            <p className="col-span-1 sm:col-span-2 md:col-span-4 px-3 text-xs text-amber-600">
              Это черновик для вдохновения: проверь факты и перепиши своими словами.
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-center gap-3">
        <AdSlot className="order-2 md:order-1 md:flex-1" />
        <div className="order-1 md:order-2 flex flex-col items-center gap-1 md:w-56">
          <button
            className="gel bg-[#7A2432] hover:bg-[#5c1c28] rounded-full text-white px-12 py-3 shadow-sm transition-colors disabled:opacity-50 w-full"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Генерирую...' : 'Генерировать'}
          </button>
          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7A2432] rounded-full"
              style={barStyles[fillState]}
            />
          </div>
          {quota && quota.tier === form.tier?.value && (
            <p
              className={`select-none text-[11px] ${quota.remaining <= 5 ? 'text-[#7A2432]' : 'text-slate-400'}`}
            >
              Осталось {quota.remaining} из {quota.limit} запросов
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-red-600 px-3">{error}</p>}

      <div className="flex-1">
        <textarea
          className="p-4 border border-slate-200 outline-none focus:border-[#7A2432]/50 focus:ring-1 focus:ring-[#7A2432]/30 bg-white h-60 rounded-2xl shadow-sm w-full resize-none placeholder:text-slate-400"
          value={form.result}
          onChange={handInputChange('result')}
          placeholder="Здесь появится сгенерированный текст"
        />
      </div>

      {(form.result.trim() || undoStack.length > 0) && (
        <RefineBar
          mode={mode}
          hasText={Boolean(form.result.trim())}
          busy={loading || Boolean(refining)}
          refining={refining}
          canUndo={undoStack.length > 0}
          onRefine={handleRefine}
          onRegenerate={handleGenerate}
          onUndo={handleUndo}
        />
      )}

      <AboutBlock key={mode} mode={mode} />
    </div>
  );
}
