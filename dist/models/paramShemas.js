"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveIssueParamsSchema = exports.deleteIssueAttachmentParamsSchema = exports.getIssueAttachmentsParamsSchema = exports.attachFileToIssueParamsSchema = exports.getQueuesParamsSchema = exports.getUserParamsSchema = exports.searchIssueByFilterParamsSchema = exports.searchIssueByQueryParamsShema = exports.deleteLinkParamsSchema = exports.getLinksParamsSchema = exports.linkIssueParamsSchema = exports.IssueLinkTypeEnum = exports.getTransitionsParamsSchema = exports.transitionIssueParamsSchema = exports.deleteIssueParamsSchema = exports.getCommentsParamsSchema = exports.addCommentParamsSchema = exports.updateIssueParamsSchema = exports.createIssueParamsSchema = exports.getIssueParamsSchema = void 0;
const zod_1 = require("zod");
const queue_1 = require("./queue");
// схема для определения входных параметром getIssueTool
exports.getIssueParamsSchema = zod_1.z.object({
    issueKey: zod_1.z
        .string()
        .describe("Ключ задачи в Yandex Tracker (например: TEST-123)"),
});
// схема для создания задачи
exports.createIssueParamsSchema = zod_1.z.object({
    queue: zod_1.z.string().describe("Ключ очереди (например: DENT, TEST)"),
    summary: zod_1.z.string().describe("Название задачи"),
    description: zod_1.z.string().optional().describe("Описание задачи (поддерживает Markdown)"),
    type: zod_1.z.string().optional().describe("Тип задачи: task, bug, epic, story и др."),
    priority: zod_1.z.string().optional().describe("Приоритет: critical, major, normal, minor, trivial"),
    assignee: zod_1.z.string().optional().describe("Логин исполнителя"),
    parent: zod_1.z.string().optional().describe("Ключ родительской задачи (например: TEST-1)"),
    followers: zod_1.z.array(zod_1.z.string()).optional().describe("Массив логинов наблюдателей"),
    tags: zod_1.z.array(zod_1.z.string()).optional().describe("Массив тегов"),
    sprint: zod_1.z.array(zod_1.z.string()).optional().describe("Массив ID спринтов"),
    storyPoints: zod_1.z.number().optional().describe("Story Points (сторипоинты) задачи"),
});
// схема для редактирования задачи
exports.updateIssueParamsSchema = zod_1.z.object({
    issueKey: zod_1.z.string().describe("Ключ задачи для редактирования (например: TEST-123)"),
    summary: zod_1.z.string().optional().describe("Новое название задачи"),
    description: zod_1.z.string().optional().describe("Новое описание задачи"),
    type: zod_1.z.string().optional().describe("Новый тип задачи"),
    priority: zod_1.z.string().optional().describe("Новый приоритет"),
    assignee: zod_1.z.string().nullable().optional().describe("Новый исполнитель (null для снятия)"),
    parent: zod_1.z.string().optional().describe("Новая родительская задача"),
    queue: zod_1.z.string().optional().describe("Новая очередь (ключ очереди, например: TEST)"),
    addTags: zod_1.z.array(zod_1.z.string()).optional().describe("Теги для добавления"),
    removeTags: zod_1.z.array(zod_1.z.string()).optional().describe("Теги для удаления"),
    addFollowers: zod_1.z.array(zod_1.z.string()).optional().describe("Наблюдатели для добавления"),
    removeFollowers: zod_1.z.array(zod_1.z.string()).optional().describe("Наблюдатели для удаления"),
    storyPoints: zod_1.z.number().nullable().optional().describe("Story Points (сторипоинты) задачи (null для снятия)"),
});
// схема для добавления комментария
exports.addCommentParamsSchema = zod_1.z.object({
    issueKey: zod_1.z.string().describe("Ключ задачи"),
    text: zod_1.z.string().describe("Текст комментария"),
    summonees: zod_1.z.array(zod_1.z.string()).optional().describe("Список логинов для призыва (@mention)"),
});
// схема для получения комментариев
exports.getCommentsParamsSchema = zod_1.z.object({
    issueKey: zod_1.z.string().describe("Ключ задачи"),
    perPage: zod_1.z.number().int().positive().default(50).describe("Количество комментариев"),
});
// схема для удаления задачи
exports.deleteIssueParamsSchema = zod_1.z.object({
    issueKey: zod_1.z.string().describe("Ключ задачи для удаления (например: TEST-123)"),
});
// схема для перехода в статус
exports.transitionIssueParamsSchema = zod_1.z.object({
    issueKey: zod_1.z.string().describe("Ключ задачи"),
    transitionId: zod_1.z.string().describe("ID перехода (получить через getTransitions)"),
    comment: zod_1.z.string().optional().describe("Комментарий к переходу"),
});
// схема для получения переходов
exports.getTransitionsParamsSchema = zod_1.z.object({
    issueKey: zod_1.z.string().describe("Ключ задачи"),
});
// Типы связей между задачами
exports.IssueLinkTypeEnum = zod_1.z.enum([
    "relates", // Связана с
    "depends on", // Зависит от (блокер)
    "is dependent by", // Является блокером для
    "duplicates", // Дублирует
    "is duplicated by", // Дублируется
    "is subtask for", // Подзадача для
    "is parent task for", // Родительская задача для
    "is epic of", // Эпик для
    "has epic", // Имеет эпик
]);
// схема для создания связи между задачами
exports.linkIssueParamsSchema = zod_1.z.object({
    issueKey: zod_1.z.string().describe("Ключ задачи, к которой добавляется связь"),
    relationship: exports.IssueLinkTypeEnum.describe("Тип связи: 'relates' (связана), 'depends on' (зависит от/блокер), 'is dependent by' (блокирует), 'duplicates' (дублирует), 'is subtask for' (подзадача для), 'is parent task for' (родительская задача)"),
    linkedIssue: zod_1.z.string().describe("Ключ связываемой задачи (например: TEST-456)"),
});
// схема для получения связей задачи
exports.getLinksParamsSchema = zod_1.z.object({
    issueKey: zod_1.z.string().describe("Ключ задачи"),
});
// схема для удаления связи
exports.deleteLinkParamsSchema = zod_1.z.object({
    issueKey: zod_1.z.string().describe("Ключ задачи"),
    linkId: zod_1.z.string().describe("ID связи (получить через getLinks)"),
});
exports.searchIssueByQueryParamsShema = zod_1.z.object({
    query: zod_1.z.string().describe("Запрос на языке запросов Яндекс Трекера"),
    isSimple: zod_1.z.boolean()
        .describe("true - вывод сжатой информации по задаче, false - вывод всей информации по задаче")
        .default(true),
    perPage: zod_1.z
        .number()
        .int()
        .positive()
        .default(1000)
        .describe("Количество элементов на странице (по умолчанию 50)"),
    page: zod_1.z
        .number()
        .int()
        .positive()
        .default(1)
        .describe("Номер страницы (по умолчанию 1)"),
});
exports.searchIssueByFilterParamsSchema = zod_1.z.object({
    filter: zod_1.z
        .record(zod_1.z.string(), zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()]))
        .describe("Объект фильтра для поиска задач по любым полям"),
    order: zod_1.z
        .string()
        .optional()
        .describe("Параметр сортировки по возрастанию или по убыванию"),
    perPage: zod_1.z
        .number()
        .int()
        .positive()
        .default(50)
        .describe("Количество элементов на странице (по умолчанию 50)"),
    page: zod_1.z
        .number()
        .int()
        .positive()
        .default(1)
        .describe("Номер страницы (по умолчанию 1)"),
});
exports.getUserParamsSchema = zod_1.z.object({
    key: zod_1.z
        .string()
        .describe("id или login пользователя Yandex Tracker"),
});
exports.getQueuesParamsSchema = zod_1.z.object({
    expand: zod_1.z.array(queue_1.ExpandQueueEnum).describe(`
              Получение дополнительных полей в модели очереди
              projects — проекты очереди;
              components — компоненты;
              versions — версии;
              types — типы задач;
              team — список участников команды;
              workflows — жизненные циклы.
            `).optional()
});
// схема для прикрепления файла к задаче
exports.attachFileToIssueParamsSchema = zod_1.z.object({
    issueKey: zod_1.z.string().describe("Ключ задачи (например: TEST-123)"),
    fileContent: zod_1.z.string().describe("Содержимое файла в формате base64 или Buffer"),
    fileName: zod_1.z.string().describe("Имя файла (например: image.jpg)"),
});
// схема для получения списка файлов задачи
exports.getIssueAttachmentsParamsSchema = zod_1.z.object({
    issueKey: zod_1.z.string().describe("Ключ задачи"),
});
// схема для удаления файла из задачи
exports.deleteIssueAttachmentParamsSchema = zod_1.z.object({
    issueKey: zod_1.z.string().describe("Ключ задачи"),
    attachmentId: zod_1.z.string().describe("ID вложения (получить через getAttachments)"),
});
// схема для переноса задачи в другую очередь
exports.moveIssueParamsSchema = zod_1.z.object({
    issueKey: zod_1.z.string().describe("Ключ задачи для переноса (например: TEST-123)"),
    queue: zod_1.z.string().describe("Ключ целевой очереди (например: NEW)"),
    moveAllFields: zod_1.z.boolean().optional().describe("Перенести компоненты, версии и проекты (если есть аналогичные в новой очереди)"),
    initialStatus: zod_1.z.boolean().optional().describe("Сбросить статус задачи в начальное значение новой очереди"),
});
//# sourceMappingURL=paramShemas.js.map