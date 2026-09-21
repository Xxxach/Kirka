const sectionClass = 'flex flex-col gap-2';
const headingClass = 'text-lg font-semibold text-slate-800';
const textClass = 'text-sm text-slate-600 leading-relaxed';

export function PrivacyPage() {
  return (
    <div className="flex flex-col px-5 py-1 gap-6 max-w-3xl mx-auto">
      <div className="bg-white/70 rounded-3xl border border-white/60 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-1">
            Политика конфиденциальности
          </h1>
          <p className="text-xs text-slate-400">
            Последнее обновление: сентябрь 2026
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>1. Общие положения</h2>
          <p className={textClass}>
            Kirka — бесплатный сервис для генерации текстов, перевода кода
            между языками программирования и обработки фотографий с помощью
            искусственного интеллекта. Использование сайта означает согласие
            с этой политикой. Если вы не согласны — пожалуйста, не пользуйтесь
            сайтом.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>2. Какие данные мы обрабатываем</h2>
          <p className={textClass}>
            <span className="font-medium text-slate-700">IP-адрес.</span> Используется
            только для подсчёта дневного лимита бесплатных генераций на
            странице «Текст-моменты», «Код-моменты» и «Фото-моменты». Мы не
            связываем IP-адрес с именем, почтой или какой-либо учётной
            записью — учётных записей на сайте нет вообще.
          </p>
          <p className={textClass}>
            <span className="font-medium text-slate-700">Данные, которые вы вводите в форму</span> —
            например, имя получателя поздравления, ключевые слова, текст для
            резюме, код для перевода. Эти данные отправляются во внешний
            ИИ-сервис (Cloudflare Workers AI или DeepSeek — в зависимости от
            выбранной модели) только для того, чтобы сгенерировать ответ на
            ваш запрос, и не сохраняются на нашем сервере после того, как
            ответ отправлен вам.
          </p>
          <p className={textClass}>
            <span className="font-medium text-slate-700">Загруженные фотографии</span> —
            обрабатываются сервером обработки изображений (сжатие, удаление
            фона, увеличение качества) и удаляются сразу после обработки. Мы
            не храним ваши фотографии и не используем их ни для чего, кроме
            выполнения того действия, которое вы выбрали.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>3. Файлы cookie и аналитика</h2>
          <p className={textClass}>
            На данный момент сайт не использует рекламные или трекинговые
            cookie. При подключении статистики посещаемости (например,
            Яндекс.Метрики) эта политика будет обновлена, а на сайте появится
            соответствующее уведомление.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>4. Реклама</h2>
          <p className={textClass}>
            Сайт бесплатный и в будущем будет показывать рекламные блоки. На
            этапе бета-тестирования рекламные места являются заглушками и не
            собирают никаких данных. При подключении реальной рекламной сети
            эта политика будет обновлена с описанием того, какие данные
            обрабатывает рекламный партнёр.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>5. Как мы используем данные</h2>
          <p className={textClass}>
            Исключительно для того, чтобы выполнить ваш запрос (сгенерировать
            текст, перевести код, обработать фото) и посчитать дневной лимит
            использования. Мы не продаём данные третьим лицам и не передаём
            их никому, кроме технических поставщиков ИИ-моделей, необходимых
            для генерации ответа (Cloudflare, DeepSeek).
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>6. Хранение данных</h2>
          <p className={textClass}>
            Счётчики лимитов по IP-адресу хранятся временно в оперативной
            памяти сервера и обнуляются раз в сутки, а также при перезапуске
            сервера. Постоянной базы данных пользователей на сайте нет.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>7. Ваши права</h2>
          <p className={textClass}>
            Вы можете задать любой вопрос об обработке данных или попросить
            что-либо уточнить через форму обратной связи на сайте.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>8. Возрастные ограничения</h2>
          <p className={textClass}>
            Сайт не предназначен для лиц младше 18 лет и не запрашивает
            информацию о возрасте пользователя.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>9. Изменения политики</h2>
          <p className={textClass}>
            Мы можем время от времени обновлять эту политику — например, при
            подключении рекламы или аналитики. Дата последнего обновления
            указана в начале страницы.
          </p>
        </div>
      </div>
    </div>
  );
}
