import { AdSlot } from '../components/AdSlot';
import { ThemedSelect as Select } from '../components/ThemedSelect';
import { useState } from 'react';

const modeOptions = [
  { value: 'resume', label: 'Резюме' },
  { value: 'letter', label: 'Сопроводительное письмо' },
  { value: 'greeting', label: 'Поздравление' },
  { value: 'ad', label: 'Объявление' },
  { value: 'post', label: 'Пост для соцсети' },
  { value: 'slogan', label: 'Слоган / название' },
];

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
  mode: modeOptions[0],
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
  result: '',
};

export function TextPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fillState, setFillState] = useState('idle');

  const mode = form.mode.value;

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
    setLoading(true);
    setError('');
    setFillState('loading');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || 'Не удалось выполнить запрос');

      setFillState('done');
      await new Promise((r) => setTimeout(r, 300));
      setForm((prev) => ({ ...prev, result: data.result }));
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
      setFillState('idle');
    }
  };

  const labelClass = 'text-xs text-slate-500 font-semibold';
  const inputClass =
    'w-full min-w-0 px-3 h-9 border border-slate-300 rounded-lg shadow-sm bg-white';

  return (
    <div className="flex flex-col px-5 py-1 gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1 p-3">
          <p className={labelClass}>Что генерируем</p>
          <Select
            options={modeOptions}
            value={form.mode}
            onChange={handSelectChange('mode')}
          />
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

        {mode === 'greeting' && (
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
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-center gap-3">
        <AdSlot className="order-2 md:order-1 md:flex-1" />
        <div className="order-1 md:order-2 flex flex-col items-center gap-1 md:w-56">
          <button
            className="bg-[#7A2432] hover:bg-[#5c1c28] rounded-full text-white px-12 py-3 shadow-sm transition-colors disabled:opacity-50 w-full"
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
    </div>
  );
}
