"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YandexWikiAPI = void 0;
const logger_1 = require("../settings/logger");
const config_1 = require("../settings/config");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const errorFormatter_1 = require("../utils/errorFormatter");
/**
 * Клиент для работы с API Яндекс Вики
 * Реализует паттерн Singleton
 */
class YandexWikiAPI {
    constructor() {
        const orgId = config_1.config.YANDEX_TRACKER_ORG_ID;
        const cloudOrgId = config_1.config.YANDEX_TRACKER_CLOUD_ORG_ID;
        const headers = {
            "Authorization": `OAuth ${config_1.config.YANDEX_TRACKER_TOKEN}`,
            "Content-Type": "application/json",
        };
        // Добавляем заголовок организации в зависимости от типа
        if (orgId) {
            headers["X-Org-Id"] = orgId;
        }
        else if (cloudOrgId) {
            headers["X-Cloud-Org-Id"] = cloudOrgId;
        }
        this.client = axios_1.default.create({
            baseURL: "https://api.wiki.yandex.net/v1",
            timeout: config_1.config.REQUEST_TIMEOUT,
            headers,
        });
    }
    /**
     * Получение экземпляра API
     */
    static getInstance() {
        if (!YandexWikiAPI.instance) {
            try {
                logger_1.logger.debug("Создание экземпляра YandexWikiAPI");
                YandexWikiAPI.instance = new YandexWikiAPI();
            }
            catch (error) {
                logger_1.logger.error("Не удалось создать экземпляр YandexWikiAPI");
                throw error;
            }
        }
        return YandexWikiAPI.instance;
    }
    /**
     * GET запрос
     */
    async get(path, params) {
        try {
            const response = await this.client.get(path, { params });
            logger_1.logger.info({ path, params }, "Wiki GET");
            return response.data;
        }
        catch (error) {
            logger_1.logger.error({ path, params, error: error.response?.data || error.message }, "Wiki GET Error");
            throw (0, errorFormatter_1.createFormattedError)(error, `Wiki GET ${path}`);
        }
    }
    /**
     * POST запрос
     */
    async post(path, data, params) {
        try {
            const response = await this.client.post(path, data, { params });
            logger_1.logger.info({ path, data }, "Wiki POST");
            return response.data;
        }
        catch (error) {
            logger_1.logger.error({ path, data, error: error.response?.data || error.message }, "Wiki POST Error");
            throw (0, errorFormatter_1.createFormattedError)(error, `Wiki POST ${path}`);
        }
    }
    /**
     * DELETE запрос
     */
    async delete(path) {
        try {
            const response = await this.client.delete(path);
            logger_1.logger.info({ path }, "Wiki DELETE");
            return response.data;
        }
        catch (error) {
            logger_1.logger.error({ path, error: error.response?.data || error.message }, "Wiki DELETE Error");
            throw (0, errorFormatter_1.createFormattedError)(error, `Wiki DELETE ${path}`);
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
    async getPage(slug, fields) {
        try {
            const params = { slug };
            if (fields)
                params.fields = fields;
            const response = await this.get("/pages", params);
            return response;
        }
        catch (error) {
            throw (0, errorFormatter_1.createFormattedError)(error, `getPage: ${slug}`);
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
    async getPageById(pageId, fields) {
        try {
            const params = {};
            if (fields)
                params.fields = fields;
            const response = await this.get(`/pages/${pageId}`, params);
            return response;
        }
        catch (error) {
            throw (0, errorFormatter_1.createFormattedError)(error, `getPageById: ${pageId}`);
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
    async createPage(params) {
        try {
            const body = {
                slug: params.slug,
                title: params.title,
                page_type: params.page_type || "page",
            };
            if (params.content)
                body.content = params.content;
            const response = await this.post("/pages", body);
            return response;
        }
        catch (error) {
            throw (0, errorFormatter_1.createFormattedError)(error, `createPage: ${params.slug}`);
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
    async updatePage(pageId, params) {
        try {
            const body = {};
            if (params.title !== undefined)
                body.title = params.title;
            if (params.content !== undefined)
                body.content = params.content;
            const response = await this.post(`/pages/${pageId}`, body);
            return response;
        }
        catch (error) {
            throw (0, errorFormatter_1.createFormattedError)(error, `updatePage: ${pageId}`);
        }
    }
    /**
     * Удалить страницу
     * API: DELETE /v1/pages/<id>
     *
     * @param {number} pageId - ID страницы
     * @return {*} {Promise<{recovery_token: string}>}
     */
    async deletePage(pageId) {
        try {
            const response = await this.delete(`/pages/${pageId}`);
            return response;
        }
        catch (error) {
            throw (0, errorFormatter_1.createFormattedError)(error, `deletePage: ${pageId}`);
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
    async appendContent(pageId, content) {
        try {
            const response = await this.post(`/pages/${pageId}/append`, { content });
            return response;
        }
        catch (error) {
            throw (0, errorFormatter_1.createFormattedError)(error, `appendContent: ${pageId}`);
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
    async uploadFile(pageId, fileContent, fileName) {
        try {
            const formData = new form_data_1.default();
            // Конвертируем base64 в Buffer если нужно
            let buffer;
            if (typeof fileContent === 'string') {
                // Убираем префикс data:image/... если он есть
                const base64Data = fileContent.replace(/^data:image\/\w+;base64,/, '');
                buffer = Buffer.from(base64Data, 'base64');
            }
            else {
                buffer = fileContent;
            }
            formData.append('file', buffer, fileName);
            const orgId = config_1.config.YANDEX_TRACKER_ORG_ID;
            const cloudOrgId = config_1.config.YANDEX_TRACKER_CLOUD_ORG_ID;
            const headers = {
                "Authorization": `OAuth ${config_1.config.YANDEX_TRACKER_TOKEN}`,
                ...formData.getHeaders(),
            };
            if (orgId) {
                headers["X-Org-Id"] = orgId;
            }
            else if (cloudOrgId) {
                headers["X-Cloud-Org-Id"] = cloudOrgId;
            }
            const response = await axios_1.default.post(`https://api.wiki.yandex.net/v1/pages/${pageId}/files`, formData, {
                headers,
                timeout: config_1.config.REQUEST_TIMEOUT,
            });
            logger_1.logger.info({ pageId, fileName }, "Wiki file uploaded");
            return response.data;
        }
        catch (error) {
            logger_1.logger.error({ pageId, fileName, error: error.response?.data || error.message }, "Wiki file upload error");
            throw (0, errorFormatter_1.createFormattedError)(error, `uploadFile: ${pageId}`);
        }
    }
    /**
     * Получить список файлов на странице
     * API: GET /v1/pages/<pageId>/files
     *
     * @param {number} pageId - ID страницы
     * @return {*} {Promise<any[]>} - Список файлов
     */
    async getFiles(pageId) {
        try {
            const response = await this.get(`/pages/${pageId}/files`);
            return response;
        }
        catch (error) {
            throw (0, errorFormatter_1.createFormattedError)(error, `getFiles: ${pageId}`);
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
    async deleteFile(pageId, fileId) {
        try {
            const response = await this.delete(`/pages/${pageId}/files/${fileId}`);
            return response;
        }
        catch (error) {
            throw (0, errorFormatter_1.createFormattedError)(error, `deleteFile: ${pageId}`);
        }
    }
}
exports.YandexWikiAPI = YandexWikiAPI;
//# sourceMappingURL=YandexWikiAPI.js.map