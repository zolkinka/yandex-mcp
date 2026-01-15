import { logger } from "../settings/logger";
import {
  Issue,
  issueSchema,
  SimpleIssue,
  issueSchemaSimple,
} from "../models/issue";
import { config } from "../settings/config";
import { Tracker } from "yandex-tracker-client";
import { ExpandQueue, Queue, queueSchema } from "../models/queue";
import { userSchemaSimple, SimpleUser, userSchema, User } from "../models/user";
import {
  Priority,
  prioritySchema,
  IssueType,
  issueTypeSchema,
  Status,
  statusSchema,
} from "../models/baseSchemas";
import { response } from "express";
import FormData from "form-data";
import axios from "axios";
import { createFormattedError } from "../utils/errorFormatter";

// данный класс реализует паттерн singelton для доступа к API Yandex Tracker
export class YandexTrackerAPI {
  private readonly client: Tracker;
  private static instance: YandexTrackerAPI;

  /**
   * инициализация клиента для яндекс трекера
   * Поддерживает как X-Org-Id (Yandex 360), так и X-Cloud-Org-Id (Yandex Cloud)
   */
  private constructor() {
    // Если указан YANDEX_TRACKER_ORG_ID - используем X-Org-Id (для Yandex 360)
    // Если указан YANDEX_TRACKER_CLOUD_ORG_ID - используем X-Cloud-Org-Id (для Yandex Cloud)
    const orgId = config.YANDEX_TRACKER_ORG_ID;
    const cloudOrgId = config.YANDEX_TRACKER_CLOUD_ORG_ID;
    
    this.client = new Tracker(
      config.YANDEX_TRACKER_TOKEN,
      orgId,           // X-Org-Id для Yandex 360
      cloudOrgId,      // X-Cloud-Org-Id для Yandex Cloud
      config.YANDEX_TRACKER_BASE_URL,
      config.REQUEST_TIMEOUT
    );
  }

  /**
   * Статический метод для получения экземпляра
   * @returns {YandexTrackerAPI} - объект api яндекса
   */
  public static getInstance(): YandexTrackerAPI {
    if (!YandexTrackerAPI.instance) {
      try {
        logger.debug("Создание экземпляра YandexTrackerAPI");
        YandexTrackerAPI.instance = new YandexTrackerAPI();
      } catch (error) {
        logger.error("Не удалось создать экземпляр YandexTrackerAPI");
        throw error;
      }
    }
    return YandexTrackerAPI.instance;
  }

  public async get(path: string, params?: Record<string, any>): Promise<any> {
    try {
      const response = await this.client.get(path, params);
      logger.info({ path, params }, "GET");
      return response;
    } catch (error) {
      logger.error({ path, params, error }, "GET");
      throw createFormattedError(error, `GET ${path}`);
    }
  }

  public async post(path: string, data?: Record<string, any>): Promise<any> {
    try {
      const response = await this.client.post(path, data);
      logger.info({ status: response.status, path, data }, "POST");
      return response;
    } catch (error) {
      logger.error({ path, data, error }, "POST");
      throw createFormattedError(error, `POST ${path}`);
    }
  }

  public async patch(path: string, data?: Record<string, any>): Promise<any> {
    try {
      const response = await this.client.patch(path, data);
      logger.info({ path, data }, "PATCH");
      return response;
    } catch (error) {
      logger.error({ path, data, error }, "PATCH");
      throw createFormattedError(error, `PATCH ${path}`);
    }
  }

  /**
   * функция для тестирования get запросов
   *
   * @param {string} path не должен начинаться с /
   * @param {object} [params]
   * @return {*}  {Promise <any>}
   * @memberof YandexTrackerAPI
   */
  async manualGet(path: string, params?: object): Promise<any> {
    const response = await this.get(path, params);
    return response;
  }

  /**
   * Функция для тестирования post запросов
   *
   * @param {string} path
   * @param {object} [params]
   * @return {*}  {Promise<any>}
   * @memberof YandexTrackerAPI
   */
  async manualPost(path: string, params?: object): Promise<any> {
    const response = await this.post(path, params);
    return response;
  }

