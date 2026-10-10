# Бета-версия: только лёгкие режимы (сжатие, конвертация, PDF <-> Word).
# Когда будешь открывать удаление фона и апскейл — смотри ЗАПУСК.md, раздел «Открыть тяжёлые режимы».
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements-lite.txt .
RUN pip install -r requirements-lite.txt \
 && python -c "import cv2; cv2.dnn_superres.DnnSuperResImpl_create(); print('opencv ok', cv2.__version__)"

COPY . .

# Yandex Serverless Containers сам задаёт PORT.
# 1 воркер + потоки: счётчик лимитов хранится в памяти процесса.
CMD ["sh", "-c", "exec gunicorn --bind 0.0.0.0:${PORT:-8080} --workers 1 --threads 4 --timeout 120 app:app"]
