import { z } from "zod";
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
import { zodToJsonSchema } from "./zodToJsonSchema";

export interface ToolDefinition {
  name: string;
  operationId: string;
  description: string;
  parameters: z.ZodObject<any> | null;
  category: string;
}

// Описания всех инструментов
export const TOOL_DEFINITIONS: ToolDefinition[] = [
  // ==================== YANDEX TRACKER ====================
  {
    name: "getTrackerUsersTool",
    operationId: "getTrackerUsers",
    description: "Получает всех пользователей Яндекс.Трекера в организации",
    parameters: null,
    category: "Yandex Tracker - Пользователи"
  },
  {
    name: "getUserTool",
    operationId: "getUser",
    description: "Получает информацию о пользователе по id или login",
    parameters: getUserParamsSchema,
    category: "Yandex Tracker - Пользователи"
  },
  {
    name: "getMySelfTool",
    operationId: "getMySelf",
    description: "Получает информацию о текущем авторизованном пользователе",
    parameters: null,
    category: "Yandex Tracker - Пользователи"
  },
  {
    name: "getUserFieldsTool",
    operationId: "getUserFields",
    description: "Получает все поля пользователя с их описанием",
    parameters: null,
    category: "Yandex Tracker - Справочники"
  },
  {
    name: "getQueueFieldsTool",
    operationId: "getQueueFields",
    description: "Получает все поля очереди с их описанием",
    parameters: null,
    category: "Yandex Tracker - Справочники"
  },
  {
    name: "getIssueFieldsTool",
    operationId: "getIssueFields",
    description: "Получает все поля задачи с их описанием",
    parameters: null,
    category: "Yandex Tracker - Справочники"
  },
  {
    name: "getIssueStatusTypesTool",
    operationId: "getIssueStatusTypes",
    description: "Получает все типы статусов для задач в Яндекс.Трекере",
    parameters: null,
    category: "Yandex Tracker - Справочники"
  },
  {
    name: "getIssuePriorityTypesTool",
    operationId: "getIssuePriorityTypes",
    description: "Получает все типы приоритетов для задач в Яндекс.Трекере",
    parameters: null,
    category: "Yandex Tracker - Справочники"
  },
  {
    name: "getIssueTypesTool",
    operationId: "getIssueTypes",
    description: "Получает все типы задач в Яндекс.Трекере (task, bug, epic и т.д.)",
    parameters: null,
    category: "Yandex Tracker - Справочники"
  },
  {
    name: "getQueuesTool",
    operationId: "getQueues",
    description: "Получает список доступных очередей в Яндекс.Трекере",
    parameters: getQueuesParamsSchema,
    category: "Yandex Tracker - Очереди"
  },
  {
    name: "getYandexQueryDocTool",
    operationId: "getYandexQueryDoc",
    description: "Получает документацию по языку запросов Яндекс.Трекера для корректного поиска задач",
    parameters: null,
    category: "Yandex Tracker - Поиск"
  },
  {
    name: "searchIssueByQueryTool",
    operationId: "searchIssueByQuery",
    description: "Поиск задач по запросу на языке запросов Яндекс.Трекера. Перед использованием рекомендуется вызвать getYandexQueryDoc для изучения синтаксиса",
    parameters: searchIssueByQueryParamsShema,
    category: "Yandex Tracker - Поиск"
  },
  {
    name: "getIssueTool",
    operationId: "getIssue",
    description: "Получает подробную информацию о задаче по её ключу (например: TEST-123)",
    parameters: getIssueParamsSchema,
    category: "Yandex Tracker - Задачи"
  },
  {
    name: "createIssueTool",
    operationId: "createIssue",
    description: "Создает новую задачу в Яндекс.Трекере. Обязательные поля: queue (ключ очереди) и summary (название)",
    parameters: createIssueParamsSchema,
    category: "Yandex Tracker - Задачи"
  },
  {
    name: "updateIssueTool",
    operationId: "updateIssue",
    description: "Редактирует существующую задачу. Можно изменить название, описание, приоритет, исполнителя и т.д.",
    parameters: updateIssueParamsSchema,
    category: "Yandex Tracker - Задачи"
  },
  {
    name: "deleteIssueTool",
    operationId: "deleteIssue",
    description: "Удаляет задачу из Яндекс.Трекера. ВНИМАНИЕ: Операция необратима!",
    parameters: deleteIssueParamsSchema,
    category: "Yandex Tracker - Задачи"
  },
  {
    name: "addCommentTool",
    operationId: "addComment",
    description: "Добавляет комментарий к задаче. Можно призвать пользователей через @mention",
    parameters: addCommentParamsSchema,
    category: "Yandex Tracker - Комментарии"
  },
  {
    name: "getCommentsTool",
    operationId: "getComments",
    description: "Получает список комментариев к задаче",
    parameters: getCommentsParamsSchema,
    category: "Yandex Tracker - Комментарии"
  },
  {
    name: "getTransitionsTool",
    operationId: "getTransitions",
    description: "Получает список доступных переходов (смен статуса) для задачи",
    parameters: getTransitionsParamsSchema,
    category: "Yandex Tracker - Статусы"
  },
  {
    name: "transitionIssueTool",
    operationId: "transitionIssue",
    description: "Выполняет переход задачи в другой статус. Сначала используйте getTransitions для получения доступных переходов",
    parameters: transitionIssueParamsSchema,
    category: "Yandex Tracker - Статусы"
  },
  {
    name: "linkIssueTool",
    operationId: "linkIssue",
    description: "Создает связь между задачами. Типы: relates, depends on, is dependent by, duplicates, is subtask for, is parent task for",
    parameters: linkIssueParamsSchema,
    category: "Yandex Tracker - Связи"
  },
  {
    name: "getLinksTool",
    operationId: "getLinks",
    description: "Получает список всех связей задачи (блокеры, связанные задачи, дубликаты и т.д.)",
    parameters: getLinksParamsSchema,
    category: "Yandex Tracker - Связи"
  },
  {
    name: "deleteLinkTool",
    operationId: "deleteLink",
    description: "Удаляет связь между задачами",
    parameters: deleteLinkParamsSchema,
    category: "Yandex Tracker - Связи"
  },
  
  // ==================== YANDEX WIKI ====================
  {
    name: "getWikiPageTool",
    operationId: "getWikiPage",
    description: "Получает страницу Яндекс.Wiki по её пути (slug)",
    parameters: getWikiPageParamsSchema,
    category: "Yandex Wiki"
  },
  {
    name: "getWikiPageByIdTool",
    operationId: "getWikiPageById",
    description: "Получает страницу Яндекс.Wiki по её ID",
    parameters: getWikiPageByIdParamsSchema,
    category: "Yandex Wiki"
  },
  {
    name: "createWikiPageTool",
    operationId: "createWikiPage",
    description: "Создает новую страницу в Яндекс.Wiki. Поддерживает Markdown и Wikitext разметку",
    parameters: createWikiPageParamsSchema,
    category: "Yandex Wiki"
  },
  {
    name: "updateWikiPageTool",
    operationId: "updateWikiPage",
    description: "Обновляет существующую страницу Яндекс.Wiki (заголовок и/или контент)",
    parameters: updateWikiPageParamsSchema,
    category: "Yandex Wiki"
  },
  {
    name: "deleteWikiPageTool",
    operationId: "deleteWikiPage",
    description: "Удаляет страницу Яндекс.Wiki. Возвращает токен для восстановления",
    parameters: deleteWikiPageParamsSchema,
    category: "Yandex Wiki"
  },
  {
    name: "appendWikiContentTool",
    operationId: "appendWikiContent",
    description: "Добавляет контент в конец существующей страницы Яндекс.Wiki",
    parameters: appendWikiContentParamsSchema,
    category: "Yandex Wiki"
  }
];