  /**
   * Получение данных о текущем пользователе
   *
   * @return {*}  {Promise<User>}
   * @memberof YandexTrackerAPI
   */
  async getMyself(): Promise<User> {
    try {
      const response = await this.get("myself");
      return userSchema.parse(response);
    } catch (error) {
      throw createFormattedError(error, "getMyself");
    }
  }

  /**
   * Получение всех существующих очередей
   *
   * @return {Promise<Queue[]>}
   * @memberof YandexTrackerAPI
   */
  async getQueues(options?: { expand?: ExpandQueue[] }): Promise<Queue[]> {
    try {
      const params: Record<string, string> = {};
      if (options?.expand) {
        params.expand = options.expand.join(",");
      }

      const response = await this.get("queues", params);
      return queueSchema.array().parse(response);
    } catch (error) {
      throw createFormattedError(error, "getQueues");
    }
  }

  /**
   * Получение очереди по ключу или id
   *
   * @param {(string | number)} queue_key - ключ (обязательно большими буквами) или id
   * @return {*}  {Promise<Queue>} - модель очереди
   * @memberof YandexTrackerAPI
   */
  async getQueue(queue_key: string | number): Promise<Queue> {
    try {
      const response = await this.get(`queues/${queue_key}`);
      return queueSchema.parse(response);
    } catch (error) {
      throw createFormattedError(error, `getQueue: ${queue_key}`);
    }
  }

  /**
   * Получение задачи по ключу или id
   * @param {string} issueKey ключ задачи или идентификатор
   * @returns {Promise<Issue>} - модель задачи
   */
  async getIssue(issueKey: string): Promise<Issue> {
    try {
      const response = await this.get(`issues/${issueKey}`);
      return issueSchema.parse(response);
    } catch (error) {
      throw createFormattedError(error, `getIssue: ${issueKey}`);
    }
  }

  /**
   * Простой поиск задачи по описанию.
   *
   * @param {string} input - Фрагмент текста для вывода списка задач.
   * Если между словами в тексте указан пробел, в выдачу также попадут результаты,
   * в которых есть любой текст на месте пробела.
   * @return {*}  {Promise<Issue[]>} возвращает упрощённую модель задачи
   * @memberof YandexTrackerAPI
   */
  async searchIssueSimple(input: string): Promise<Issue[]> {
    try {
      const response = await this.get("issues/_suggest", {
        input: input,
        full: true,
        fields: "summary",
      });
      return issueSchema.array().parse(response);
    } catch (error) {
      throw createFormattedError(error, "searchIssueSimple");
    }
  }

  /**
   * Поиск задачи по любым параметрам с использованием фильтра.
   * Позволяет получить список задач, удовлетворяющих заданному критерию.
   *
   * @param {Record<string, any>} filter
   * Параметры фильтрации задач. В параметре можно указать название
   * любого поля и значение, по которому будет производиться фильтрация
   * @param {string} order
   * Направление и поле сортировки задач.
   * Значение указывается в формате [+/-]<ключ_поля>.
   * Знак + или - обозначает направление сортировки.
   * @param {number} [perPage=50]
   * Количество задач на странице ответа. Значение по умолчанию — 50.
   * @param {number} [page=1]
   * Номер страницы. Значение по умолчанию — 1.
   * @return {*}  {Promise<Issue[]>}
   * @memberof YandexTrackerAPI
   */
  async searchIssueByFilter(
    filter: Record<string, any>,
    order?: string,
    perPage: number = 50,
    page: number = 1
  ): Promise<Issue[]> {
    const body = {
      filter,
      order,
    };

    try {
      const response = await this.post(
        `issues/_search?perPage=${perPage}&page=${page}`,
        body
      );
      return issueSchema.array().parse(response);
    } catch (error) {
      throw createFormattedError(error, "searchIssueByFilter");
    }
  }

