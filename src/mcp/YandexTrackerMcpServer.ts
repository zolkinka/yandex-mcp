import { YandexMcpServer } from "./YandexMcpServer";
import { YandexTrackerToolName } from "../enums/YandexTrackerToolName";
import { z } from "zod";
import { YandexTrackerAPI } from "../yandex_api/YandexTrackerAPI";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import { CallToolResult, GetPromptResult, ReadResourceResult, ServerNotification, ServerRequest } from "@modelcontextprotocol/sdk/types";
import { 
  getIssueParamsSchema, 
  getQueuesParamsSchema, 
  getUserParamsSchema, 
  searchIssueByFilterParamsSchema, 
  searchIssueByQueryParamsShema,
  createIssueParamsSchema,
  updateIssueParamsSchema,
  addCommentParamsSchema,
  getCommentsParamsSchema,
  transitionIssueParamsSchema,
  getTransitionsParamsSchema,
  linkIssueParamsSchema,
  getLinksParamsSchema,
  deleteLinkParamsSchema
} from "../models/paramShemas";
import { Issue } from "../models/issue";
import { SimpleUser, User } from "../models/user";
import { Queue } from "../models/queue";
import { ReadResourceCallback } from "@modelcontextprotocol/sdk/server/mcp";
import { YandexTrackerResourceName } from "../enums/YandexTrackerResourceName";
import { config } from "../settings/config";
import { YandexTrackerResourceUri } from "../enums/YandexTrackerResourceUri";
import { YandexTrackerPromptName } from "../enums/YandexTrackerPromptName";
import { IssueType, Priority, Status } from "../models/baseSchemas";
import * as fs from "fs/promises"
import { ModelDescriptionName } from "../enums/ModelDescriptionName";

export class YandexTrackerMcpServer extends YandexMcpServer {
  /**
   * колим контруктор суперкласса
   */
  constructor(name: string, version: string) {
    super(name, version);
    this.addResources();
    this.addPrompts();
    this.addTools();
  }

  // регистрируем все MCP prompts связанные с Yandex Tracker
  protected addPrompts(): void {
    this.mcpServer.prompt(
      YandexTrackerPromptName.taskSummary,
      "Краткое изложение задачи: суть задачи, статус, приоритет, исполнитель",
      { issueKey: z.string().describe("Ключ задачи") },
      this.getTaskSummaryPromptCallBack.bind(this)
    );

    this.mcpServer.prompt(
      YandexTrackerPromptName.searchIssue,
      "Поиск задач по основным полям",
      {
        issueCount: z
          .string()
          .regex(/^[1-9]\d*$/, {
            message: "Должно быть целое число больше нуля",
          })
          .describe("Кол-во задач"),
        queueKey: z.string().describe("Ключ очереди"),
        status: z.string().describe("Статус задачи"),
        priority: z.string().describe("Приоритет задачи"),
        issueType: z.string().describe("Тип задачи"),
        name: z.string().describe("Имя и Фамилия исполнителя"),
      },
      this.searchIssuePromptCallBack.bind(this)
    );
  }

