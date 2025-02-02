#!/bin/sh
# Скрипт для створення резервної копії MongoDB та видалення найстарішої,
# якщо кількість копій більше 10.

# Директорія для збереження резервних копій (монтується як volume)
BACKUP_DIR=/backup

# Переконуємося, що директорія існує
mkdir -p "$BACKUP_DIR"

while true; do
    # Створюємо мітку часу для імені папки резервної копії
    TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
    echo "[$(date)] Створюємо резервну копію: $TIMESTAMP"

    # Виконуємо mongodump за допомогою змінної MONGO_URI (должна бути задана у середовищі)
    mongodump --uri="$MONGO_URI" --out "$BACKUP_DIR/$TIMESTAMP"

    # Підраховуємо кількість папок резервних копій
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)

    # Якщо кількість резервних копій більше 10, видаляємо найстарішу
    if [ "$BACKUP_COUNT" -gt 10 ]; then
      NUM_TO_DELETE=$(($BACKUP_COUNT - 10))
      echo "[$(date)] Резервних копій більше 10. Видаляємо $NUM_TO_DELETE найстарішу(і) копію(ї)."

      # Сортуємо директорії за ім'ям (формат timestamp дозволяє сортування) та видаляємо найстаріші
      OLDEST_BACKUPS=$(ls -1 "$BACKUP_DIR" | sort | head -n "$NUM_TO_DELETE")

      for backup in $OLDEST_BACKUPS; do
        echo "[$(date)] Видаляємо резервну копію: $backup"
        rm -rf "$BACKUP_DIR/$backup"
      done
    fi

    # Засинаємо на 24 години (86400 секунд) перед наступною резервною копією
    echo "[$(date)] Чекаємо 24 години до наступної резервної копії..."
    sleep 86400
done