export class OpenAPIGenerator {
  private tools: ToolDefinition[] = TOOL_DEFINITIONS;

  /**
   * Генерирует манифест плагина для ChatGPT
   */
  public generatePluginManifest(baseUrl: string, hasAuth: boolean): object {
    const manifest: any = {
      schema_version: "v1",
      name_for_human: "Yandex Tracker",
      name_for_model: "yandex_tracker",
      description_for_human: "Управление задачами и wiki-страницами в Яндекс.Трекере и Яндекс.Wiki",
      description_for_model: "Этот плагин позволяет управлять задачами в Яндекс.Трекере: создавать, редактировать, искать задачи, добавлять комментарии, менять статусы, создавать связи между задачами. Также поддерживается работа с Яндекс.Wiki: создание, редактирование и удаление страниц.",
      api: {
        type: "openapi",
        url: `${baseUrl}/openapi.json`
      },
      logo_url: `${baseUrl}/logo.png`,
      contact_email: "support@example.com",
      legal_info_url: `${baseUrl}/legal`
    };

    if (hasAuth) {
      manifest.auth = {
        type: "service_http",
        authorization_type: "bearer",
        verification_tokens: {}
      };
    } else {
      manifest.auth = {
        type: "none"
      };
    }

    return manifest;
  }

  /**
   * Генерирует OpenAPI спецификацию в формате JSON
   */
  public generateOpenAPISpec(baseUrl: string): object {
    const paths: Record<string, any> = {};
    const schemas: Record<string, any> = {};

    for (const tool of this.tools) {
      const path = `/execute/${tool.operationId}`;
      
      // Генерируем схему параметров если есть
      let requestBodySchema: any = { type: "object", properties: {} };
      if (tool.parameters) {
        requestBodySchema = zodToJsonSchema(tool.parameters);
        schemas[`${tool.operationId}Request`] = requestBodySchema;
      }

      paths[path] = {
        post: {
          operationId: tool.operationId,
          summary: tool.description,
          description: `${tool.description}\n\nКатегория: ${tool.category}`,
          tags: [tool.category],
          requestBody: {
            required: tool.parameters !== null,
            content: {
              "application/json": {
                schema: tool.parameters 
                  ? { $ref: `#/components/schemas/${tool.operationId}Request` }
                  : { type: "object", properties: {} }
              }
            }
          },
          responses: {
            "200": {
              description: "Успешный ответ",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      content: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            type: { type: "string", example: "text" },
                            text: { type: "string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              description: "Ошибка в параметрах запроса",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" }
                }
              }
            },
            "401": {
              description: "Ошибка авторизации",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" }
                }
              }
            },
            "500": {
              description: "Внутренняя ошибка сервера",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" }
                }
              }
            }
          }
        }
      };
    }

    // Добавляем общие схемы
    schemas.Error = {
      type: "object",
      properties: {
        error: { type: "string", description: "Сообщение об ошибке" },
        toolName: { type: "string", description: "Имя инструмента" }
      },
      required: ["error"]
    };

    // Группируем теги по категориям
    const tags = [...new Set(this.tools.map(t => t.category))].map(category => ({
      name: category,
      description: `Инструменты категории "${category}"`
    }));

    return {
      openapi: "3.1.0",
      info: {
        title: "Yandex Tracker MCP API",
        description: "API для управления задачами в Яндекс.Трекере и страницами в Яндекс.Wiki через ChatGPT",
        version: "1.0.0",
        contact: {
          name: "API Support",
          email: "support@example.com"
        }
      },
      servers: [
        {
          url: baseUrl,
          description: "Yandex Tracker MCP Server"
        }
      ],
      tags,
      paths,
      components: {
        schemas,
        securitySchemes: {
          apiKey: {
            type: "apiKey",
            in: "header",
            name: "X-API-Key",
            description: "API ключ для аутентификации"
          },
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            description: "Bearer токен для аутентификации"
          }
        }
      }
    };
  }

  /**
   * Генерирует OpenAPI спецификацию в формате YAML
   */
  public generateOpenAPISpecYaml(baseUrl: string): string {
    const spec = this.generateOpenAPISpec(baseUrl);
    return this.jsonToYaml(spec);
  }

  /**
   * Простой конвертер JSON в YAML
   */
  private jsonToYaml(obj: any, indent: number = 0): string {
    const spaces = "  ".repeat(indent);
    let yaml = "";

    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === "object" && item !== null) {
          yaml += `${spaces}-\n${this.jsonToYaml(item, indent + 1).replace(/^/gm, spaces + "  ").trimStart()}`;
        } else {
          yaml += `${spaces}- ${this.formatYamlValue(item)}\n`;
        }
      }
    } else if (typeof obj === "object" && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined) {
          yaml += `${spaces}${key}: null\n`;
        } else if (Array.isArray(value)) {
          yaml += `${spaces}${key}:\n${this.jsonToYaml(value, indent + 1)}`;
        } else if (typeof value === "object") {
          yaml += `${spaces}${key}:\n${this.jsonToYaml(value, indent + 1)}`;
        } else {
          yaml += `${spaces}${key}: ${this.formatYamlValue(value)}\n`;
        }
      }
    }

    return yaml;
  }

  private formatYamlValue(value: any): string {
    if (typeof value === "string") {
      if (value.includes("\n") || value.includes(":") || value.includes("#")) {
        return `"${value.replace(/"/g, '\\"')}"`;
      }
      return value;
    }
    return String(value);
  }

  /**
   * Возвращает список всех инструментов
   */
  public getToolsList(): object {
    const grouped: Record<string, Array<{ name: string; operationId: string; description: string }>> = {};
    
    for (const tool of this.tools) {
      if (!grouped[tool.category]) {
        grouped[tool.category] = [];
      }
      grouped[tool.category].push({
        name: tool.name,
        operationId: tool.operationId,
        description: tool.description
      });
    }

    return {
      totalTools: this.tools.length,
      categories: Object.keys(grouped).length,
      tools: grouped
    };
  }

  /**
   * Возвращает информацию о конкретном инструменте
   */
  public getToolInfo(operationIdOrName: string): object | null {
    const tool = this.tools.find(
      t => t.operationId === operationIdOrName || t.name === operationIdOrName
    );
    
    if (!tool) return null;

    return {
      name: tool.name,
      operationId: tool.operationId,
      description: tool.description,
      category: tool.category,
      parameters: tool.parameters ? zodToJsonSchema(tool.parameters) : null
    };
  }
}