  // регистрируем все MCP resources связанные с Yandex Tracker
  protected addResources(): void {
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
  protected addTools(): void {
    // getUsersTool
    this.mcpServer.tool(
      YandexTrackerToolName.getUsers,
      "Получает всех пользователей трекера",
      {},
      this.getUsersToolCallback
    );

    // getUserFieldsTool
    this.mcpServer.tool(
      YandexTrackerToolName.getUserFields,
      "Получает все поля пользователя с их описанием",
      {},
      this.getUserFieldsToolCallback
    );

    // getQueueFieldsTool
    this.mcpServer.tool(
      YandexTrackerToolName.getQueueFields,
      "Получает все поля очереди с их описанием",
      {},
      this.getQueueFieldsToolCallback
    );

    // getIssueFieldsTool
    this.mcpServer.tool(
      YandexTrackerToolName.getIssueFields,
      "Получает все поля задачи с их описанием",
      {},
      this.getIssueFieldsToolCallback
    );

    // getIssueStatusTypesTool
    this.mcpServer.tool(
      YandexTrackerToolName.getIssueStatusTypes,
      "Получает все типы статусов для задач, которые есть в яндекс трекере",
      {},
      this.getIssueStatusTypesToolCallback
    );

    // getIssuePriorityTypesTool
    this.mcpServer.tool(
      YandexTrackerToolName.getIssuePriorityTypes,
      "Получает все типы приоритетов для задач, которые есть в яндекс трекере",
      {},
      this.getIssuePriorityTypesToolCallback
    );

    // getIssueTypesTool
    this.mcpServer.tool(
      YandexTrackerToolName.getIssueTypes,
      "Получает все типы задач, которые есть в яндекс трекере",
      {},
      this.getIssueTypesToolCallback
    );

    // getYandexQueryDocTool
    this.mcpServer.tool(
      YandexTrackerToolName.getYandexQueryDoc,
      "getYandexQueryDocTool - получает всю необходимую информацию для выполнения корретного поиска задач.",
      {},
      this.getYandexQueryDocToolCallback
    );

    // searchIssueByQueryTool
    this.mcpServer.tool(
      YandexTrackerToolName.searchIssueByQuery,
      `
        Если пользовотель не указал perPage или page, то ничего от себя не придумывай и не добавляй эти параметры в запрос.
        Перед поиском задачи по запросу, сначала вызови инструмент "getYandexQueryDocTool", чтобы получить необходимые параметры для поиска. 
        Только после этого используй "searchIssueByQueryTool". Поиск задачи по любым параметрам с использованием языка запросов Yandex tracker.
        Позволяет получить список задач, удовлетворяющих запросу. Если выгружается больше 3 задач использовать формат простых задач, параметр isSimple=true
        Возвращает: issueArray - массив задач, countOfIssues - количсетво задач в массиве.
      `,
      searchIssueByQueryParamsShema.shape,
      this.searchIssueByQueryToolCallback.bind(this)
    );

    // getQueuesTool
    this.mcpServer.tool(
      YandexTrackerToolName.getQueues,
      "Получения списка доступных очередей",
      getQueuesParamsSchema.shape,
      this.getQueuesToolCallback.bind(this)
    );

    // getMySelfTool
    this.mcpServer.tool(
      YandexTrackerToolName.getMySelf,
      "Получает информацию о текущем пользователе",
      {},
      this.getMySelfToolCallback
    );

    // getIssueTool
    this.mcpServer.tool(
      YandexTrackerToolName.getIssue,
      "Получает информацию о задаче по ее id или key",
      getIssueParamsSchema.shape,
      this.getIssueToolCallback.bind(this)
    );

    // getUserTool
    this.mcpServer.tool(
      YandexTrackerToolName.getUser,
      "Получает ползователя по id или login",
      getUserParamsSchema.shape,
      this.getUserToolCallback.bind(this)
    );

    // createIssueTool - создание новой задачи
    this.mcpServer.tool(
      YandexTrackerToolName.createIssue,
      "Создает новую задачу в Yandex Tracker. Обязательные поля: queue (ключ очереди) и summary (название).",
      createIssueParamsSchema.shape,
      this.createIssueToolCallback.bind(this)
    );

    // updateIssueTool - редактирование задачи
    this.mcpServer.tool(
      YandexTrackerToolName.updateIssue,
      "Редактирует существующую задачу в Yandex Tracker. Можно изменить название, описание, приоритет, исполнителя, теги и т.д.",
      updateIssueParamsSchema.shape,
      this.updateIssueToolCallback.bind(this)
    );

    // addCommentTool - добавление комментария
    this.mcpServer.tool(
      YandexTrackerToolName.addComment,
      "Добавляет комментарий к задаче. Можно призвать пользователей через summonees.",
      addCommentParamsSchema.shape,
      this.addCommentToolCallback.bind(this)
    );

    // getCommentsTool - получение комментариев
    this.mcpServer.tool(
      YandexTrackerToolName.getComments,
      "Получает список комментариев к задаче.",
      getCommentsParamsSchema.shape,
      this.getCommentsToolCallback.bind(this)
    );

    // getTransitionsTool - получение переходов
    this.mcpServer.tool(
      YandexTrackerToolName.getTransitions,
      "Получает список доступных переходов (смен статуса) для задачи.",
      getTransitionsParamsSchema.shape,
      this.getTransitionsToolCallback.bind(this)
    );

    // transitionIssueTool - выполнение перехода
    this.mcpServer.tool(
      YandexTrackerToolName.transitionIssue,
      "Выполняет переход задачи в другой статус. Сначала используйте getTransitions для получения доступных переходов.",
      transitionIssueParamsSchema.shape,
      this.transitionIssueToolCallback.bind(this)
    );

    // linkIssueTool - создание связи между задачами
    this.mcpServer.tool(
      YandexTrackerToolName.linkIssue,
      "Создает связь между задачами. Типы связей: 'relates' (связана), 'depends on' (зависит от/блокер), 'is dependent by' (блокирует), 'duplicates' (дублирует), 'is subtask for' (подзадача), 'is parent task for' (родительская).",
      linkIssueParamsSchema.shape,
      this.linkIssueToolCallback.bind(this)
    );

    // getLinksTool - получение связей задачи
    this.mcpServer.tool(
      YandexTrackerToolName.getLinks,
      "Получает список всех связей задачи (блокеры, связанные задачи, дубликаты и т.д.).",
      getLinksParamsSchema.shape,
      this.getLinksToolCallback.bind(this)
    );

    // deleteLinkTool - удаление связи
    this.mcpServer.tool(
      YandexTrackerToolName.deleteLink,
      "Удаляет связь между задачами. Сначала используйте getLinks для получения ID связи.",
      deleteLinkParamsSchema.shape,
      this.deleteLinkToolCallback.bind(this)
    );
  }

  /*__________________PROMPTS__________________ */

  // callback для промпта - поиск задач
  private async searchIssuePromptCallBack(
    _args: {
      issueCount: string;
      queueKey: string;
      status: string;
      priority: string;
      issueType: string;
      name: string;
    },
    _extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<GetPromptResult> {
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
    } catch (error) {
      throw error;
    }
  }

  // callback для промпта - краткое изложение задачи
  private async getTaskSummaryPromptCallBack(
    _args: { issueKey: string },
    _extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<GetPromptResult> {
    try {
      const response = `
        Суть задачи: ${_args.issueKey}
      `;
      return super.receivePromptResult(response);
    } catch (error) {
      throw error;
    }
  }

  /*__________________RESOURCES__________________ */

  /*__________________TOOLS__________________ */

  // callback для получения всех пользователей
  private async getUsersToolCallback(
    args: {},
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const response: SimpleUser[] =
        await YandexTrackerAPI.getInstance().getUsers();
      return super.receiveCallToolResult<SimpleUser[]>(response);
    } catch (error) {
      throw error;
    }
  }

  // callback для получения документации по языку запросов Yandex Tracker
  private async getYandexQueryDocToolCallback(
    args: {},
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      // Чтение файла query_params.json
      const queryFieldsJson = await fs.readFile(
        `${config.MODEL_DESCRIPTION_BASE_PATH}${ModelDescriptionName.query_params}`,
        "utf-8"
      );
      // Чтение файла searchhowto.txt
      const howToSearchText = await fs.readFile(
        `${config.MODEL_DESCRIPTION_BASE_PATH}${ModelDescriptionName.howToSearchInfo}`,
        "utf-8"
      );

      const queryFieldsData = await JSON.parse(queryFieldsJson);
      const queryDocData = {
        ...queryFieldsData,
        howToUseSearch: howToSearchText,
      };

      return super.receiveCallToolResult<object>(queryDocData);
    } catch (error) {
      throw error;
    }
  }

