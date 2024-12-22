# Використовуємо офіційний Python-образ
FROM python:3.10-slim

# Встановлюємо залежності
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копіюємо весь проєкт
COPY . .

# Команда для запуску
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
