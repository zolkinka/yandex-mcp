"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpServer_1 = require("./http/HttpServer");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Загружаем .env
const projectRoot = path_1.default.resolve(__dirname, "..");
dotenv_1.default.config({ path: path_1.default.join(projectRoot, ".env") });
// Конфигурация сервера
const PORT = parseInt(process.env.HTTP_PORT || "3000", 10);
const HOST = process.env.HTTP_HOST || "0.0.0.0";
const API_KEY = process.env.HTTP_API_KEY;
// HTTPS настройки (опционально)
const SSL_KEY_PATH = process.env.SSL_KEY_PATH;
const SSL_CERT_PATH = process.env.SSL_CERT_PATH;
async function main() {
    const config = {
        port: PORT,
        host: HOST,
    };
    // Включаем API ключ если настроен
    if (API_KEY) {
        config.apiKey = API_KEY;
        console.log("🔐 API key authentication enabled");
    }
    // Включаем HTTPS если сертификаты настроены
    if (SSL_KEY_PATH && SSL_CERT_PATH) {
        config.https = {
            keyPath: SSL_KEY_PATH,
            certPath: SSL_CERT_PATH,
        };
        console.log("🔒 HTTPS mode enabled");
    }
    else {
        console.log("⚠️  Running in HTTP mode (not secure for production)");
        console.log("   Set SSL_KEY_PATH and SSL_CERT_PATH for HTTPS");
    }
    const server = new HttpServer_1.HttpServer(config);
    // Graceful shutdown
    process.on("SIGINT", async () => {
        console.log("\n🛑 Shutting down server...");
        await server.stop();
        process.exit(0);
    });
    process.on("SIGTERM", async () => {
        console.log("\n🛑 Shutting down server...");
        await server.stop();
        process.exit(0);
    });
    try {
        await server.start();
        console.log("\n📖 Доступные эндпоинты:");
        console.log(`   GET  /                     - Информация о сервере`);
        console.log(`   GET  /health               - Health check`);
        console.log(`   GET  /.well-known/ai-plugin.json - Манифест для ChatGPT`);
        console.log(`   GET  /openapi.json         - OpenAPI спецификация (JSON)`);
        console.log(`   GET  /openapi.yaml         - OpenAPI спецификация (YAML)`);
        console.log(`   GET  /tools                - Список всех инструментов`);
        console.log(`   GET  /tools/:name          - Информация об инструменте`);
        console.log(`   POST /execute/:operationId - Выполнение инструмента`);
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=httpServer.js.map