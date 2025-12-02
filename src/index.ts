import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { YandexTrackerMcpServer } from "./mcp/YandexTrackerMcpServer";

// Создаём MCP сервер
const yandexTrackerMcpServer = new YandexTrackerMcpServer("yandex-tracker", "v1.0.0");

// Запуск через stdio транспорт
async function main() {
  const transport = new StdioServerTransport();
  await yandexTrackerMcpServer.connectStdio(transport);
  console.error("Yandex Tracker MCP Server started (stdio mode)");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