  /**
   * Поиск задачи по любым параметрам с использованием языка запросов.
   * Позволяет получить список задач, удовлетворяющих запросу.
   *
   * @param {string} query
   * Запрос на языке запросов Яндекс Трекера
   * @param {boolean} [isSimple=false]
   * Простые ли задачи возвращать. При большом количестве задач использовать с True. Значение по умолчанию — false.
   * @param {number} [perPage=50]
   * Количество задач на странице ответа. Значение по умолчанию — 50.
   * @param {number} [page=1]
   * Номер страницы. Значение по умолчанию — 1.
   * @return {*}  {Promise<Issue[]>}
   * @memberof YandexTrackerAPI
   */
  async searchIssueByQuery(
    query: string,
    isSimple: boolean = true,
    perPage: number = 50,
    page: number = 1
  ): Promise<Issue[]> {
    try {
      const response = await this.post(
        `issues/_search?perPage=${perPage}&page=${page}`,
        { query }
      );
      if (isSimple) {
        return issueSchemaSimple.array().parse(response);
      }
      return issueSchema.array().parse(response);
    } catch (error) {
      throw createFormattedError(error, "searchIssueByQuery");
    }
  }

  /**
   * Получение всех пользователей
   *
   * @return {*}  {Promise<SimpleUser[]>}Список простых моделей пользователей (имя + id)
   * @memberof YandexTrackerAPI
   */
  async getUsers(): Promise<SimpleUser[]> {
    const response = await this.get("users");
    return userSchemaSimple.array().parse(response);
  }

  /**
   * Получение конкретного пользователя по id или login
   *
   * @param {number | string} key - id или login
   * @return {*}  {Promise<User>} - найденный пользователь
   * @memberof YandexTrackerAPI
   */
  async getUser(key: number | string): Promise<User> {
    const response = await this.get(`users/${key}`);
    return userSchema.parse(response);
  }

  /**
   * Получение списка приоритетов для задач
   *
   * @return {*}  {Promise<Priority[]>}
   * @memberof YandexTrackerAPI
   */
  async getPriorities(): Promise<Priority[]> {
    const response = await this.get("priorities");
    return prioritySchema.array().parse(response);
  }

  /**
   * Получение типов задач
   *
   * @return {*}  {Promise<IssueType[]>}
   * @memberof YandexTrackerAPI
   */
  async getIssueTypes(): Promise<IssueType[]> {
    const response = await this.get("issuetypes");
    return issueTypeSchema.array().parse(response);
  }

  /**
   * Получение статусов задач
   *
   * @return {*}  {Promise<Status[]>}
   * @memberof YandexTrackerAPI
   */
  async getStatuses(): Promise<Status[]> {
    const response = await this.get("statuses");
    return statusSchema.array().parse(response);
  }

  /**
   * Создание новой задачи
   * API: POST /v3/issues/
   *
   * @param {CreateIssueParams} params - Параметры создания задачи
   * @return {*}  {Promise<Issue>} - Созданная задача
   * @memberof YandexTrackerAPI
   */
  async createIssue(params: {
    queue: string;
    summary: string;
    description?: string;
    type?: string;
    priority?: string;
    assignee?: string;
    parent?: string;
    followers?: string[];
    tags?: string[];
    sprint?: string[];
    storyPoints?: number;
  }): Promise<Issue> {
    try {
      const body: Record<string, any> = {
        queue: params.queue,
        summary: params.summary,
      };

      if (params.description) body.description = params.description;
      if (params.type) body.type = params.type;
      if (params.priority) body.priority = params.priority;
      if (params.assignee) body.assignee = params.assignee;
      if (params.parent) body.parent = params.parent;
      if (params.followers) body.followers = params.followers;
      if (params.tags) body.tags = params.tags;
      if (params.sprint) body.sprint = params.sprint.map(id => ({ id }));
      if (params.storyPoints !== undefined) body.storyPoints = params.storyPoints;

      const response = await this.post("issues", body);
      return issueSchema.parse(response);
    } catch (error) {
      throw createFormattedError(error, "createIssue");
    }
  }