  // callback для получения полей пользователя с их описанием
  private async getUserFieldsToolCallback(
    args: {},
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      // Чтение файла user.json
      const issueFields = await fs.readFile(
        `${config.MODEL_DESCRIPTION_BASE_PATH}${ModelDescriptionName.user}`,
        "utf-8"
      );
      const issueFieldsData: object[] = await JSON.parse(issueFields);
      return super.receiveCallToolResult<object[]>(issueFieldsData);
    } catch (error) {
      throw error;
    }
  }

  // callback для получения полей очереди с их описанием
  private async getQueueFieldsToolCallback(
    args: {},
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      // Чтение файла queue.json
      const issueFields = await fs.readFile(
        `${config.MODEL_DESCRIPTION_BASE_PATH}${ModelDescriptionName.queue}`,
        "utf-8"
      );
      const issueFieldsData: object[] = await JSON.parse(issueFields);
      return super.receiveCallToolResult<object[]>(issueFieldsData);
    } catch (error) {
      throw error;
    }
  }

  // callback для получения полей задачи с их описанием
  private async getIssueFieldsToolCallback(
    args: {},
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      // Чтение файла issue.json
      const issueFields = await fs.readFile(
        `${config.MODEL_DESCRIPTION_BASE_PATH}${ModelDescriptionName.issue}`,
        "utf-8"
      );
      const issueFieldsData: object[] = await JSON.parse(issueFields);
      return super.receiveCallToolResult<object[]>(issueFieldsData);
    } catch (error) {
      throw error;
    }
  }

  // callback для получения типов статусов задач
  private async getIssueStatusTypesToolCallback(
    args: {},
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const response: Status[] =
        await YandexTrackerAPI.getInstance().getStatuses();
      return super.receiveCallToolResult<Status[]>(response);
    } catch (error) {
      throw error;
    }
  }

  // callback для получения типов приоритетов задач
  private async getIssuePriorityTypesToolCallback(
    args: {},
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const response: Priority[] =
        await YandexTrackerAPI.getInstance().getPriorities();
      return super.receiveCallToolResult<Priority[]>(response);
    } catch (error) {
      throw error;
    }
  }

  // callback для получения типов задач
  private async getIssueTypesToolCallback(
    args: {},
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const response: IssueType[] =
        await YandexTrackerAPI.getInstance().getIssueTypes();
      return super.receiveCallToolResult<IssueType[]>(response);
    } catch (error) {
      throw error;
    }
  }

  // callback для получения списка доступных очередей
  private async getQueuesToolCallback(
    args: z.infer<typeof getQueuesParamsSchema>, // Типизируем args на основе схемы
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const queues: Queue[] = await YandexTrackerAPI.getInstance().getQueues({
        expand: args.expand,
      });
      return super.receiveCallToolResult<Queue[]>(queues);
    } catch (error) {
      throw error;
    }
  }

  // callback для получения данных о текущем пользователе
  private async getMySelfToolCallback(
    args: {},
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const response: User = await YandexTrackerAPI.getInstance().getMyself();
      return super.receiveCallToolResult<User>(response);
    } catch (error) {
      throw error;
    }
  }

  // callback для инструмента получения задачи по key
  private async getIssueToolCallback(
    args: z.infer<typeof getIssueParamsSchema>, // Типизируем args на основе схемы
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      // Получаем задачу по ключу
      const issue: Issue = await YandexTrackerAPI.getInstance().getIssue(
        args.issueKey
      );
      return super.receiveCallToolResult<Issue>(issue);
    } catch (error) {
      throw error;
    }
  }

  // callback для инструмента получения user по key или id
  private async getUserToolCallback(
    args: z.infer<typeof getUserParamsSchema>, // Типизируем args на основе схемы
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const user: User = await YandexTrackerAPI.getInstance().getUser(args.key);
      return super.receiveCallToolResult<User>(user);
    } catch (error) {
      throw error;
    }
  }

  // callback для инструмента поиска задач через filter
  private async searchIssueByFilterToolCallback(
    args: z.infer<typeof searchIssueByFilterParamsSchema>, // Типизируем args на основе схемы
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const issueArray: Issue[] =
        await YandexTrackerAPI.getInstance().searchIssueByFilter(
          args.filter,
          args?.order,
          args.perPage,
          args.page
        );
      return super.receiveCallToolResult<Issue[]>(issueArray);
    } catch (error) {
      throw error;
    }
  }

  // callback для инструмента поиска задач через query
  private async searchIssueByQueryToolCallback(
    args: z.infer<typeof searchIssueByQueryParamsShema>, // Типизируем args на основе схемы
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const issueArray: Issue[] =
        await YandexTrackerAPI.getInstance().searchIssueByQuery(
          args.query,
          args.isSimple,
          args.perPage,
          args.page
        );
      const responseData = {
        issueArray,
        countOfIssues: issueArray.length
      }
      return super.receiveCallToolResult<object>(responseData);
    } catch (error) {
      throw error;
    }
  }

  // callback для создания задачи
  private async createIssueToolCallback(
    args: z.infer<typeof createIssueParamsSchema>,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const issue: Issue = await YandexTrackerAPI.getInstance().createIssue({
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
      });
      return super.receiveCallToolResult<Issue>(issue);
    } catch (error) {
      throw error;
    }
  }

  // callback для редактирования задачи
  private async updateIssueToolCallback(
    args: z.infer<typeof updateIssueParamsSchema>,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const updateParams: any = {};
      
      if (args.summary !== undefined) updateParams.summary = args.summary;
      if (args.description !== undefined) updateParams.description = args.description;
      if (args.type !== undefined) updateParams.type = args.type;
      if (args.priority !== undefined) updateParams.priority = args.priority;
      if (args.assignee !== undefined) updateParams.assignee = args.assignee;
      if (args.parent !== undefined) updateParams.parent = args.parent;
      
      // Обработка тегов
      if (args.addTags || args.removeTags) {
        updateParams.tags = {};
        if (args.addTags) updateParams.tags.add = args.addTags;
        if (args.removeTags) updateParams.tags.remove = args.removeTags;
      }
      
      // Обработка наблюдателей
      if (args.addFollowers || args.removeFollowers) {
        updateParams.followers = {};
        if (args.addFollowers) updateParams.followers.add = args.addFollowers;
        if (args.removeFollowers) updateParams.followers.remove = args.removeFollowers;
      }

      const issue: Issue = await YandexTrackerAPI.getInstance().updateIssue(
        args.issueKey,
        updateParams
      );
      return super.receiveCallToolResult<Issue>(issue);
    } catch (error) {
      throw error;
    }
  }

  // callback для добавления комментария
  private async addCommentToolCallback(
    args: z.infer<typeof addCommentParamsSchema>,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const comment = await YandexTrackerAPI.getInstance().addComment(
        args.issueKey,
        args.text,
        args.summonees
      );
      return super.receiveCallToolResult<any>(comment);
    } catch (error) {
      throw error;
    }
  }

  // callback для получения комментариев
  private async getCommentsToolCallback(
    args: z.infer<typeof getCommentsParamsSchema>,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const comments = await YandexTrackerAPI.getInstance().getComments(
        args.issueKey,
        args.perPage
      );
      return super.receiveCallToolResult<any[]>(comments);
    } catch (error) {
      throw error;
    }
  }

  // callback для получения доступных переходов
  private async getTransitionsToolCallback(
    args: z.infer<typeof getTransitionsParamsSchema>,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const transitions = await YandexTrackerAPI.getInstance().getTransitions(
        args.issueKey
      );
      return super.receiveCallToolResult<any[]>(transitions);
    } catch (error) {
      throw error;
    }
  }

  // callback для выполнения перехода в статус
  private async transitionIssueToolCallback(
    args: z.infer<typeof transitionIssueParamsSchema>,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const result = await YandexTrackerAPI.getInstance().transitionIssue(
        args.issueKey,
        args.transitionId,
        args.comment
      );
      return super.receiveCallToolResult<any>(result);
    } catch (error) {
      throw error;
    }
  }

  // callback для создания связи между задачами
  private async linkIssueToolCallback(
    args: z.infer<typeof linkIssueParamsSchema>,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const result = await YandexTrackerAPI.getInstance().linkIssue(
        args.issueKey,
        args.relationship,
        args.linkedIssue
      );
      return super.receiveCallToolResult<any>(result);
    } catch (error) {
      throw error;
    }
  }

  // callback для получения связей задачи
  private async getLinksToolCallback(
    args: z.infer<typeof getLinksParamsSchema>,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const links = await YandexTrackerAPI.getInstance().getLinks(
        args.issueKey
      );
      return super.receiveCallToolResult<any[]>(links);
    } catch (error) {
      throw error;
    }
  }

  // callback для удаления связи
  private async deleteLinkToolCallback(
    args: z.infer<typeof deleteLinkParamsSchema>,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): Promise<CallToolResult> {
    try {
      const result = await YandexTrackerAPI.getInstance().deleteLink(
        args.issueKey,
        args.linkId
      );
      return super.receiveCallToolResult<any>(result);
    } catch (error) {
      throw error;
    }
  }
}