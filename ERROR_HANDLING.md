# Улучшения обработки ошибок

## Обзор изменений

Реализована детальная обработка ошибок API Yandex Tracker и Yandex Wiki, чтобы нейросеть получала максимум информации о причинах ошибок.

## Проблема

Ранее при ошибках API возвращался только HTTP статус (например, 422), без детальной информации о причине ошибки от Yandex API.

## Решение

### 1. Создана утилита форматирования ошибок

**Файл:** `src/utils/errorFormatter.ts`

Функции:
- `formatApiError(error, context)` - форматирует ошибку в читаемый текст
- `createFormattedError(error, context)` - создает Error с детальным сообщением

Утилита обрабатывает:
- Ошибки axios (YandexWikiAPI)
- Ошибки yandex-tracker-client
- Стандартные JavaScript Error
- Строковые ошибки

Извлекаемая информация:
- HTTP статус код
- Текст статуса
- HTTP метод (GET, POST, PATCH, DELETE)
- URL запроса
- Детали ошибки из тела ответа (error, errors, errorMessages, message и т.д.)

### 2. Обновлена обработка в YandexTrackerAPI

**Файл:** `src/yandex_api/YandexTrackerAPI.ts`

Обновлены все методы:
- Базовые HTTP методы: `get()`, `post()`, `patch()`, `delete()`
- Методы работы с задачами: `createIssue()`, `updateIssue()`, `getIssue()` и др.
- Методы поиска: `searchIssueByQuery()`, `searchIssueByFilter()`
- Методы комментариев, связей, вложений и т.д.

### 3. Обновлена обработка в YandexWikiAPI

**Файл:** `src/yandex_api/YandexWikiAPI.ts`

Обновлены все методы:
- Базовые HTTP методы: `get()`, `post()`, `delete()`
- Методы работы со страницами: `getPage()`, `createPage()`, `updatePage()` и др.
- Методы работы с файлами: `uploadFile()`, `getFiles()`, `deleteFile()`

## Пример формата ошибки

До изменений:
```
Request failed with status code 422
```

После изменений:
```
Ошибка при выполнении createIssue:
Статус: 422 (Unprocessable Entity)
Запрос: POST https://api.tracker.yandex.net/v3/issues
Описание: {
  "errorMessages": [
    "Поле 'assignee' содержит некорректное значение: пользователь 'kiruxa5000' не найден"
  ],
  "errors": {
    "assignee": "Пользователь не найден"
  }
}
```

## Совместимость

Изменения обратно совместимы - все API методы работают как раньше, но теперь возвращают более информативные ошибки.

## Логирование

Все ошибки дополнительно логируются с полным контекстом для отладки (статус, URL, детали ошибки, оригинальный объект ошибки).
