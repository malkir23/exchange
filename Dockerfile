# Використовуємо офіційний Python-образ
FROM python:3.10-slim

# Встановлюємо залежності
WORKDIR /project_exchange
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копіюємо весь проєкт
COPY app/. .
