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
exports.ToolExecutor = void 0;
const YandexTrackerAPI_1 = require("../yandex_api/YandexTrackerAPI");
const YandexWikiAPI_1 = require("../yandex_api/YandexWikiAPI");
const config_1 = require("../settings/config");
const ModelDescriptionName_1 = require("../enums/ModelDescriptionName");
const fs = __importStar(require("fs/promises"));
// Импортируем схемы для валидации
const paramShemas_1 = require("../models/paramShemas");
const wikiParamSchemas_1 = require("../models/wikiParamSchemas");
class ToolExecutor {
    constructor() {
        this.trackerApi = YandexTrackerAPI_1.YandexTrackerAPI.getInstance();
        this.wikiApi = YandexWikiAPI_1.YandexWikiAPI.getInstance();
    }
    /**
     * Выполняет инструмент по его operationId
     */
    async execute(operationId, params) {
        try {
            const result = await this.executeInternal(operationId, params);
            return this.formatResult(result);
        }
        catch (error) {
            return this.formatError(error);
        }
    }
    async executeInternal(operationId, params) {
        switch (operationId) {
            // ==================== ПОЛЬЗОВАТЕЛИ ====================
            case "getTrackerUsers":
                return await this.trackerApi.getUsers();
            case "getUser":
                const userParams = paramShemas_1.getUserParamsSchema.parse(params);
                return await this.trackerApi.getUser(userParams.key);
            case "getMySelf":
                return await this.trackerApi.getMyself();
            // ==================== СПРАВОЧНИКИ ====================
            case "getUserFields":
                return await this.readJsonFile(ModelDescriptionName_1.ModelDescriptionName.user);
            case "getQueueFields":
                return await this.readJsonFile(ModelDescriptionName_1.ModelDescriptionName.queue);
            case "getIssueFields":
                return await this.readJsonFile(ModelDescriptionName_1.ModelDescriptionName.issue);
            case "getIssueStatusTypes":
                return await this.trackerApi.getStatuses();
            case "getIssuePriorityTypes":
                return await this.trackerApi.getPriorities();
            case "getIssueTypes":
                return await this.trackerApi.getIssueTypes();
            // ==================== ОЧЕРЕДИ ====================
            case "getQueues":
                const queuesParams = paramShemas_1.getQueuesParamsSchema.parse(params);
                return await this.trackerApi.getQueues({ expand: queuesParams.expand });
            // ==================== ПОИСК ====================
            case "getYandexQueryDoc":
                return await this.getYandexQueryDoc();
            case "searchIssueByQuery":
                const searchParams = paramShemas_1.searchIssueByQueryParamsShema.parse(params);
                const issues = await this.trackerApi.searchIssueByQuery(searchParams.query, searchParams.isSimple, searchParams.perPage, searchParams.page);
                return {
                    issueArray: issues,
                    countOfIssues: issues.length
                };
            // ==================== ЗАДАЧИ ====================
            case "getIssue":
                const issueParams = paramShemas_1.getIssueParamsSchema.parse(params);
                return await this.trackerApi.getIssue(issueParams.issueKey);
            case "createIssue":
                const createParams = paramShemas_1.createIssueParamsSchema.parse(params);
                return await this.trackerApi.createIssue({
                    queue: createParams.queue,
                    summary: createParams.summary,
                    description: createParams.description,
                    type: createParams.type,
                    priority: createParams.priority,
                    assignee: createParams.assignee,
                    parent: createParams.parent,
                    followers: createParams.followers,
                    tags: createParams.tags,
                    sprint: createParams.sprint,
                });
            case "updateIssue":
                const updateParams = paramShemas_1.updateIssueParamsSchema.parse(params);
                const updateData = {};
                if (updateParams.summary !== undefined)
                    updateData.summary = updateParams.summary;
                if (updateParams.description !== undefined)
                    updateData.description = updateParams.description;
                if (updateParams.type !== undefined)
                    updateData.type = updateParams.type;
                if (updateParams.priority !== undefined)
                    updateData.priority = updateParams.priority;
                if (updateParams.assignee !== undefined)
                    updateData.assignee = updateParams.assignee;
                if (updateParams.parent !== undefined)
                    updateData.parent = updateParams.parent;
                if (updateParams.addTags || updateParams.removeTags) {
                    updateData.tags = {};
                    if (updateParams.addTags)
                        updateData.tags.add = updateParams.addTags;
                    if (updateParams.removeTags)
                        updateData.tags.remove = updateParams.removeTags;
                }
                if (updateParams.addFollowers || updateParams.removeFollowers) {
                    updateData.followers = {};
                    if (updateParams.addFollowers)
                        updateData.followers.add = updateParams.addFollowers;
                    if (updateParams.removeFollowers)
                        updateData.followers.remove = updateParams.removeFollowers;
                }
                return await this.trackerApi.updateIssue(updateParams.issueKey, updateData);
            case "deleteIssue":
                const deleteParams = paramShemas_1.deleteIssueParamsSchema.parse(params);
                return await this.trackerApi.deleteIssue(deleteParams.issueKey);
            // ==================== КОММЕНТАРИИ ====================
            case "addComment":
                const commentParams = paramShemas_1.addCommentParamsSchema.parse(params);
                return await this.trackerApi.addComment(commentParams.issueKey, commentParams.text, commentParams.summonees);
            case "getComments":
                const getCommentsParams = paramShemas_1.getCommentsParamsSchema.parse(params);
                return await this.trackerApi.getComments(getCommentsParams.issueKey, getCommentsParams.perPage);
            // ==================== СТАТУСЫ ====================
            case "getTransitions":
                const transitionsParams = paramShemas_1.getTransitionsParamsSchema.parse(params);
                return await this.trackerApi.getTransitions(transitionsParams.issueKey);
            case "transitionIssue":
                const transitionParams = paramShemas_1.transitionIssueParamsSchema.parse(params);
                return await this.trackerApi.transitionIssue(transitionParams.issueKey, transitionParams.transitionId, transitionParams.comment);
            // ==================== СВЯЗИ ====================
            case "linkIssue":
                const linkParams = paramShemas_1.linkIssueParamsSchema.parse(params);
                return await this.trackerApi.linkIssue(linkParams.issueKey, linkParams.relationship, linkParams.linkedIssue);
            case "getLinks":
                const getLinksParams = paramShemas_1.getLinksParamsSchema.parse(params);
                return await this.trackerApi.getLinks(getLinksParams.issueKey);
            case "deleteLink":
                const deleteLinkParams = paramShemas_1.deleteLinkParamsSchema.parse(params);
                return await this.trackerApi.deleteLink(deleteLinkParams.issueKey, deleteLinkParams.linkId);
            // ==================== WIKI ====================
            case "getWikiPage":
                const wikiPageParams = wikiParamSchemas_1.getWikiPageParamsSchema.parse(params);
                return await this.wikiApi.getPage(wikiPageParams.slug, wikiPageParams.fields);
            case "getWikiPageById":
                const wikiPageByIdParams = wikiParamSchemas_1.getWikiPageByIdParamsSchema.parse(params);
                return await this.wikiApi.getPageById(wikiPageByIdParams.pageId, wikiPageByIdParams.fields);
            case "createWikiPage":
                const createWikiParams = wikiParamSchemas_1.createWikiPageParamsSchema.parse(params);
                return await this.wikiApi.createPage({
                    slug: createWikiParams.slug,
                    title: createWikiParams.title,
                    page_type: createWikiParams.page_type,
                    content: createWikiParams.content,
                });
            case "updateWikiPage":
                const updateWikiParams = wikiParamSchemas_1.updateWikiPageParamsSchema.parse(params);
                return await this.wikiApi.updatePage(updateWikiParams.pageId, {
                    title: updateWikiParams.title,
                    content: updateWikiParams.content,
                });
            case "deleteWikiPage":
                const deleteWikiParams = wikiParamSchemas_1.deleteWikiPageParamsSchema.parse(params);
                return await this.wikiApi.deletePage(deleteWikiParams.pageId);
            case "appendWikiContent":
                const appendParams = wikiParamSchemas_1.appendWikiContentParamsSchema.parse(params);
                return await this.wikiApi.appendContent(appendParams.pageId, appendParams.content);
            default:
                throw new Error(`Unknown operation: ${operationId}`);
        }
    }
    async getYandexQueryDoc() {
        const queryFieldsJson = await fs.readFile(`${config_1.config.MODEL_DESCRIPTION_BASE_PATH}${ModelDescriptionName_1.ModelDescriptionName.query_params}`, "utf-8");
        const howToSearchText = await fs.readFile(`${config_1.config.MODEL_DESCRIPTION_BASE_PATH}${ModelDescriptionName_1.ModelDescriptionName.howToSearchInfo}`, "utf-8");
        const queryFieldsData = JSON.parse(queryFieldsJson);
        return {
            ...queryFieldsData,
            howToUseSearch: howToSearchText,
        };
    }
    async readJsonFile(fileName) {
        const content = await fs.readFile(`${config_1.config.MODEL_DESCRIPTION_BASE_PATH}${fileName}`, "utf-8");
        return JSON.parse(content);
    }
    formatResult(result) {
        return {
            content: [
                {
                    type: "text",
                    text: typeof result === "string" ? result : JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    formatError(error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: "text",
                    text: `Ошибка: ${message}`
                }
            ],
            isError: true
        };
    }
}
exports.ToolExecutor = ToolExecutor;
//# sourceMappingURL=ToolExecutor.js.map