# Техническое задание: MCP сервер для Яндекс.Трекер

## Общие сведения

Проект: MCP (Model Context Protocol) сервер для интеграции с Яндекс.Трекер
Платформа: Node.js
Режим работы: stdio, HTTP/HTTPS
API версия: Яндекс.Трекер REST API v 2

## Режимы работы

### 1. STDIO режим (для VS Code, Claude Desktop и т.д.)
```bash
npm run compile
npm run run
```

### 2. HTTP/HTTPS режим (для ChatGPT)
Сервер также может работать как HTTP/HTTPS API для подключения к ChatGPT через OpenAI Actions.

```bash
# Компиляция
npm run compile

# Запуск HTTP сервера
npm run start:http

# Для HTTPS настройте SSL_KEY_PATH и SSL_CERT_PATH в .env
```

**Доступные эндпоинты:**
- `GET /` - Информация о сервере
- `GET /.well-known/ai-plugin.json` - Манифест плагина для ChatGPT
- `GET /openapi.json` - OpenAPI спецификация
- `GET /tools` - Список всех инструментов
- `POST /execute/:operationId` - Выполнение инструмента

📚 Подробная документация: [HTTP_SERVER.md](HTTP_SERVER.md)

## Цель проекта

Создание MCP сервера, обеспечивающего взаимодействие AI-ассистентов с системой управления
задачами Яндекс.Трекер через стандартизированный протокол MCP.

## Архитектура и технические требования

### Основные компоненты

1. MCP Server Core
Реализация протокола MCP версии 2024 - 11 - 05
Обработка stdio коммуникации
Управление жизненным циклом соединения
2. Yandex Tracker API Client
HTTP клиент для взаимодействия с API Яндекс.Трекер
Аутентификация через OAuth токен
Обработка rate limiting и ошибок
3. Data Models
Типизированные модели для объектов Трекера (задачи, проекты, пользователи)
Валидация входящих и исходящих данных

### Технологический стек

Runtime: Node.js 18+  
Язык: TypeScript  
HTTP клиент: axios  
MCP SDK: @modelcontextprotocol/sdk  
Валидация: zod  
Логирование: pino 

## Функциональные требования

### Обязательные инструменты (tools)

1. Управление задачами

create_issue

```
Создание новой задачи
Параметры: summary, description, queue, type, priority, assignee, components, labels
Возврат: объект созданной задачи с ключом
```

get_issue

```
Получение информации о задаче по ключу
Параметры: issueKey
Возврат: полная информация о задаче
```

update_issue

```
Обновление существующей задачи
Параметры: issueKey, поля для обновления
Возврат: обновленный объект задачи
```

search_issues

```
Поиск задач по критериям
Параметры: query (язык запросов Трекера), sort, limit, offset
Возврат: список найденных задач
```

transition_issue

```
Изменение статуса задачи
Параметры: issueKey, transition, comment
Возврат: обновленная задача
```

2. Комментарии

add_comment

```
Добавление комментария к задаче
Параметры: issueKey, text, summonees
Возврат: объект созданного комментария
```

get_comments

```
Получение комментариев задачи
```

```
Параметры: issueKey, limit, offset
Возврат: список комментариев
```

3. Управление проектами

get_queues

```
Получение списка очередей
Параметры: expand, filter
Возврат: список доступных очередей
```

get_queue

```
Получение информации об очереди
Параметры: queueKey, expand
Возврат: детальная информация об очереди
```

4. Пользователи и права

get_myself

```
Получение информации о текущем пользователе
Возврат: профиль пользователя
```

search_users

```
Поиск пользователей
Параметры: query, limit
Возврат: список найденных пользователей
```

### Ресурсы (resources)

1. Конфигурация

config://yandex-tracker/settings

```
Текущие настройки подключения
Информация об авторизации (без токена)
Базовый URL API
```

2. Схемы и метаданные

schema://yandex-tracker/issue-types

```
Доступные типы задач в организации
```

schema://yandex-tracker/priorities

```
Список приоритетов задач
```

schema://yandex-tracker/statuses

```
Доступные статусы задач
```

### Промпты (prompts)

1. Анализ задач

analyze_sprint

```
Анализ спринта или группы задач
Аргументы: sprintId или query для поиска задач
Контекст: статистика, проблемы, рекомендации
```

task_summary

```
Краткое изложение задачи
Аргументы: issueKey
Контекст: суть задачи, статус, исполнители
```

2. Создание контента

daily_report

```
Генерация отчета о ежедневной работе
Аргументы: assignee, date
Контекст: выполненные задачи, планы
```

## Конфигурация и аутентификация

### Переменные окружения

### Аутентификация

```
YANDEX_TRACKER_TOKEN=<OAuth токен>
YANDEX_TRACKER_CLOUD_ORG_ID=<ID огранизации>
YANDEX_TRACKER_BASE_URL=https://api.tracker.yandex.net/v2
LOG_LEVEL=info
REQUEST_TIMEOUT=30000
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60000
```

```
OAuth 2. 0 токен через заголовок Authorization
Передача ID организации в заголовке X-Cloud-Org-Id
Обработка истечения токена с информативными сообщениями
```

## Обработка ошибок

### Типы ошибок

1. Аутентификация
   401 Unauthorized - невалидный токен
   403 Forbidden - недостаточно прав
