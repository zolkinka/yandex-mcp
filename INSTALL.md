# Инструкция по установке Yandex Tracker MCP Server

Этот MCP сервер позволяет работать с Яндекс.Трекером и Яндекс.Вики прямо из VS Code через GitHub Copilot.

## Требования

- **Node.js 18+** — [скачать с официального сайта](https://nodejs.org/)
- **Git** — для клонирования репозитория
- **VS Code** с расширением GitHub Copilot
- **OAuth токен Яндекса** с правами на Tracker и Wiki

---

## Шаг 1: Клонирование репозитория

Откройте терминал и выполните:

```bash
git clone https://gitlab.zhcom.ru/zhelezno/general/yandex-tracker-mcp-server.git
cd yandex-tracker-mcp-server
```

---

## Шаг 2: Установка зависимостей

```bash
npm install
```

---

## Шаг 3: Получение OAuth токена

1. Перейдите на [oauth.yandex.ru](https://oauth.yandex.ru/)
2. Создайте новое приложение или используйте существующее
3. Добавьте права (scopes):
   - `tracker:read` — чтение задач
   - `tracker:write` — создание/редактирование задач
   - `wiki:read` — чтение вики
   - `wiki:write` — создание/редактирование вики
4. Получите OAuth токен

> **Важно:** Сохраните токен — он понадобится на следующем шаге.

---

## Шаг 4: Создание файла конфигурации

Создайте файл `.env` в корне проекта:

```bash
# macOS/Linux
touch .env
```

Откройте `.env` и добавьте:

```env
YANDEX_TRACKER_TOKEN=ваш_oauth_токен
YANDEX_TRACKER_ORG_ID=8348585
YANDEX_TRACKER_BASE_URL=https://api.tracker.yandex.net/v2
```

> **Примечание:** `YANDEX_TRACKER_ORG_ID=8348585` — это ID организации. Если у вас другая организация, уточните ID у администратора.

---

## Шаг 5: Компиляция проекта

```bash
npx tsc
```

После компиляции появится папка `dist/` с готовыми JavaScript файлами.

---

## Шаг 6: Настройка VS Code

Откройте глобальный файл конфигурации MCP:

**macOS:**
```bash
code ~/Library/Application\ Support/Code/User/mcp.json
```

**Windows:**
```bash
code %APPDATA%\Code\User\mcp.json
```

**Linux:**
```bash
code ~/.config/Code/User/mcp.json
```

Если файла нет — создайте его. Добавьте следующее содержимое:

```json
{
  "servers": {
    "yandex-tracker": {
      "type": "stdio",
      "command": "node",
      "args": ["/полный/путь/до/yandex-tracker-mcp-server/dist/index.js"],
      "env": {
        "YANDEX_TRACKER_TOKEN": "ваш_oauth_токен",
        "YANDEX_TRACKER_ORG_ID": "8348585",
        "YANDEX_TRACKER_BASE_URL": "https://api.tracker.yandex.net/v2"
      }
    }
  }
}
```

> **Важно:** Замените `/полный/путь/до/yandex-tracker-mcp-server` на реальный путь к папке проекта.
>
> Пример для macOS:
> ```
> /Users/username/Projects/yandex-tracker-mcp-server/dist/index.js
> ```

---

## Шаг 7: Перезапуск VS Code

1. Полностью закройте VS Code
2. Откройте VS Code заново
3. MCP сервер запустится автоматически

---

## Шаг 8: Активация Яндекс.Вики (если нужна работа с вики)

Перед первым использованием вики необходимо активировать её:

1. Откройте в браузере [wiki.yandex.ru](https://wiki.yandex.ru/)
2. Войдите под своей учётной записью
3. После этого API вики станет доступно

---

## Проверка работы

Откройте Copilot Chat в VS Code и попробуйте:

```
Покажи мои задачи в Яндекс.Трекере
```

или

```
Создай задачу в очереди DENT с названием "Тестовая задача"
```

---

## Возможные проблемы

### Ошибка 401 Unauthorized
- Проверьте правильность OAuth токена
- Убедитесь, что токен не истёк

### Ошибка 403 Forbidden
- Проверьте, что указан правильный `YANDEX_TRACKER_ORG_ID`
- Убедитесь, что у токена есть нужные права (scopes)
- Для вики: посетите [wiki.yandex.ru](https://wiki.yandex.ru/) хотя бы один раз

### MCP сервер не запускается
- Проверьте путь в `mcp.json` — он должен быть абсолютным
- Убедитесь, что проект скомпилирован (`npx tsc`)
- Проверьте наличие файла `dist/index.js`

### Команда `node` не найдена
- Установите Node.js: https://nodejs.org/
- Перезапустите терминал/VS Code после установки

---

## Доступные возможности

После настройки вы сможете через GitHub Copilot:

**Яндекс.Трекер:**
- Создавать и редактировать задачи
- Искать задачи по запросу
- Добавлять комментарии
- Менять статусы задач
- Создавать связи между задачами

**Яндекс.Вики:**
- Читать страницы вики
- Создавать новые страницы
- Редактировать существующие страницы
- Удалять страницы

---

## Обновление сервера

Для обновления до последней версии:

```bash
cd /путь/до/yandex-tracker-mcp-server
git pull
npm install
npx tsc
```

После обновления перезапустите VS Code.

---

## Поддержка

Если возникли вопросы — обращайтесь к @kirill.zolkin (Кирилл Золкин).