  /**
   * Редактирование существующей задачи
   * API: PATCH /v3/issues/<issue_key>
   *
   * @param {string} issueKey - Ключ задачи (например: TEST-123)
   * @param {UpdateIssueParams} params - Параметры для обновления
   * @return {*}  {Promise<Issue>} - Обновленная задача
   * @memberof YandexTrackerAPI
   */
  async updateIssue(
    issueKey: string,
    params: {
      summary?: string;
      description?: string;
      type?: string;
      priority?: string;
      assignee?: string | null;
      parent?: string;
      queue?: string;
      followers?: { add?: string[]; remove?: string[] };
      tags?: { add?: string[]; remove?: string[] } | string[];
      sprint?: { id: string }[];
      storyPoints?: number | null;
    }
  ): Promise<Issue> {
    try {
      const body: Record<string, any> = {};

      if (params.summary !== undefined) body.summary = params.summary;
      if (params.description !== undefined) body.description = params.description;
      if (params.type !== undefined) body.type = params.type;
      if (params.priority !== undefined) body.priority = params.priority;
      if (params.assignee !== undefined) body.assignee = params.assignee;
      if (params.parent !== undefined) body.parent = { key: params.parent };
      if (params.queue !== undefined) body.queue = params.queue;
      if (params.followers !== undefined) body.followers = params.followers;
      if (params.tags !== undefined) body.tags = params.tags;
      if (params.sprint !== undefined) body.sprint = params.sprint;
      if (params.storyPoints !== undefined) body.storyPoints = params.storyPoints;

      const response = await this.patch(`issues/${issueKey}`, body);
      return issueSchema.parse(response);
    } catch (error) {
      throw createFormattedError(error, `updateIssue: ${issueKey}`);
    }
  }

  /**
   * Получение доступных переходов для задачи
   * API: GET /v2/issues/<issue_key>/transitions
   *
   * @param {string} issueKey - Ключ задачи
   * @return {*}  {Promise<any[]>} - Список доступных переходов
   * @memberof YandexTrackerAPI
   */
  async getTransitions(issueKey: string): Promise<any[]> {
    try {
      const response = await this.get(`issues/${issueKey}/transitions`);
      return response;
    } catch (error) {
      throw createFormattedError(error, `getTransitions: ${issueKey}`);
    }
  }

  /**
   * Выполнить переход задачи в другой статус
   * API: POST /v2/issues/<issue_key>/transitions/<transition_id>/_execute
   *
   * @param {string} issueKey - Ключ задачи
   * @param {string} transitionId - ID перехода
   * @param {string} [comment] - Комментарий к переходу
   * @return {*}  {Promise<any>} - Результат перехода
   * @memberof YandexTrackerAPI
   */
  async transitionIssue(
    issueKey: string,
    transitionId: string,
    comment?: string
  ): Promise<any> {
    try {
      const body: Record<string, any> = {};
      if (comment) body.comment = comment;

      const response = await this.post(
        `issues/${issueKey}/transitions/${transitionId}/_execute`,
        body
      );
      return response;
    } catch (error) {
      throw createFormattedError(error, `transitionIssue: ${issueKey}`);
    }
  }

  /**
   * Добавление комментария к задаче
   * API: POST /v2/issues/<issue_key>/comments
   *
   * @param {string} issueKey - Ключ задачи
   * @param {string} text - Текст комментария
   * @param {string[]} [summonees] - Список логинов для призыва
   * @return {*}  {Promise<any>} - Созданный комментарий
   * @memberof YandexTrackerAPI
   */
  async addComment(
    issueKey: string,
    text: string,
    summonees?: string[]
  ): Promise<any> {
    try {
      const body: Record<string, any> = { text };
      if (summonees) body.summonees = summonees;

      const response = await this.post(`issues/${issueKey}/comments`, body);
      return response;
    } catch (error) {
      throw createFormattedError(error, `addComment: ${issueKey}`);
    }
  }

