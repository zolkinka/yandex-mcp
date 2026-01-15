"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.YandexTrackerMcpServer = void 0;
const YandexMcpServer_1 = require("./YandexMcpServer");
const YandexTrackerToolName_1 = require("../enums/YandexTrackerToolName");
const YandexWikiToolName_1 = require("../enums/YandexWikiToolName");
const zod_1 = require("zod");
const YandexTrackerAPI_1 = require("../yandex_api/YandexTrackerAPI");
const YandexWikiAPI_1 = require("../yandex_api/YandexWikiAPI");
const paramShemas_1 = require("../models/paramShemas");
const wikiParamSchemas_1 = require("../models/wikiParamSchemas");
const config_1 = require("../settings/config");
const YandexTrackerPromptName_1 = require("../enums/YandexTrackerPromptName");
const fs = __importStar(require("fs/promises"));
const ModelDescriptionName_1 = require("../enums/ModelDescriptionName");
class YandexTrackerMcpServer extends YandexMcpServer_1.YandexMcpServer {
    /**
     * колим контруктор суперкласса
     */
    constructor(name, version) {
        super(name, version);
        this.addResources();
        this.addPrompts();
        this.addTools();
    }
    // регистрируем все MCP prompts связанные с Yandex Tracker
    addPrompts() {
        this.mcpServer.prompt(YandexTrackerPromptName_1.YandexTrackerPromptName.taskSummary, "Краткое изложение задачи: суть задачи, статус, приоритет, исполнитель", { issueKey: zod_1.z.string().describe("Ключ задачи") }, this.getTaskSummaryPromptCallBack.bind(this));
        this.mcpServer.prompt(YandexTrackerPromptName_1.YandexTrackerPromptName.searchIssue, "Поиск задач по основным полям", {
            issueCount: zod_1.z
                .string()
                .regex(/^[1-9]\d*$/, {
                message: "Должно быть целое число больше нуля",
            })
                .describe("Кол-во задач"),
            queueKey: zod_1.z.string().describe("Ключ очереди"),
            status: zod_1.z.string().describe("Статус задачи"),
            priority: zod_1.z.string().describe("Приоритет задачи"),
            issueType: zod_1.z.string().describe("Тип задачи"),
            name: zod_1.z.string().describe("Имя и Фамилия исполнителя"),
        }, this.searchIssuePromptCallBack.bind(this));
    }
    // регистрируем все MCP resources связанные с Yandex Tracker
    addResources() {
        // // issue types
        // this.mcpServer.resource(
        //   YandexTrackerResourceName.issueResourceName,
        //   `${config.MCP_SERVER_BASE_URL}${YandexTrackerResourceUri.issueTypes}`,
        //   {
        //     description:
        //       "Ресурс яндекс трекера, описывающий типы задач в организации",
        //     contentType: "text/plain", // Тип контента, который возвращает ресурс
        //   },
        //   this.getIssueTypesResourceCallback.bind(this)
        // );
        // // priority types
        // this.mcpServer.resource(
        //   YandexTrackerResourceName.priorityResourceName,
        //   `${config.MCP_SERVER_BASE_URL}${YandexTrackerResourceUri.priorityTypes}`,
        //   {
        //     description:
        //       "Ресурс яндекс трекера, описывающий список приоритетов задач в организации",
        //     contentType: "text/plain", // Тип контента, который возвращает ресурс
        //   },
        //   this.getPriorityTypesResourceCallback.bind(this)
        // );
        // // status types
        // this.mcpServer.resource(
        //   YandexTrackerResourceName.statusResourceName,
        //   `${config.MCP_SERVER_BASE_URL}${YandexTrackerResourceUri.statusTypes}`,
        //   {
        //     description:
        //       "Ресурс яндекс трекера, описывающий доступные статусы задач в организации",
        //     contentType: "text/plain", // Тип контента, который возвращает ресурс
        //   },
        //   this.getStatusTypesResourceCallback.bind(this)
        // );
    }
    // регистрируем все MCP tools связанные с Yandex Tracker
    addTools() {
        // getUsersTool
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getUsers, "Получает всех пользователей трекера", {}, this.getUsersToolCallback);
        // getUserFieldsTool
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getUserFields, "Получает все поля пользователя с их описанием", {}, this.getUserFieldsToolCallback);
        // getQueueFieldsTool
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getQueueFields, "Получает все поля очереди с их описанием", {}, this.getQueueFieldsToolCallback);
        // getIssueFieldsTool
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getIssueFields, "Получает все поля задачи с их описанием", {}, this.getIssueFieldsToolCallback);
        // getIssueStatusTypesTool
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getIssueStatusTypes, "Получает все типы статусов для задач, которые есть в яндекс трекере", {}, this.getIssueStatusTypesToolCallback);
        // getIssuePriorityTypesTool
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getIssuePriorityTypes, "Получает все типы приоритетов для задач, которые есть в яндекс трекере", {}, this.getIssuePriorityTypesToolCallback);
        // getIssueTypesTool
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getIssueTypes, "Получает все типы задач, которые есть в яндекс трекере", {}, this.getIssueTypesToolCallback);
        // getYandexQueryDocTool
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getYandexQueryDoc, "getYandexQueryDocTool - получает всю необходимую информацию для выполнения корретного поиска задач.", {}, this.getYandexQueryDocToolCallback);
        // searchIssueByQueryTool
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.searchIssueByQuery, `
        Если пользовотель не указал perPage или page, то ничего от себя не придумывай и не добавляй эти параметры в запрос.
        Перед поиском задачи по запросу, сначала вызови инструмент "getYandexQueryDocTool", чтобы получить необходимые параметры для поиска. 
        Только после этого используй "searchIssueByQueryTool". Поиск задачи по любым параметрам с использованием языка запросов Yandex tracker.
        Позволяет получить список задач, удовлетворяющих запросу. Если выгружается больше 3 задач использовать формат простых задач, параметр isSimple=true
        Возвращает: issueArray - массив задач, countOfIssues - количсетво задач в массиве.
      `, paramShemas_1.searchIssueByQueryParamsShema.shape, this.searchIssueByQueryToolCallback.bind(this));
        // getQueuesTool
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getQueues, "Получения списка доступных очередей", paramShemas_1.getQueuesParamsSchema.shape, this.getQueuesToolCallback.bind(this));
        // getMySelfTool
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getMySelf, "Получает информацию о текущем пользователе", {}, this.getMySelfToolCallback);
        // getIssueTool
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getIssue, "Получает информацию о задаче по ее id или key", paramShemas_1.getIssueParamsSchema.shape, this.getIssueToolCallback.bind(this));
        // getUserTool
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getUser, "Получает ползователя по id или login", paramShemas_1.getUserParamsSchema.shape, this.getUserToolCallback.bind(this));
        // createIssueTool - создание новой задачи
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.createIssue, "Создает новую задачу в Yandex Tracker. Обязательные поля: queue (ключ очереди) и summary (название). Поддерживается установка story points (storyPoints).", paramShemas_1.createIssueParamsSchema.shape, this.createIssueToolCallback.bind(this));
        // updateIssueTool - редактирование задачи
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.updateIssue, "Редактирует существующую задачу в Yandex Tracker: название, описание, приоритет, исполнитель, очередь, теги, story points (storyPoints) и т.д.", paramShemas_1.updateIssueParamsSchema.shape, this.updateIssueToolCallback.bind(this));
        // addCommentTool - добавление комментария
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.addComment, "Добавляет комментарий к задаче. Можно призвать пользователей через summonees.", paramShemas_1.addCommentParamsSchema.shape, this.addCommentToolCallback.bind(this));
        // getCommentsTool - получение комментариев
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getComments, "Получает список комментариев к задаче.", paramShemas_1.getCommentsParamsSchema.shape, this.getCommentsToolCallback.bind(this));
        // getTransitionsTool - получение переходов
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getTransitions, "Получает список доступных переходов (смен статуса) для задачи.", paramShemas_1.getTransitionsParamsSchema.shape, this.getTransitionsToolCallback.bind(this));
        // transitionIssueTool - выполнение перехода
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.transitionIssue, "Выполняет переход задачи в другой статус. Сначала используйте getTransitions для получения доступных переходов.", paramShemas_1.transitionIssueParamsSchema.shape, this.transitionIssueToolCallback.bind(this));
        // linkIssueTool - создание связи между задачами
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.linkIssue, "Создает связь между задачами. Типы связей: 'relates' (связана), 'depends on' (зависит от/блокер), 'is dependent by' (блокирует), 'duplicates' (дублирует), 'is subtask for' (подзадача), 'is parent task for' (родительская).", paramShemas_1.linkIssueParamsSchema.shape, this.linkIssueToolCallback.bind(this));
        // getLinksTool - получение связей задачи
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getLinks, "Получает список всех связей задачи (блокеры, связанные задачи, дубликаты и т.д.).", paramShemas_1.getLinksParamsSchema.shape, this.getLinksToolCallback.bind(this));
        // deleteLinkTool - удаление связи
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.deleteLink, "Удаляет связь между задачами. Сначала используйте getLinks для получения ID связи.", paramShemas_1.deleteLinkParamsSchema.shape, this.deleteLinkToolCallback.bind(this));
        // deleteIssueTool - удаление задачи
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.deleteIssue, "Удаляет задачу из Яндекс.Трекера. ВНИМАНИЕ: Операция необратима! Задача будет удалена безвозвратно.", paramShemas_1.deleteIssueParamsSchema.shape, this.deleteIssueToolCallback.bind(this));
        // moveIssueTool - перенос задачи в другую очередь
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.moveIssue, "Переносит задачу в другую очередь. Можно сохранить компоненты/версии/проекты или сбросить статус в начальное значение.", paramShemas_1.moveIssueParamsSchema.shape, this.moveIssueToolCallback.bind(this));
        // attachFileToIssueTool - прикрепление файла к задаче
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.attachFileToIssue, "Прикрепляет файл (например, изображение) к задаче в Яндекс.Трекере. Файл должен быть передан в формате base64.", paramShemas_1.attachFileToIssueParamsSchema.shape, this.attachFileToIssueToolCallback.bind(this));
        // getIssueAttachmentsTool - получение списка вложений задачи
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.getIssueAttachments, "Получает список всех прикрепленных файлов к задаче.", paramShemas_1.getIssueAttachmentsParamsSchema.shape, this.getIssueAttachmentsToolCallback.bind(this));
        // deleteIssueAttachmentTool - удаление вложения
        this.mcpServer.tool(YandexTrackerToolName_1.YandexTrackerToolName.deleteIssueAttachment, "Удаляет прикрепленный файл из задачи. Сначала используйте getIssueAttachments для получения ID вложения.", paramShemas_1.deleteIssueAttachmentParamsSchema.shape, this.deleteIssueAttachmentToolCallback.bind(this));
        // ==================== ЯНДЕКС ВИКИ ====================
        // getWikiPageTool - получение страницы по slug
        this.mcpServer.tool(YandexWikiToolName_1.YandexWikiToolName.getWikiPage, "Получает страницу Яндекс Вики по её пути (slug). Можно запросить дополнительные поля: content, attributes, breadcrumbs.", wikiParamSchemas_1.getWikiPageParamsSchema.shape, this.getWikiPageToolCallback.bind(this));
        // getWikiPageByIdTool - получение страницы по ID
        this.mcpServer.tool(YandexWikiToolName_1.YandexWikiToolName.getWikiPageById, "Получает страницу Яндекс Вики по её ID.", wikiParamSchemas_1.getWikiPageByIdParamsSchema.shape, this.getWikiPageByIdToolCallback.bind(this));
        // createWikiPageTool - создание страницы
        this.mcpServer.tool(YandexWikiToolName_1.YandexWikiToolName.createWikiPage, "Создает новую страницу в Яндекс Вики. Контент поддерживает Markdown и Wikitext разметку.", wikiParamSchemas_1.createWikiPageParamsSchema.shape, this.createWikiPageToolCallback.bind(this));
        // updateWikiPageTool - обновление страницы
        this.mcpServer.tool(YandexWikiToolName_1.YandexWikiToolName.updateWikiPage, "Обновляет существующую страницу Яндекс Вики (заголовок и/или контент).", wikiParamSchemas_1.updateWikiPageParamsSchema.shape, this.updateWikiPageToolCallback.bind(this));
        // deleteWikiPageTool - удаление страницы
        this.mcpServer.tool(YandexWikiToolName_1.YandexWikiToolName.deleteWikiPage, "Удаляет страницу Яндекс Вики. Возвращает токен для восстановления.", wikiParamSchemas_1.deleteWikiPageParamsSchema.shape, this.deleteWikiPageToolCallback.bind(this));
        // appendWikiContentTool - добавление контента
        this.mcpServer.tool(YandexWikiToolName_1.YandexWikiToolName.appendWikiContent, "Добавляет контент в конец существующей страницы Яндекс Вики.", wikiParamSchemas_1.appendWikiContentParamsSchema.shape, this.appendWikiContentToolCallback.bind(this));
        // uploadWikiFileTool - загрузка файла на Wiki страницу
        this.mcpServer.tool(YandexWikiToolName_1.YandexWikiToolName.uploadWikiFile, "Загружает файл (например, изображение или документ) на страницу Яндекс Вики. Файл должен быть передан в формате base64.", wikiParamSchemas_1.uploadWikiFileParamsSchema.shape, this.uploadWikiFileToolCallback.bind(this));
        // getWikiFilesTool - получение списка файлов Wiki страницы
        this.mcpServer.tool(YandexWikiToolName_1.YandexWikiToolName.getWikiFiles, "Получает список всех файлов, прикрепленных к странице Яндекс Вики.", wikiParamSchemas_1.getWikiFilesParamsSchema.shape, this.getWikiFilesToolCallback.bind(this));
        // deleteWikiFileTool - удаление файла с Wiki страницы
        this.mcpServer.tool(YandexWikiToolName_1.YandexWikiToolName.deleteWikiFile, "Удаляет файл со страницы Яндекс Вики. Сначала используйте getWikiFiles для получения ID файла.", wikiParamSchemas_1.deleteWikiFileParamsSchema.shape, this.deleteWikiFileToolCallback.bind(this));
    }
    /*__________________PROMPTS__________________ */
    // callback для промпта - поиск задач
    async searchIssuePromptCallBack(_args, _extra) {
        try {
            const response = `
        Найди мне ${_args.issueCount} задач 
        в очереди ${_args.queueKey} 
        которые имеют статус ${_args.status} 
        а также приоритет ${_args.priority} 
        с типом задачи ${_args.issueType} 
        и исполнителем ${_args.name}.
      `;
            return super.receivePromptResult(response);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для промпта - краткое изложение задачи
    async getTaskSummaryPromptCallBack(_args, _extra) {
        try {
            const response = `
        Суть задачи: ${_args.issueKey}
      `;
            return super.receivePromptResult(response);
        }
        catch (error) {
            throw error;
        }
    }
    /*__________________RESOURCES__________________ */
    /*__________________TOOLS__________________ */
    // callback для получения всех пользователей
    async getUsersToolCallback(args, extra) {
        try {
            const response = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().getUsers();
            return super.receiveCallToolResult(response);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения документации по языку запросов Yandex Tracker
    async getYandexQueryDocToolCallback(args, extra) {
        try {
            // Чтение файла query_params.json
            const queryFieldsJson = await fs.readFile(`${config_1.config.MODEL_DESCRIPTION_BASE_PATH}${ModelDescriptionName_1.ModelDescriptionName.query_params}`, "utf-8");
            // Чтение файла searchhowto.txt
            const howToSearchText = await fs.readFile(`${config_1.config.MODEL_DESCRIPTION_BASE_PATH}${ModelDescriptionName_1.ModelDescriptionName.howToSearchInfo}`, "utf-8");
            const queryFieldsData = await JSON.parse(queryFieldsJson);
            const queryDocData = {
                ...queryFieldsData,
                howToUseSearch: howToSearchText,
            };
            return super.receiveCallToolResult(queryDocData);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения полей пользователя с их описанием
    async getUserFieldsToolCallback(args, extra) {
        try {
            // Чтение файла user.json
            const issueFields = await fs.readFile(`${config_1.config.MODEL_DESCRIPTION_BASE_PATH}${ModelDescriptionName_1.ModelDescriptionName.user}`, "utf-8");
            const issueFieldsData = await JSON.parse(issueFields);
            return super.receiveCallToolResult(issueFieldsData);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения полей очереди с их описанием
    async getQueueFieldsToolCallback(args, extra) {
        try {
            // Чтение файла queue.json
            const issueFields = await fs.readFile(`${config_1.config.MODEL_DESCRIPTION_BASE_PATH}${ModelDescriptionName_1.ModelDescriptionName.queue}`, "utf-8");
            const issueFieldsData = await JSON.parse(issueFields);
            return super.receiveCallToolResult(issueFieldsData);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения полей задачи с их описанием
    async getIssueFieldsToolCallback(args, extra) {
        try {
            // Чтение файла issue.json
            const issueFields = await fs.readFile(`${config_1.config.MODEL_DESCRIPTION_BASE_PATH}${ModelDescriptionName_1.ModelDescriptionName.issue}`, "utf-8");
            const issueFieldsData = await JSON.parse(issueFields);
            return super.receiveCallToolResult(issueFieldsData);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения типов статусов задач
    async getIssueStatusTypesToolCallback(args, extra) {
        try {
            const response = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().getStatuses();
            return super.receiveCallToolResult(response);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения типов приоритетов задач
    async getIssuePriorityTypesToolCallback(args, extra) {
        try {
            const response = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().getPriorities();
            return super.receiveCallToolResult(response);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения типов задач
    async getIssueTypesToolCallback(args, extra) {
        try {
            const response = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().getIssueTypes();
            return super.receiveCallToolResult(response);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения списка доступных очередей
    async getQueuesToolCallback(args, // Типизируем args на основе схемы
    extra) {
        try {
            const queues = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().getQueues({
                expand: args.expand,
            });
            return super.receiveCallToolResult(queues);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения данных о текущем пользователе
    async getMySelfToolCallback(args, extra) {
        try {
            const response = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().getMyself();
            return super.receiveCallToolResult(response);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для инструмента получения задачи по key
    async getIssueToolCallback(args, // Типизируем args на основе схемы
    extra) {
        try {
            // Получаем задачу по ключу
            const issue = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().getIssue(args.issueKey);
            return super.receiveCallToolResult(issue);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для инструмента получения user по key или id
    async getUserToolCallback(args, // Типизируем args на основе схемы
    extra) {
        try {
            const user = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().getUser(args.key);
            return super.receiveCallToolResult(user);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для инструмента поиска задач через filter
    async searchIssueByFilterToolCallback(args, // Типизируем args на основе схемы
    extra) {
        try {
            const issueArray = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().searchIssueByFilter(args.filter, args?.order, args.perPage, args.page);
            return super.receiveCallToolResult(issueArray);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для инструмента поиска задач через query
    async searchIssueByQueryToolCallback(args, // Типизируем args на основе схемы
    extra) {
        try {
            const issueArray = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().searchIssueByQuery(args.query, args.isSimple, args.perPage, args.page);
            const responseData = {
                issueArray,
                countOfIssues: issueArray.length
            };
            return super.receiveCallToolResult(responseData);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для создания задачи
    async createIssueToolCallback(args, extra) {
        try {
            const issue = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().createIssue({
                queue: args.queue,
                summary: args.summary,
                description: args.description,
                type: args.type,
                priority: args.priority,
                assignee: args.assignee,
                parent: args.parent,
                followers: args.followers,
                tags: args.tags,
                sprint: args.sprint,
                storyPoints: args.storyPoints,
            });
            return super.receiveCallToolResult(issue);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для редактирования задачи
    async updateIssueToolCallback(args, extra) {
        try {
            const updateParams = {};
            if (args.summary !== undefined)
                updateParams.summary = args.summary;
            if (args.description !== undefined)
                updateParams.description = args.description;
            if (args.type !== undefined)
                updateParams.type = args.type;
            if (args.priority !== undefined)
                updateParams.priority = args.priority;
            if (args.assignee !== undefined)
                updateParams.assignee = args.assignee;
            if (args.parent !== undefined)
                updateParams.parent = args.parent;
            if (args.queue !== undefined)
                updateParams.queue = args.queue;
            if (args.storyPoints !== undefined)
                updateParams.storyPoints = args.storyPoints;
            // Обработка тегов
            if (args.addTags || args.removeTags) {
                updateParams.tags = {};
                if (args.addTags)
                    updateParams.tags.add = args.addTags;
                if (args.removeTags)
                    updateParams.tags.remove = args.removeTags;
            }
            // Обработка наблюдателей
            if (args.addFollowers || args.removeFollowers) {
                updateParams.followers = {};
                if (args.addFollowers)
                    updateParams.followers.add = args.addFollowers;
                if (args.removeFollowers)
                    updateParams.followers.remove = args.removeFollowers;
            }
            const issue = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().updateIssue(args.issueKey, updateParams);
            return super.receiveCallToolResult(issue);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для добавления комментария
    async addCommentToolCallback(args, extra) {
        try {
            const comment = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().addComment(args.issueKey, args.text, args.summonees);
            return super.receiveCallToolResult(comment);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения комментариев
    async getCommentsToolCallback(args, extra) {
        try {
            const comments = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().getComments(args.issueKey, args.perPage);
            return super.receiveCallToolResult(comments);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения доступных переходов
    async getTransitionsToolCallback(args, extra) {
        try {
            const transitions = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().getTransitions(args.issueKey);
            return super.receiveCallToolResult(transitions);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для выполнения перехода в статус
    async transitionIssueToolCallback(args, extra) {
        try {
            const result = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().transitionIssue(args.issueKey, args.transitionId, args.comment);
            return super.receiveCallToolResult(result);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для создания связи между задачами
    async linkIssueToolCallback(args, extra) {
        try {
            const result = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().linkIssue(args.issueKey, args.relationship, args.linkedIssue);
            return super.receiveCallToolResult(result);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения связей задачи
    async getLinksToolCallback(args, extra) {
        try {
            const links = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().getLinks(args.issueKey);
            return super.receiveCallToolResult(links);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для удаления связи
    async deleteLinkToolCallback(args, extra) {
        try {
            const result = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().deleteLink(args.issueKey, args.linkId);
            return super.receiveCallToolResult(result);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для удаления задачи
    async deleteIssueToolCallback(args, extra) {
        try {
            const result = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().deleteIssue(args.issueKey);
            return super.receiveCallToolResult(result);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для переноса задачи в другую очередь
    async moveIssueToolCallback(args, extra) {
        try {
            const issue = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().moveIssue(args.issueKey, args.queue, args.moveAllFields, args.initialStatus);
            return super.receiveCallToolResult(issue);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для прикрепления файла к задаче
    async attachFileToIssueToolCallback(args, extra) {
        try {
            const result = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().attachFile(args.issueKey, args.fileContent, args.fileName);
            return super.receiveCallToolResult(result);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения списка вложений задачи
    async getIssueAttachmentsToolCallback(args, extra) {
        try {
            const attachments = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().getAttachments(args.issueKey);
            return super.receiveCallToolResult(attachments);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для удаления вложения из задачи
    async deleteIssueAttachmentToolCallback(args, extra) {
        try {
            const result = await YandexTrackerAPI_1.YandexTrackerAPI.getInstance().deleteAttachment(args.issueKey, args.attachmentId);
            return super.receiveCallToolResult(result);
        }
        catch (error) {
            throw error;
        }
    }
    // ==================== ЯНДЕКС ВИКИ CALLBACKS ====================
    // callback для получения страницы по slug
    async getWikiPageToolCallback(args, extra) {
        try {
            const page = await YandexWikiAPI_1.YandexWikiAPI.getInstance().getPage(args.slug, args.fields);
            return super.receiveCallToolResult(page);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения страницы по ID
    async getWikiPageByIdToolCallback(args, extra) {
        try {
            const page = await YandexWikiAPI_1.YandexWikiAPI.getInstance().getPageById(args.pageId, args.fields);
            return super.receiveCallToolResult(page);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для создания страницы Wiki
    async createWikiPageToolCallback(args, extra) {
        try {
            const page = await YandexWikiAPI_1.YandexWikiAPI.getInstance().createPage({
                slug: args.slug,
                title: args.title,
                page_type: args.page_type,
                content: args.content,
            });
            return super.receiveCallToolResult(page);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для обновления страницы Wiki
    async updateWikiPageToolCallback(args, extra) {
        try {
            const page = await YandexWikiAPI_1.YandexWikiAPI.getInstance().updatePage(args.pageId, {
                title: args.title,
                content: args.content,
            });
            return super.receiveCallToolResult(page);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для удаления страницы Wiki
    async deleteWikiPageToolCallback(args, extra) {
        try {
            const result = await YandexWikiAPI_1.YandexWikiAPI.getInstance().deletePage(args.pageId);
            return super.receiveCallToolResult(result);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для добавления контента к странице
    async appendWikiContentToolCallback(args, extra) {
        try {
            const page = await YandexWikiAPI_1.YandexWikiAPI.getInstance().appendContent(args.pageId, args.content);
            return super.receiveCallToolResult(page);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для загрузки файла на Wiki страницу
    async uploadWikiFileToolCallback(args, extra) {
        try {
            const result = await YandexWikiAPI_1.YandexWikiAPI.getInstance().uploadFile(args.pageId, args.fileContent, args.fileName);
            return super.receiveCallToolResult(result);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для получения списка файлов Wiki страницы
    async getWikiFilesToolCallback(args, extra) {
        try {
            const files = await YandexWikiAPI_1.YandexWikiAPI.getInstance().getFiles(args.pageId);
            return super.receiveCallToolResult(files);
        }
        catch (error) {
            throw error;
        }
    }
    // callback для удаления файла с Wiki страницы
    async deleteWikiFileToolCallback(args, extra) {
        try {
            const result = await YandexWikiAPI_1.YandexWikiAPI.getInstance().deleteFile(args.pageId, args.fileId);
            return super.receiveCallToolResult(result);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.YandexTrackerMcpServer = YandexTrackerMcpServer;
//# sourceMappingURL=YandexTrackerMcpServer.js.map