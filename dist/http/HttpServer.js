"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServer = void 0;
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const YandexTrackerMcpServer_1 = require("../mcp/YandexTrackerMcpServer");
const OpenAPIGenerator_1 = require("./OpenAPIGenerator");
const ToolExecutor_1 = require("./ToolExecutor");
class HttpServer {
    constructor(config) {
        this.server = null;
        this.config = config;
        this.app = (0, express_1.default)();
        this.mcpServer = new YandexTrackerMcpServer_1.YandexTrackerMcpServer("yandex-tracker", "v1.0.0");
        this.openApiGenerator = new OpenAPIGenerator_1.OpenAPIGenerator();
        this.toolExecutor = new ToolExecutor_1.ToolExecutor();
        this.setupMiddleware();
        this.setupRoutes();
    }
    setupMiddleware() {
        // JSON парсинг
        this.app.use(express_1.default.json({ limit: "10mb" }));
        // CORS для ChatGPT
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
            if (req.method === "OPTIONS") {
                res.sendStatus(200);
                return;
            }
            next();
        });
        // Логирование запросов
        this.app.use((req, res, next) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
            next();
        });
        // Аутентификация по API ключу (если настроен)
        this.app.use((req, res, next) => {
            // Пропускаем публичные эндпоинты
            const publicPaths = ["/", "/health", "/.well-known/ai-plugin.json", "/openapi.json", "/openapi.yaml"];
            if (publicPaths.includes(req.path)) {
                next();
                return;
            }
            // Проверяем API ключ если он настроен
            if (this.config.apiKey) {
                const providedKey = req.headers["x-api-key"] || req.headers["authorization"]?.replace("Bearer ", "");
                if (providedKey !== this.config.apiKey) {
                    res.status(401).json({ error: "Unauthorized: Invalid API key" });
                    return;
                }
            }
            next();
        });
    }
    setupRoutes() {
        // Главная страница - информация о сервере
        this.app.get("/", (req, res) => {
            res.json({
                name: "Yandex Tracker MCP Server",
                version: "1.0.0",
                description: "MCP сервер для работы с Яндекс.Трекером и Яндекс.Wiki через ChatGPT",
                endpoints: {
                    openapi: "/openapi.json",
                    openapi_yaml: "/openapi.yaml",
                    ai_plugin: "/.well-known/ai-plugin.json",
                    tools: "/tools",
                    execute: "/execute/{toolName}",
                    health: "/health"
                }
            });
        });
        // Health check
        this.app.get("/health", (req, res) => {
            res.json({ status: "ok", timestamp: new Date().toISOString() });
        });
        // OpenAI Plugin manifest (для ChatGPT)
        this.app.get("/.well-known/ai-plugin.json", (req, res) => {
            const baseUrl = this.getBaseUrl(req);
            res.json(this.openApiGenerator.generatePluginManifest(baseUrl, !!this.config.apiKey));
        });
        // OpenAPI спецификация в JSON
        this.app.get("/openapi.json", (req, res) => {
            const baseUrl = this.getBaseUrl(req);
            res.json(this.openApiGenerator.generateOpenAPISpec(baseUrl));
        });
        // OpenAPI спецификация в YAML
        this.app.get("/openapi.yaml", (req, res) => {
            const baseUrl = this.getBaseUrl(req);
            res.setHeader("Content-Type", "text/yaml");
            res.send(this.openApiGenerator.generateOpenAPISpecYaml(baseUrl));
        });
        // Список всех инструментов
        this.app.get("/tools", (req, res) => {
            res.json(this.openApiGenerator.getToolsList());
        });
        // Информация о конкретном инструменте
        this.app.get("/tools/:toolName", (req, res) => {
            const toolInfo = this.openApiGenerator.getToolInfo(req.params.toolName);
            if (toolInfo) {
                res.json(toolInfo);
            }
            else {
                res.status(404).json({ error: `Tool '${req.params.toolName}' not found` });
            }
        });
        // Выполнение инструмента
        this.app.post("/execute/:toolName", async (req, res) => {
            try {
                const { toolName } = req.params;
                const params = req.body || {};
                console.log(`Executing tool: ${toolName}`, params);
                const result = await this.toolExecutor.execute(toolName, params);
                res.json(result);
            }
            catch (error) {
                console.error(`Tool execution error:`, error);
                res.status(500).json({
                    error: error instanceof Error ? error.message : "Unknown error",
                    toolName: req.params.toolName
                });
            }
        });
        // 404 для неизвестных маршрутов
        this.app.use((req, res) => {
            res.status(404).json({ error: "Not found", path: req.path });
        });
        // Обработка ошибок
        this.app.use((err, req, res, next) => {
            console.error("Server error:", err);
            res.status(500).json({ error: "Internal server error" });
        });
    }
    getBaseUrl(req) {
        const protocol = this.config.https ? "https" : "http";
        const host = req.headers.host || `${this.config.host || "localhost"}:${this.config.port}`;
        return `${protocol}://${host}`;
    }
    async start() {
        return new Promise((resolve, reject) => {
            try {
                if (this.config.https) {
                    // HTTPS сервер
                    const httpsOptions = {
                        key: fs_1.default.readFileSync(this.config.https.keyPath),
                        cert: fs_1.default.readFileSync(this.config.https.certPath),
                    };
                    this.server = https_1.default.createServer(httpsOptions, this.app);
                }
                else {
                    // HTTP сервер (для локальной разработки)
                    this.server = http_1.default.createServer(this.app);
                }
                const host = this.config.host || "0.0.0.0";
                this.server.listen(this.config.port, host, () => {
                    const protocol = this.config.https ? "https" : "http";
                    console.log(`🚀 HTTP Server started on ${protocol}://${host}:${this.config.port}`);
                    console.log(`📋 OpenAPI spec: ${protocol}://${host}:${this.config.port}/openapi.json`);
                    console.log(`🔌 AI Plugin manifest: ${protocol}://${host}:${this.config.port}/.well-known/ai-plugin.json`);
                    resolve();
                });
                this.server.on("error", (error) => {
                    console.error("Server error:", error);
                    reject(error);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    async stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log("HTTP Server stopped");
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
}
exports.HttpServer = HttpServer;
//# sourceMappingURL=HttpServer.js.map