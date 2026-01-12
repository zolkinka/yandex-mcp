# Работа с вложениями в Yandex Tracker и Yandex Wiki

Добавлена поддержка загрузки и управления файлами (изображениями, документами) через MCP сервер.

## Yandex Tracker - Вложения к задачам

### Прикрепить файл к задаче

**Инструмент:** `attachFileToIssueTool`

**Описание:** Прикрепляет файл (например, изображение) к задаче в Яндекс.Трекере.

**Параметры:**
- `issueKey` (string) - Ключ задачи (например: TEST-123)
- `fileContent` (string) - Содержимое файла в формате base64 или Buffer
- `fileName` (string) - Имя файла (например: screenshot.jpg)

**Пример использования:**
```typescript
{
  "issueKey": "TEST-123",
  "fileContent": "iVBORw0KGgoAAAANSUhEUgAA...", // base64 строка
  "fileName": "screenshot.png"
}
```

**API:** `POST /v3/issues/<issue_key>/attachments/`

### Получить список вложений задачи

**Инструмент:** `getIssueAttachmentsTool`

**Описание:** Получает список всех прикрепленных файлов к задаче.

**Параметры:**
- `issueKey` (string) - Ключ задачи

**Пример использования:**
```typescript
{
  "issueKey": "TEST-123"
}
```

**API:** `GET /v3/issues/<issue_key>/attachments`

### Удалить вложение

**Инструмент:** `deleteIssueAttachmentTool`

**Описание:** Удаляет прикрепленный файл из задачи.

**Параметры:**
- `issueKey` (string) - Ключ задачи
- `attachmentId` (string) - ID вложения (получить через getIssueAttachments)

**Пример использования:**
```typescript
{
  "issueKey": "TEST-123",
  "attachmentId": "123456"
}
```

**API:** `DELETE /v3/issues/<issue_key>/attachments/<attachment_id>`

---

## Yandex Wiki - Файлы на страницах

### Загрузить файл на Wiki страницу

**Инструмент:** `uploadWikiFileTool`

**Описание:** Загружает файл (например, изображение или документ) на страницу Яндекс Вики.

**Параметры:**
- `pageId` (number) - ID страницы
- `fileContent` (string) - Содержимое файла в формате base64 или Buffer
- `fileName` (string) - Имя файла (например: diagram.png, document.pdf)

**Пример использования:**
```typescript
{
  "pageId": 12345,
  "fileContent": "iVBORw0KGgoAAAANSUhEUgAA...", // base64 строка
  "fileName": "diagram.png"
}
```

**API:** `POST /v1/pages/<pageId>/files`

### Получить список файлов Wiki страницы

**Инструмент:** `getWikiFilesTool`

**Описание:** Получает список всех файлов, прикрепленных к странице Яндекс Вики.

**Параметры:**
- `pageId` (number) - ID страницы

**Пример использования:**
```typescript
{
  "pageId": 12345
}
```

**API:** `GET /v1/pages/<pageId>/files`

### Удалить файл со страницы Wiki

**Инструмент:** `deleteWikiFileTool`

**Описание:** Удаляет файл со страницы Яндекс Вики.

**Параметры:**
- `pageId` (number) - ID страницы
- `fileId` (string) - ID файла (получить через getWikiFiles)

**Пример использования:**
```typescript
{
  "pageId": 12345,
  "fileId": "abc123"
}
```

**API:** `DELETE /v1/pages/<pageId>/files/<fileId>`

---

## Технические детали

### Формат файлов

Файлы передаются в формате **base64** строки. Поддерживается автоматическая конвертация:
- Base64 строка с префиксом `data:image/...;base64,` - префикс будет автоматически удален
- Чистая base64 строка
- Buffer объект

### Используемые технологии

- **form-data** - для формирования multipart/form-data запросов
- **axios** - для HTTP запросов с поддержкой загрузки файлов
- **Yandex Tracker API v3** - для работы с вложениями задач
- **Yandex Wiki API v1** - для работы с файлами на страницах Wiki

### Ограничения

1. Размер файла ограничен настройками Yandex API
2. Для Wiki API документация ограничена, endpoints могут отличаться
3. Требуется правильная настройка OAuth токена и организации (X-Org-Id или X-Cloud-Org-Id)

### Обработка ошибок

Все методы логируют операции через `pino` logger:
- Успешные операции: уровень `info`
- Ошибки: уровень `error` с подробностями от API

---

## Зависимости

Для работы требуются следующие пакеты:

```bash
npm install form-data
npm install --save-dev @types/form-data
```

## См. также

- [Yandex Tracker API - Прикрепить файл](https://yandex.cloud/docs/tracker/concepts/issues/post-attachment)
- [Yandex Wiki API Reference](https://yandex.ru/support/wiki/ru/api-ref/)
