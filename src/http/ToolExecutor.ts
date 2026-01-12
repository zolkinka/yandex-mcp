import { z } from "zod";
import { YandexTrackerAPI } from "../yandex_api/YandexTrackerAPI";
import { YandexWikiAPI } from "../yandex_api/YandexWikiAPI";
import { TOOL_DEFINITIONS } from "./OpenAPIGenerator";
import { config } from "../settings/config";
import { ModelDescriptionName } from "../enums/ModelDescriptionName";
import * as fs from "fs/promises";

// Импортируем схемы для валидации
import {
  getIssueParamsSchema,
  getQueuesParamsSchema,
  getUserParamsSchema,
  searchIssueByQueryParamsShema,
  createIssueParamsSchema,
  updateIssueParamsSchema,
  addCommentParamsSchema,
  getCommentsParamsSchema,
  transitionIssueParamsSchema,
  getTransitionsParamsSchema,
  linkIssueParamsSchema,
  getLinksParamsSchema,
  deleteLinkParamsSchema,
  deleteIssueParamsSchema
} from "../models/paramShemas";
import {
  getWikiPageParamsSchema,
  getWikiPageByIdParamsSchema,
  createWikiPageParamsSchema,
  updateWikiPageParamsSchema,
  deleteWikiPageParamsSchema,
  appendWikiContentParamsSchema
} from "../models/wikiParamSchemas";

interface ToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

export class ToolExecutor {
  private trackerApi: YandexTrackerAPI;
  private wikiApi: YandexWikiAPI;

  constructor() {
    this.trackerApi = YandexTrackerAPI.getInstance();
    this.wikiApi = YandexWikiAPI.getInstance();
  }

  /**
   * Выполняет инструмент по его operationId
   */
  public async execute(operationId: string, params: any): Promise<ToolResult> {
    try {
      const result = await this.executeInternal(operationId, params);
      return this.formatResult(result);
    } catch (error) {
      return this.formatError(error);
    }
  }

