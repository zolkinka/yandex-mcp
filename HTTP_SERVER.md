# HTTP/HTTPS сервер для ChatGPT

Этот модуль позволяет запустить MCP сервер как HTTP/HTTPS сервер для подключения к ChatGPT через OpenAI Actions API.

## Возможности

- ✅ Автоматическая генерация OpenAPI спецификации из инструментов
- ✅ Поддержка HTTPS для безопасного подключения
- ✅ Манифест плагина для ChatGPT (/.well-known/ai-plugin.json)
- ✅ API ключ для аутентификации
- ✅ Все инструменты Yandex Tracker и Wiki

## Быстрый старт

### 1. Настройка окружения

Скопируйте `.env.example` в `.env` и настройте переменные:

```bash
cp .env.example .env
```

Минимальная конфигурация:
```env
YANDEX_TRACKER_TOKEN=<ваш OAuth токен>
YANDEX_TRACKER_CLOUD_ORG_ID=<ID организации>
YANDEX_TRACKER_BASE_URL=https://api.tracker.yandex.net/v2
HTTP_PORT=3000
```

### 2. Компиляция и запуск

```bash
# Компиляция TypeScript
npm run compile

# Запуск HTTP сервера (для разработки)
npm run start:http

# Или для разработки с ts-node
npm run dev:http
```

### 3. Проверка работы

```bash
# Информация о сервере
curl http://localhost:3000/

# Список инструментов
curl http://localhost:3000/tools

# OpenAPI спецификация
curl http://localhost:3000/openapi.json

# Выполнение инструмента
curl -X POST http://localhost:3000/execute/getMySelf \
  -H "Content-Type: application/json"
```

## Настройка HTTPS

Для подключения к ChatGPT **обязательно** нужен HTTPS. Есть несколько способов:

### Способ 1: Собственные SSL сертификаты

1. Получите SSL сертификат (Let's Encrypt, Cloudflare, etc.)

2. Укажите пути в `.env`:
```env
SSL_KEY_PATH=/path/to/private.key
SSL_CERT_PATH=/path/to/certificate.crt
```

3. Запустите сервер:
```bash
npm run start:https
```

### Способ 2: Reverse Proxy (Nginx)

Используйте Nginx как reverse proxy с SSL termination:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Способ 3: Cloudflare Tunnel

Используйте Cloudflare Tunnel для безопасного доступа:

```bash
cloudflared tunnel --url http://localhost:3000
```

## Подключение к ChatGPT

### Через GPT Builder (ChatGPT Plus)

1. Откройте https://chat.openai.com
2. Создайте новый GPT или откройте существующий
3. Перейдите в раздел "Configure" → "Actions"
4. Нажмите "Import from URL"
5. Введите: `https://your-domain.com/openapi.json`
6. Настройте аутентификацию (если используете API ключ)
7. Сохраните GPT

### Аутентификация

Если включен API ключ (`HTTP_API_KEY` в `.env`):

1. В GPT Builder выберите "Authentication" → "API Key"
2. Auth Type: **Custom**
3. Custom Header Name: **X-API-Key**
4. Введите ваш API ключ

## Эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/` | Информация о сервере |
| GET | `/health` | Health check |
| GET | `/.well-known/ai-plugin.json` | Манифест плагина ChatGPT |
| GET | `/openapi.json` | OpenAPI спецификация (JSON) |
| GET | `/openapi.yaml` | OpenAPI спецификация (YAML) |
| GET | `/tools` | Список всех инструментов |
| GET | `/tools/:name` | Информация об инструменте |
| POST | `/execute/:operationId` | Выполнение инструмента |

## Доступные инструменты

### Yandex Tracker - Пользователи
- `getTrackerUsers` - Получить всех пользователей
- `getUser` - Получить пользователя по ID/login
- `getMySelf` - Получить текущего пользователя

### Yandex Tracker - Справочники
- `getUserFields` - Поля пользователя
- `getQueueFields` - Поля очереди
- `getIssueFields` - Поля задачи
- `getIssueStatusTypes` - Типы статусов
- `getIssuePriorityTypes` - Типы приоритетов
- `getIssueTypes` - Типы задач

### Yandex Tracker - Очереди
- `getQueues` - Список очередей

### Yandex Tracker - Поиск
- `getYandexQueryDoc` - Документация по языку запросов
- `searchIssueByQuery` - Поиск задач

### Yandex Tracker - Задачи
- `getIssue` - Получить задачу
- `createIssue` - Создать задачу
- `updateIssue` - Редактировать задачу
- `deleteIssue` - Удалить задачу

### Yandex Tracker - Комментарии
- `addComment` - Добавить комментарий
- `getComments` - Получить комментарии

### Yandex Tracker - Статусы
- `getTransitions` - Получить доступные переходы
- `transitionIssue` - Выполнить переход

### Yandex Tracker - Связи
- `linkIssue` - Создать связь
- `getLinks` - Получить связи
- `deleteLink` - Удалить связь

### Yandex Wiki
- `getWikiPage` - Получить страницу по slug
- `getWikiPageById` - Получить страницу по ID
- `createWikiPage` - Создать страницу
- `updateWikiPage` - Обновить страницу
- `deleteWikiPage` - Удалить страницу
- `appendWikiContent` - Добавить контент

## Примеры запросов

### Поиск задач
```bash
curl -X POST https://your-domain.com/execute/searchIssueByQuery \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"query": "Queue: MYQUEUE AND Status: open", "isSimple": true}'
```

### Создание задачи
```bash
curl -X POST https://your-domain.com/execute/createIssue \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "queue": "MYQUEUE",
    "summary": "Новая задача",
    "description": "Описание задачи",
    "priority": "normal"
  }'
```

### Добавление комментария
```bash
curl -X POST https://your-domain.com/execute/addComment \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "issueKey": "MYQUEUE-123",
    "text": "Комментарий к задаче"
  }'
```

## Безопасность

1. **Всегда используйте HTTPS** для продакшена
2. **Настройте API ключ** для защиты от несанкционированного доступа
3. **Ограничьте IP адреса** на уровне firewall или Nginx
4. **Используйте rate limiting** (уже настроен в конфиге)
5. **Храните секреты безопасно** (не коммитьте .env)

## Troubleshooting

### Ошибка CORS
Сервер уже настроен для CORS. Если проблема сохраняется, проверьте заголовки в reverse proxy.

### ChatGPT не видит инструменты
1. Проверьте доступность `/openapi.json`
2. Убедитесь, что схема валидна (используйте Swagger Editor)
3. Проверьте HTTPS сертификат

### Ошибка аутентификации
1. Проверьте, что API ключ передается в заголовке `X-API-Key`
2. Убедитесь, что ключ совпадает с `HTTP_API_KEY` в `.env`
