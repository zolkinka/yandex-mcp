"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const YandexTrackerMcpServer_1 = require("./mcp/YandexTrackerMcpServer");
// Создаём MCP сервер
const yandexTrackerMcpServer = new YandexTrackerMcpServer_1.YandexTrackerMcpServer("yandex-tracker", "v1.0.0");
// Запуск через stdio транспорт
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await yandexTrackerMcpServer.connectStdio(transport);
    console.error("Yandex Tracker MCP Server started (stdio mode)");
}
main().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map