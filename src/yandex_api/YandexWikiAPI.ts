import { logger } from "../settings/logger";
import { config } from "../settings/config";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import FormData from "form-data";

/**
 * Типы страниц Яндекс Вики
 */
export type WikiPageType = "page" | "grid" | "redirect" | "cloud" | "wysiwyg";

/**
 * Параметры страницы Вики
 */
export interface WikiPage {
  id: number;
  page_type: WikiPageType;
  slug: string;
  title: string;
  content?: string;
  attributes?: {
    comments_count: number;
    comments_enabled: boolean;
    created_at: string;
    is_readonly: boolean;
    lang: string;
    modified_at: string;
    is_collaborative?: boolean;
    is_draft?: boolean;
    keywords?: string[];
  };
  breadcrumbs?: Array<{
    page_exists: boolean;
    slug: string;
    title: string;
    id?: number;
  }>;
}

/**
 * Клиент для работы с API Яндекс Вики
 * Реализует паттерн Singleton
 */
export class YandexWikiAPI {
  private readonly client: AxiosInstance;
  private static instance: YandexWikiAPI;

  private constructor() {
    const orgId = config.YANDEX_TRACKER_ORG_ID;
    const cloudOrgId = config.YANDEX_TRACKER_CLOUD_ORG_ID;

    const headers: Record<string, string> = {
      "Authorization": `OAuth ${config.YANDEX_TRACKER_TOKEN}`,
      "Content-Type": "application/json",
    };

    // Добавляем заголовок организации в зависимости от типа
    if (orgId) {
      headers["X-Org-Id"] = orgId;
    } else if (cloudOrgId) {
      headers["X-Cloud-Org-Id"] = cloudOrgId;
    }

    this.client = axios.create({
      baseURL: "https://api.wiki.yandex.net/v1",
      timeout: config.REQUEST_TIMEOUT,
      headers,
    });
  }

  /**
   * Получение экземпляра API
   */
  public static getInstance(): YandexWikiAPI {
    if (!YandexWikiAPI.instance) {
      try {
        logger.debug("Создание экземпляра YandexWikiAPI");
        YandexWikiAPI.instance = new YandexWikiAPI();
      } catch (error) {
        logger.error("Не удалось создать экземпляр YandexWikiAPI");
        throw error;
      }
    }
    return YandexWikiAPI.instance;
  }

