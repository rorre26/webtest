# График поставок

Веб-приложение для планирования поставок с двумя ролями: офис (создает заявки) и склад (подтверждает прием). Хранение данных — SQLite.

## Быстрый старт

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Автозапуск без ручного открытия браузера

```bash
python run_app.py
```

Скрипт сам поднимет сервер и откроет страницу `http://localhost:5000` в браузере.

### Запуск вручную

```bash
python app.py
```

Откройте `http://localhost:5000`.

### Демо-логины

- `office_user / office123` — офис
- `warehouse_user / warehouse123` — склад