  private async executeInternal(operationId: string, params: any): Promise<any> {
    switch (operationId) {
      // ==================== ПОЛЬЗОВАТЕЛИ ====================
      case "getTrackerUsers":
        return await this.trackerApi.getUsers();

      case "getUser":
        const userParams = getUserParamsSchema.parse(params);
        return await this.trackerApi.getUser(userParams.key);

      case "getMySelf":
        return await this.trackerApi.getMyself();

      // ==================== СПРАВОЧНИКИ ====================
      case "getUserFields":
        return await this.readJsonFile(ModelDescriptionName.user);

      case "getQueueFields":
        return await this.readJsonFile(ModelDescriptionName.queue);

      case "getIssueFields":
        return await this.readJsonFile(ModelDescriptionName.issue);

      case "getIssueStatusTypes":
        return await this.trackerApi.getStatuses();

      case "getIssuePriorityTypes":
        return await this.trackerApi.getPriorities();

      case "getIssueTypes":
        return await this.trackerApi.getIssueTypes();

      // ==================== ОЧЕРЕДИ ====================
      case "getQueues":
        const queuesParams = getQueuesParamsSchema.parse(params);
        return await this.trackerApi.getQueues({ expand: queuesParams.expand });

      // ==================== ПОИСК ====================
      case "getYandexQueryDoc":
        return await this.getYandexQueryDoc();

      case "searchIssueByQuery":
        const searchParams = searchIssueByQueryParamsShema.parse(params);
        const issues = await this.trackerApi.searchIssueByQuery(
          searchParams.query,
          searchParams.isSimple,
          searchParams.perPage,
          searchParams.page
        );
        return {
          issueArray: issues,
          countOfIssues: issues.length
        };

      // ==================== ЗАДАЧИ ====================
      case "getIssue":
        const issueParams = getIssueParamsSchema.parse(params);
        return await this.trackerApi.getIssue(issueParams.issueKey);

      case "createIssue":
        const createParams = createIssueParamsSchema.parse(params);
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
        const updateParams = updateIssueParamsSchema.parse(params);
        const updateData: any = {};
        
        if (updateParams.summary !== undefined) updateData.summary = updateParams.summary;
        if (updateParams.description !== undefined) updateData.description = updateParams.description;
        if (updateParams.type !== undefined) updateData.type = updateParams.type;
        if (updateParams.priority !== undefined) updateData.priority = updateParams.priority;
        if (updateParams.assignee !== undefined) updateData.assignee = updateParams.assignee;
        if (updateParams.parent !== undefined) updateData.parent = updateParams.parent;
        
        if (updateParams.addTags || updateParams.removeTags) {
          updateData.tags = {};
          if (updateParams.addTags) updateData.tags.add = updateParams.addTags;
          if (updateParams.removeTags) updateData.tags.remove = updateParams.removeTags;
        }
        
        if (updateParams.addFollowers || updateParams.removeFollowers) {
          updateData.followers = {};
          if (updateParams.addFollowers) updateData.followers.add = updateParams.addFollowers;
          if (updateParams.removeFollowers) updateData.followers.remove = updateParams.removeFollowers;
        }

        return await this.trackerApi.updateIssue(updateParams.issueKey, updateData);

      case "deleteIssue":
        const deleteParams = deleteIssueParamsSchema.parse(params);
        return await this.trackerApi.deleteIssue(deleteParams.issueKey);

      // ==================== КОММЕНТАРИИ ====================
      case "addComment":
        const commentParams = addCommentParamsSchema.parse(params);
        return await this.trackerApi.addComment(
          commentParams.issueKey,
          commentParams.text,
          commentParams.summonees
        );

      case "getComments":
        const getCommentsParams = getCommentsParamsSchema.parse(params);
        return await this.trackerApi.getComments(
          getCommentsParams.issueKey,
          getCommentsParams.perPage
        );

      // ==================== СТАТУСЫ ====================
      case "getTransitions":
        const transitionsParams = getTransitionsParamsSchema.parse(params);
        return await this.trackerApi.getTransitions(transitionsParams.issueKey);

      case "transitionIssue":
        const transitionParams = transitionIssueParamsSchema.parse(params);
        return await this.trackerApi.transitionIssue(
          transitionParams.issueKey,
          transitionParams.transitionId,
          transitionParams.comment
        );

      // ==================== СВЯЗИ ====================
      case "linkIssue":
        const linkParams = linkIssueParamsSchema.parse(params);
        return await this.trackerApi.linkIssue(
          linkParams.issueKey,
          linkParams.relationship,
          linkParams.linkedIssue
        );

      case "getLinks":
        const getLinksParams = getLinksParamsSchema.parse(params);
        return await this.trackerApi.getLinks(getLinksParams.issueKey);

      case "deleteLink":
        const deleteLinkParams = deleteLinkParamsSchema.parse(params);
        return await this.trackerApi.deleteLink(
          deleteLinkParams.issueKey,
          deleteLinkParams.linkId
        );

      // ==================== WIKI ====================
      case "getWikiPage":
        const wikiPageParams = getWikiPageParamsSchema.parse(params);
        return await this.wikiApi.getPage(wikiPageParams.slug, wikiPageParams.fields);

      case "getWikiPageById":
        const wikiPageByIdParams = getWikiPageByIdParamsSchema.parse(params);
        return await this.wikiApi.getPageById(wikiPageByIdParams.pageId, wikiPageByIdParams.fields);

      case "createWikiPage":
        const createWikiParams = createWikiPageParamsSchema.parse(params);
        return await this.wikiApi.createPage({
          slug: createWikiParams.slug,
          title: createWikiParams.title,
          page_type: createWikiParams.page_type,
          content: createWikiParams.content,
        });

      case "updateWikiPage":
        const updateWikiParams = updateWikiPageParamsSchema.parse(params);
        return await this.wikiApi.updatePage(updateWikiParams.pageId, {
          title: updateWikiParams.title,
          content: updateWikiParams.content,
        });

      case "deleteWikiPage":
        const deleteWikiParams = deleteWikiPageParamsSchema.parse(params);
        return await this.wikiApi.deletePage(deleteWikiParams.pageId);

      case "appendWikiContent":
        const appendParams = appendWikiContentParamsSchema.parse(params);
        return await this.wikiApi.appendContent(appendParams.pageId, appendParams.content);

      default:
        throw new Error(`Unknown operation: ${operationId}`);
    }
  }

  private async getYandexQueryDoc(): Promise<object> {
    const queryFieldsJson = await fs.readFile(
      `${config.MODEL_DESCRIPTION_BASE_PATH}${ModelDescriptionName.query_params}`,
      "utf-8"
    );
    const howToSearchText = await fs.readFile(
      `${config.MODEL_DESCRIPTION_BASE_PATH}${ModelDescriptionName.howToSearchInfo}`,
      "utf-8"
    );

    const queryFieldsData = JSON.parse(queryFieldsJson);
    return {
      ...queryFieldsData,
      howToUseSearch: howToSearchText,
    };
  }

  private async readJsonFile(fileName: string): Promise<object[]> {
    const content = await fs.readFile(
      `${config.MODEL_DESCRIPTION_BASE_PATH}${fileName}`,
      "utf-8"
    );
    return JSON.parse(content);
  }

  private formatResult(result: any): ToolResult {
    return {
      content: [
        {
          type: "text",
          text: typeof result === "string" ? result : JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private formatError(error: any): ToolResult {
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