2. Клиентские ошибки
   400 Bad Request - некорректные параметры
   404 Not Found - задача не найдена
   409 Conflict - конфликт при обновлении
3. Серверные ошибки
   500 Internal Server Error
   503 Service Unavailable
4. Сетевые ошибки
   Таймауты
   Потеря соединения

### Стратегии обработки

Автоматические повторы для 5 xx ошибок (exponential backoff)
Rate limiting с ожиданием
Детальные сообщения об ошибках для пользователя
Логирование всех ошибок для отладки

## Производительность и ограничения

### Rate Limiting

Соблюдение лимитов API Яндекс.Трекер
Очередь запросов с приоритизацией
Кэширование часто запрашиваемых данных

### Оптимизация

1. Пакетные операции где возможно
2. Ленивая загрузка данных
3. Сжатие ответов

## Тестирование

### Unit тесты

Покрытие всех публичных методов
Мокирование HTTP запросов
Валидация входных и выходных данных

### Интеграционные тесты

Тестирование с реальным API (dev окружение)
Проверка всех инструментов MCP
Тестирование обработки ошибок

### E 2 E тесты

Полный цикл взаимодействия через MCP
Тестирование в Claude Desktop или другом MCP клиенте

## Документация

### README.md

Инструкции по установке и настройке
Примеры использования
Конфигурация для популярных MCP клиентов

### API Documentation

Описание всех инструментов, ресурсов и промптов
Примеры запросов и ответов
Схемы данных

### Troubleshooting Guide

Частые проблемы и их решения
Отладка соединения
Проблемы с аутентификацией

## Развертывание и распространение

### NPM пакет

Публикация в npm registry
Семантическое версионирование
Автоматические релизы через GitHub Actions

### Docker контейнер (опционально)

Dockerfile для контейнеризации
Docker Compose для локальной разработки

### Установка

### Конфигурация в MCP клиентах

## Мониторинг и логирование

### Метрики

Количество запросов к API
Время ответа
Количество ошибок по типам
Использование rate limit

### Логирование

Структурированные логи в JSON формате

``` bash
npm install -g yandex-tracker-mcp-server
```

``` json
{
"mcpServers": {
    "yandex-tracker": {
        "command": "yandex-tracker-mcp-server",
        "env": {
        "YANDEX_TRACKER_TOKEN": "your_token_here",
        "YANDEX_TRACKER_CLOUD_ORG_ID": "your_org_id"
            }
        }
    }
}
```

```
Различные уровни логирования
Ротация логов
Безопасность - исключение токенов из логов
```

## Безопасность

### Защита токенов

1. Токены только через переменные окружения
2. Маскирование токенов в логах
3. Безопасное хранение конфигурации

### Валидация данных

1. Проверка всех входящих параметров
2. Санитизация пользовательского ввода
3. Защита от injection атак

## Совместимость

### MCP версии

1. Поддержка MCP Protocol 2024 - 11 - 05
2. Обратная совместимость с предыдущими версиями

### Node.js версии

Минимальная версия: Node.js 18
Тестирование на LTS версиях
Поддержка ES modules

## Планы развития

### Фаза 1 (MVP)

Базовые операции с задачами
Поиск и фильтрация
Управление комментариями

### Фаза 2

Работа с проектами и досками
Продвинутая аналитика
Интеграция с календарем

### Фаза 3

Автоматизация процессов
Интеграция с другими системами
Расширенные отчеты

## Критерии приемки

1. Все обязательные инструменты реализованы и протестированы
2. Успешная интеграция с популярными MCP клиентами
3. Покрытие тестами не менее 80 %
4. Документация полная и актуальная
5. Производительность соответствует требованиям API
6. Безопасная обработка аутентификационных данных

<!-- # Yandex Tracker MCP Server

MCP сервер для работы с Яндекс.Трекер

## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy? [Use the template at the bottom](#editing-this-readme)!

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gitlab.zhcom.ru/zhelezno/general/yandex-tracker-mcp-server.git
git branch -M main
git push -uf origin main
```

## Integrate with your tools

- [ ] [Set up project integrations](https://gitlab.zhcom.ru/zhelezno/general/yandex-tracker-mcp-server/-/settings/integrations)

## Collaborate with your team

- [ ] [Invite team members and collaborators](https://docs.gitlab.com/ee/user/project/members/)
- [ ] [Create a new merge request](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html)
- [ ] [Automatically close issues from merge requests](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#closing-issues-automatically)
- [ ] [Enable merge request approvals](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/)
- [ ] [Automatically merge when pipeline succeeds](https://docs.gitlab.com/ee/user/project/merge_requests/merge_when_pipeline_succeeds.html)

## Test and Deploy

Use the built-in continuous integration in GitLab.

- [ ] [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/index.html)
- [ ] [Analyze your code for known vulnerabilities with Static Application Security Testing(SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
- [ ] [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
- [ ] [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
- [ ] [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

***

# Editing this README

When you're ready to make this README your own, just edit this file and use the handy template below (or feel free to structure it however you want - this is just a starting point!).  Thank you to [makeareadme.com](https://www.makeareadme.com/) for this template.

## Suggestions for a good README
Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name
Choose a self-explaining name for your project.

## Description
Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges
On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers. -->