  /**
   * GET запрос
   */
  private async get(path: string, params?: Record<string, any>): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.get(path, { params });
      logger.info({ path, params }, "Wiki GET");
      return response.data;
    } catch (error: any) {
      logger.error({ path, params, error: error.response?.data || error.message }, "Wiki GET Error");
      throw error;
    }
  }

  /**
   * POST запрос
   */
  private async post(path: string, data?: Record<string, any>, params?: Record<string, any>): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.post(path, data, { params });
      logger.info({ path, data }, "Wiki POST");
      return response.data;
    } catch (error: any) {
      logger.error({ path, data, error: error.response?.data || error.message }, "Wiki POST Error");
      throw error;
    }
  }

  /**
   * DELETE запрос
   */
  private async delete(path: string): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.delete(path);
      logger.info({ path }, "Wiki DELETE");
      return response.data;
    } catch (error: any) {
      logger.error({ path, error: error.response?.data || error.message }, "Wiki DELETE Error");
      throw error;
    }
  }

  /**
   * Получить параметры страницы по slug
   * API: GET /v1/pages?slug=<slug>
   *
   * @param {string} slug - Путь к странице (например: users/mypage)
   * @param {string} [fields] - Дополнительные поля через запятую (content, attributes, breadcrumbs)
   * @return {*} {Promise<WikiPage>}
   */
  async getPage(slug: string, fields?: string): Promise<WikiPage> {
    try {
      const params: Record<string, any> = { slug };
      if (fields) params.fields = fields;

      const response = await this.get("/pages", params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Получить параметры страницы по ID
   * API: GET /v1/pages/<id>
   *
   * @param {number} pageId - ID страницы
   * @param {string} [fields] - Дополнительные поля
   * @return {*} {Promise<WikiPage>}
   */
  async getPageById(pageId: number, fields?: string): Promise<WikiPage> {
    try {
      const params: Record<string, any> = {};
      if (fields) params.fields = fields;

      const response = await this.get(`/pages/${pageId}`, params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Создать страницу
   * API: POST /v1/pages
   *
   * @param {object} params - Параметры создания
   * @param {string} params.slug - Путь к странице
   * @param {string} params.title - Заголовок страницы
   * @param {WikiPageType} [params.page_type] - Тип страницы (по умолчанию "page")
   * @param {string} [params.content] - Контент страницы (Markdown/Wikitext)
   * @return {*} {Promise<WikiPage>}
   */
  async createPage(params: {
    slug: string;
    title: string;
    page_type?: WikiPageType;
    content?: string;
  }): Promise<WikiPage> {
    try {
      const body: Record<string, any> = {
        slug: params.slug,
        title: params.title,
        page_type: params.page_type || "page",
      };
      if (params.content) body.content = params.content;

      const response = await this.post("/pages", body);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Обновить параметры страницы
   * API: POST /v1/pages/<id>
   *
   * @param {number} pageId - ID страницы
   * @param {object} params - Параметры обновления
   * @param {string} [params.title] - Новый заголовок
   * @param {string} [params.content] - Новый контент
   * @return {*} {Promise<WikiPage>}
   */
  async updatePage(
    pageId: number,
    params: {
      title?: string;
      content?: string;
    }
  ): Promise<WikiPage> {
    try {
      const body: Record<string, any> = {};
      if (params.title !== undefined) body.title = params.title;
      if (params.content !== undefined) body.content = params.content;

      const response = await this.post(`/pages/${pageId}`, body);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Удалить страницу
   * API: DELETE /v1/pages/<id>
   *
   * @param {number} pageId - ID страницы
   * @return {*} {Promise<{recovery_token: string}>}
   */
  async deletePage(pageId: number): Promise<{ recovery_token: string }> {
    try {
      const response = await this.delete(`/pages/${pageId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Добавить контент к странице (append)
   * API: POST /v1/pages/<id>/append
   *
   * @param {number} pageId - ID страницы
   * @param {string} content - Контент для добавления
   * @return {*} {Promise<WikiPage>}
   */
  async appendContent(pageId: number, content: string): Promise<WikiPage> {
    try {
      const response = await this.post(`/pages/${pageId}/append`, { content });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Загрузить файл на Wiki страницу
   * API: POST /v1/pages/<pageId>/files
   * 
   * @param {number} pageId - ID страницы
   * @param {Buffer | string} fileContent - Содержимое файла (Buffer или base64 строка)
   * @param {string} fileName - Имя файла
   * @return {*} {Promise<any>} - Информация о загруженном файле
   */
  async uploadFile(
    pageId: number,
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

      const orgId = config.YANDEX_TRACKER_ORG_ID;
      const cloudOrgId = config.YANDEX_TRACKER_CLOUD_ORG_ID;

      const headers: Record<string, string> = {
        "Authorization": `OAuth ${config.YANDEX_TRACKER_TOKEN}`,
        ...formData.getHeaders(),
      };

      if (orgId) {
        headers["X-Org-Id"] = orgId;
      } else if (cloudOrgId) {
        headers["X-Cloud-Org-Id"] = cloudOrgId;
      }

      const response: AxiosResponse = await axios.post(
        `https://api.wiki.yandex.net/v1/pages/${pageId}/files`,
        formData,
        {
          headers,
          timeout: config.REQUEST_TIMEOUT,
        }
      );
      
      logger.info({ pageId, fileName }, "Wiki file uploaded");
      return response.data;
    } catch (error: any) {
      logger.error({ pageId, fileName, error: error.response?.data || error.message }, "Wiki file upload error");
      throw error;
    }
  }

  /**
   * Получить список файлов на странице
   * API: GET /v1/pages/<pageId>/files
   *
   * @param {number} pageId - ID страницы
   * @return {*} {Promise<any[]>} - Список файлов
   */
  async getFiles(pageId: number): Promise<any[]> {
    try {
      const response = await this.get(`/pages/${pageId}/files`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Удалить файл со страницы
   * API: DELETE /v1/pages/<pageId>/files/<fileId>
   *
   * @param {number} pageId - ID страницы
   * @param {string} fileId - ID файла
   * @return {*} {Promise<any>} - Результат удаления
   */
  async deleteFile(pageId: number, fileId: string): Promise<any> {
    try {
      const response = await this.delete(`/pages/${pageId}/files/${fileId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
