import { z } from "zod";
import {ExpandQueueEnum} from "./queue"

// схема для определения входных параметром getIssueTool
export const getIssueParamsSchema = z.object({
    issueKey: z
      .string()
      .describe("Ключ задачи в Yandex Tracker (например: TEST-123)"),
});

// схема для создания задачи
export const createIssueParamsSchema = z.object({
  queue: z.string().describe("Ключ очереди (например: DENT, TEST)"),
  summary: z.string().describe("Название задачи"),
  description: z.string().optional().describe("Описание задачи (поддерживает Markdown)"),
  type: z.string().optional().describe("Тип задачи: task, bug, epic, story и др."),
  priority: z.string().optional().describe("Приоритет: critical, major, normal, minor, trivial"),
  assignee: z.string().optional().describe("Логин исполнителя"),
  parent: z.string().optional().describe("Ключ родительской задачи (например: TEST-1)"),
  followers: z.array(z.string()).optional().describe("Массив логинов наблюдателей"),
  tags: z.array(z.string()).optional().describe("Массив тегов"),
  sprint: z.array(z.string()).optional().describe("Массив ID спринтов"),
});

// схема для редактирования задачи
export const updateIssueParamsSchema = z.object({
  issueKey: z.string().describe("Ключ задачи для редактирования (например: TEST-123)"),
  summary: z.string().optional().describe("Новое название задачи"),
  description: z.string().optional().describe("Новое описание задачи"),
  type: z.string().optional().describe("Новый тип задачи"),
  priority: z.string().optional().describe("Новый приоритет"),
  assignee: z.string().nullable().optional().describe("Новый исполнитель (null для снятия)"),
  parent: z.string().optional().describe("Новая родительская задача"),
  addTags: z.array(z.string()).optional().describe("Теги для добавления"),
  removeTags: z.array(z.string()).optional().describe("Теги для удаления"),
  addFollowers: z.array(z.string()).optional().describe("Наблюдатели для добавления"),
  removeFollowers: z.array(z.string()).optional().describe("Наблюдатели для удаления"),
});

// схема для добавления комментария
export const addCommentParamsSchema = z.object({
  issueKey: z.string().describe("Ключ задачи"),
  text: z.string().describe("Текст комментария"),
  summonees: z.array(z.string()).optional().describe("Список логинов для призыва (@mention)"),
});

// схема для получения комментариев
export const getCommentsParamsSchema = z.object({
  issueKey: z.string().describe("Ключ задачи"),
  perPage: z.number().int().positive().default(50).describe("Количество комментариев"),
});

// схема для удаления задачи
export const deleteIssueParamsSchema = z.object({
  issueKey: z.string().describe("Ключ задачи для удаления (например: TEST-123)"),
});

// схема для перехода в статус
export const transitionIssueParamsSchema = z.object({
  issueKey: z.string().describe("Ключ задачи"),
  transitionId: z.string().describe("ID перехода (получить через getTransitions)"),
  comment: z.string().optional().describe("Комментарий к переходу"),
});

// схема для получения переходов
export const getTransitionsParamsSchema = z.object({
  issueKey: z.string().describe("Ключ задачи"),
});

// Типы связей между задачами
export const IssueLinkTypeEnum = z.enum([
  "relates",         // Связана с
  "depends on",      // Зависит от (блокер)
  "is dependent by", // Является блокером для
  "duplicates",      // Дублирует
  "is duplicated by",// Дублируется
  "is subtask for",  // Подзадача для
  "is parent task for", // Родительская задача для
  "is epic of",      // Эпик для
  "has epic",        // Имеет эпик
]);

// схема для создания связи между задачами
export const linkIssueParamsSchema = z.object({
  issueKey: z.string().describe("Ключ задачи, к которой добавляется связь"),
  relationship: IssueLinkTypeEnum.describe(
    "Тип связи: 'relates' (связана), 'depends on' (зависит от/блокер), 'is dependent by' (блокирует), 'duplicates' (дублирует), 'is subtask for' (подзадача для), 'is parent task for' (родительская задача)"
  ),
  linkedIssue: z.string().describe("Ключ связываемой задачи (например: TEST-456)"),
});

// схема для получения связей задачи
export const getLinksParamsSchema = z.object({
  issueKey: z.string().describe("Ключ задачи"),
});

// схема для удаления связи
export const deleteLinkParamsSchema = z.object({
  issueKey: z.string().describe("Ключ задачи"),
  linkId: z.string().describe("ID связи (получить через getLinks)"),
});

export const searchIssueByQueryParamsShema = z.object({
  query: z.string().describe("Запрос на языке запросов Яндекс Трекера"),
  isSimple: z.boolean()
  .describe("true - вывод сжатой информации по задаче, false - вывод всей информации по задаче")
  .default(true),
  perPage: z
    .number()
    .int()
    .positive()
    .default(1000)
    .describe("Количество элементов на странице (по умолчанию 50)"),
  page: z
    .number()
    .int()
    .positive()
    .default(1)
    .describe("Номер страницы (по умолчанию 1)"),
});

export const searchIssueByFilterParamsSchema = z.object({
  filter: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .describe("Объект фильтра для поиска задач по любым полям"),
  order: z
    .string()
    .optional()
    .describe("Параметр сортировки по возрастанию или по убыванию"),
  perPage: z
    .number()
    .int()
    .positive()
    .default(50)
    .describe("Количество элементов на странице (по умолчанию 50)"),
  page: z
    .number()
    .int()
    .positive()
    .default(1)
    .describe("Номер страницы (по умолчанию 1)"),
});

export const getUserParamsSchema = z.object({
  key: z
    .string()
    .describe("id или login пользователя Yandex Tracker"),
});

export const getQueuesParamsSchema = z.object({
  expand: z.array(ExpandQueueEnum).describe(`
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
export const attachFileToIssueParamsSchema = z.object({
  issueKey: z.string().describe("Ключ задачи (например: TEST-123)"),
  fileContent: z.string().describe("Содержимое файла в формате base64 или Buffer"),
  fileName: z.string().describe("Имя файла (например: image.jpg)"),
});

// схема для получения списка файлов задачи
export const getIssueAttachmentsParamsSchema = z.object({
  issueKey: z.string().describe("Ключ задачи"),
});

// схема для удаления файла из задачи
export const deleteIssueAttachmentParamsSchema = z.object({
  issueKey: z.string().describe("Ключ задачи"),
  attachmentId: z.string().describe("ID вложения (получить через getAttachments)"),
});