"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YandexMcpServer = void 0;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
class YandexMcpServer {
    /**
     * создаем экземпляр mcp сервера
     */
    constructor(name, version) {
        this.transports = {
            sse: {},
        };
        this.mcpServer = new mcp_js_1.McpServer({
            name: name,
            version: version,
        }, {
            capabilities: {
                tools: {
                    listChanged: true, // уведомление при изменении списка инструментов
                },
            },
        });
    }
    // подключение через stdio транспорт (для запуска из VS Code)
    async connectStdio(transport) {
        await this.mcpServer.connect(transport);
    }
    // подключение Mcp сервера через SSE
    async connect(endpoint, response) {
        try {
            // Создаем транспорт
            const transport = new sse_js_1.SSEServerTransport(endpoint, response);
            this.transports.sse[transport.sessionId] = transport;
            response.on("close", () => {
                // TODO: Добавить лог закрытия соединения
                delete this.transports.sse[transport.sessionId];
                transport.close();
            });
            response.on("error", (err) => {
                // TODO: Добавить лог ошибки соединения
                delete this.transports.sse[transport.sessionId];
                transport.close();
            });
            await this.mcpServer.connect(transport);
            console.info(`SSE connection established for session: ${transport.sessionId}`);
            return transport;
            // const transport = new SSEServerTransport(endpoint, response);
            // this.transports.sse[transport.sessionId] = transport;
            // response.on("close", () => {
            //   delete this.transports.sse[transport.sessionId];
            // });
            // await this.mcpServer.connect(transport);
            // // TODO: лог удачного подключения
            // return transport;
        }
        catch (err) {
            // TODO: лог ошибки подкоючения
            throw err;
        }
    }
    async handleMessages(req, res) {
        try {
            if (!req.body || Object.keys(req.body).length === 0) {
                res.status(400).json({ error: "Message body is empty" });
                return;
            }
            const sessionId = req.query.sessionId;
            if (!sessionId) {
                res.status(400).json({ error: "sessionId is required" });
                return;
            }
            const transport = this.transports.sse[sessionId];
            if (!transport) {
                res
                    .status(404)
                    .json({ error: `Transport not found for sessionId: ${sessionId}` });
                return;
            }
            await transport.handlePostMessage(req, res, req.body);
            res.status(200).end();
        }
        catch (error) {
            console.error("Message handling error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    // формирование ответа для tools
    receiveCallToolResult(response) {
        try {
            return {
                content: [
                    {
                        type: "text",
                        text: typeof response === "string"
                            ? response
                            : JSON.stringify(response),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Ошибка: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
                    },
                ],
                isError: true,
            };
        }
    }
    // формирование ответа для promts
    receivePromptResult(response) {
        try {
            return {
                messages: [
                    {
                        role: "user", // Важно указать константный тип
                        content: {
                            type: "text", // Тип контента - текст
                            text: response,
                        },
                    },
                ],
            };
        }
        catch (error) {
            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: "Ошибка выполнения промпта",
                        },
                    },
                ],
            };
        }
    }
}
exports.YandexMcpServer = YandexMcpServer;
//# sourceMappingURL=YandexMcpServer.js.map