  /**
   * Получение комментариев задачи
   * API: GET /v2/issues/<issue_key>/comments
   *
   * @param {string} issueKey - Ключ задачи
   * @param {number} [perPage=50] - Количество комментариев на странице
   * @return {*}  {Promise<any[]>} - Список комментариев
   * @memberof YandexTrackerAPI
   */
  async getComments(issueKey: string, perPage: number = 50): Promise<any[]> {
    try {
      const response = await this.get(`issues/${issueKey}/comments`, {
        perPage,
      });
      return response;
    } catch (error) {
      throw createFormattedError(error, `getComments: ${issueKey}`);
    }
  }

  /**
   * HTTP DELETE запрос
   */
  public async delete(path: string): Promise<any> {
    try {
      const response = await this.client.delete(path);
      logger.info({ path }, "DELETE");
      return response;
    } catch (error) {
      logger.error({ path, error }, "DELETE");
      throw createFormattedError(error, `DELETE ${path}`);
    }
  }

  /**
   * Создание связи между задачами
   * API: POST /v3/issues/<issue_key>/links
   *
   * @param {string} issueKey - Ключ задачи, к которой добавляется связь
   * @param {string} relationship - Тип связи:
   *   - "relates" - связана с
   *   - "depends on" - зависит от (блокер)
   *   - "is dependent by" - является блокером для
   *   - "duplicates" - дублирует
   *   - "is duplicated by" - дублируется
   *   - "is subtask for" - подзадача для
   *   - "is parent task for" - родительская задача для
   * @param {string} linkedIssue - Ключ связываемой задачи
   * @return {*}  {Promise<any>} - Созданная связь
   * @memberof YandexTrackerAPI
   */
  async linkIssue(
    issueKey: string,
    relationship: string,
    linkedIssue: string
  ): Promise<any> {
    try {
      const body = {
        relationship: relationship,
        issue: linkedIssue,
      };
      const response = await this.post(`issues/${issueKey}/links`, body);
      return response;
    } catch (error) {
      throw createFormattedError(error, `linkIssue: ${issueKey}`);
    }
  }

  /**
   * Получение связей задачи
   * API: GET /v2/issues/<issue_key>/links
   *
   * @param {string} issueKey - Ключ задачи
   * @return {*}  {Promise<any[]>} - Список связей
   * @memberof YandexTrackerAPI
   */
  async getLinks(issueKey: string): Promise<any[]> {
    try {
      const response = await this.get(`issues/${issueKey}/links`);
      return response;
    } catch (error) {
      throw createFormattedError(error, `getLinks: ${issueKey}`);
    }
  }

  /**
   * Удаление связи задачи
   * API: DELETE /v2/issues/<issue_key>/links/<link_id>
   *
   * @param {string} issueKey - Ключ задачи
   * @param {string} linkId - ID связи
   * @return {*}  {Promise<any>} - Результат удаления
   * @memberof YandexTrackerAPI
   */
  async deleteLink(issueKey: string, linkId: string): Promise<any> {
    try {
      const response = await this.delete(`issues/${issueKey}/links/${linkId}`);
      return response;
    } catch (error) {
      throw createFormattedError(error, `deleteLink: ${issueKey}`);
    }
  }

  /**
   * Удаление задачи
   * API: DELETE /v2/issues/<issue_key>
   *
   * @param {string} issueKey - Ключ задачи для удаления
   * @return {*}  {Promise<any>} - Результат удаления
   * @memberof YandexTrackerAPI
   */
  async deleteIssue(issueKey: string): Promise<any> {
    try {
      const response = await this.delete(`issues/${issueKey}`);
      return response;
    } catch (error) {
      throw createFormattedError(error, `deleteIssue: ${issueKey}`);
    }
  }

  /**
   * Перенести задачу в другую очередь
   * API: POST /v3/issues/<issue_key>/_move?queue=<queue_key>
   *
   * @param {string} issueKey - Ключ задачи
   * @param {string} queue - Ключ целевой очереди
   * @param {boolean} [moveAllFields] - Перенести компоненты, версии и проекты
   * @param {boolean} [initialStatus] - Сбросить статус в начальное значение
   * @return {*}  {Promise<Issue>} - Перенесенная задача
   * @memberof YandexTrackerAPI
   */
  async moveIssue(
    issueKey: string,
    queue: string,
    moveAllFields?: boolean,
    initialStatus?: boolean
  ): Promise<Issue> {
    try {
      let url = `issues/${issueKey}/_move?queue=${queue}`;
      if (moveAllFields !== undefined) url += `&MoveAllFields=${moveAllFields}`;
      if (initialStatus !== undefined) url += `&InitialStatus=${initialStatus}`;

      const response = await this.post(url, {});
      return issueSchema.parse(response);
    } catch (error) {
      throw createFormattedError(error, `moveIssue: ${issueKey}`);
    }
  }

  /**
   * Прикрепить файл к задаче
   * API: POST /v3/issues/<issue_key>/attachments/
   *
   * @param {string} issueKey - Ключ задачи
   * @param {Buffer | string} fileContent - Содержимое файла (Buffer или base64 строка)
   * @param {string} fileName - Имя файла
   * @return {*}  {Promise<any>} - Информация о прикрепленном файле
   * @memberof YandexTrackerAPI
   */
  async attachFile(
    issueKey: string,
    fileContent: Buffer | string,
    fileName: string
  ): Promise<any> {
    try {
      const formData = new FormData();
      
      // Конвертируем base64 в Buffer если нужно
      let buffer: Buffer;
      if (typeof fileContent === 'string') {
        // Убираем префикс data:image/... если он есть
        const base64Data = fileContent.replace(/^data:image\/\w+;base64,/, '');
        buffer = Buffer.from(base64Data, 'base64');
      } else {
        buffer = fileContent;
      }
      
      formData.append('file', buffer, fileName);

      // Формируем заголовки
      const orgId = config.YANDEX_TRACKER_ORG_ID;
      const cloudOrgId = config.YANDEX_TRACKER_CLOUD_ORG_ID;
      
      const headers: Record<string, string> = {
        'Authorization': `OAuth ${config.YANDEX_TRACKER_TOKEN}`,
        ...formData.getHeaders(),
      };

      if (orgId) {
        headers['X-Org-Id'] = orgId;
      } else if (cloudOrgId) {
        headers['X-Cloud-Org-Id'] = cloudOrgId;
      }

      const url = `${config.YANDEX_TRACKER_BASE_URL}/v3/issues/${issueKey}/attachments/`;
      
      const response = await axios.post(url, formData, {
        headers,
        timeout: config.REQUEST_TIMEOUT,
      });

      logger.info({ issueKey, fileName }, "File attached to issue");
      return response.data;
    } catch (error: any) {
      logger.error({ issueKey, fileName, error: error.response?.data || error.message }, "Failed to attach file");
      throw createFormattedError(error, `attachFile: ${issueKey}`);
    }
  }

  /**
   * Получить список прикрепленных файлов задачи
   * API: GET /v3/issues/<issue_key>/attachments
   *
   * @param {string} issueKey - Ключ задачи
   * @return {*}  {Promise<any[]>} - Список прикрепленных файлов
   * @memberof YandexTrackerAPI
   */
  async getAttachments(issueKey: string): Promise<any[]> {
    try {
      const response = await this.get(`issues/${issueKey}/attachments`);
      return response;
    } catch (error) {
      throw createFormattedError(error, `getAttachments: ${issueKey}`);
    }
  }

  /**
   * Удалить прикрепленный файл
   * API: DELETE /v3/issues/<issue_key>/attachments/<attachment_id>
   *
   * @param {string} issueKey - Ключ задачи
   * @param {string} attachmentId - ID вложения
   * @return {*}  {Promise<any>} - Результат удаления
   * @memberof YandexTrackerAPI
   */
  async deleteAttachment(issueKey: string, attachmentId: string): Promise<any> {
    try {
      const response = await this.delete(`issues/${issueKey}/attachments/${attachmentId}`);
      return response;
    } catch (error) {
      throw createFormattedError(error, `deleteAttachment: ${issueKey}`);
    }
  }
}
