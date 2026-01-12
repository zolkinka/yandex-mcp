import express, { Express, Request, Response, NextFunction } from "express";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { YandexTrackerMcpServer } from "../mcp/YandexTrackerMcpServer";
import { OpenAPIGenerator } from "./OpenAPIGenerator";
import { ToolExecutor } from "./ToolExecutor";

interface HttpServerConfig {
  port: number;
  host?: string;
  https?: {
    keyPath: string;
    certPath: string;
  };
  apiKey?: string; // Опциональный API ключ для аутентификации
}

export class HttpServer {
  private app: Express;
  private server: https.Server | http.Server | null = null;
  private mcpServer: YandexTrackerMcpServer;
  private openApiGenerator: OpenAPIGenerator;
  private toolExecutor: ToolExecutor;
  private config: HttpServerConfig;

  constructor(config: HttpServerConfig) {
    this.config = config;
    this.app = express();
    this.mcpServer = new YandexTrackerMcpServer("yandex-tracker", "v1.0.0");
    this.openApiGenerator = new OpenAPIGenerator();
    this.toolExecutor = new ToolExecutor();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // JSON парсинг
    this.app.use(express.json({ limit: "10mb" }));
    
    // CORS для ChatGPT
    this.app.use((req: Request, res: Response, next: NextFunction) => {
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
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });

    // Аутентификация по API ключу (если настроен)
    this.app.use((req: Request, res: Response, next: NextFunction) => {
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

  private setupRoutes(): void {
    // Главная страница - информация о сервере
    this.app.get("/", (req: Request, res: Response) => {
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
    this.app.get("/health", (req: Request, res: Response) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // OpenAI Plugin manifest (для ChatGPT)
    this.app.get("/.well-known/ai-plugin.json", (req: Request, res: Response) => {
      const baseUrl = this.getBaseUrl(req);
      res.json(this.openApiGenerator.generatePluginManifest(baseUrl, !!this.config.apiKey));
    });

    // OpenAPI спецификация в JSON
    this.app.get("/openapi.json", (req: Request, res: Response) => {
      const baseUrl = this.getBaseUrl(req);
      res.json(this.openApiGenerator.generateOpenAPISpec(baseUrl));
    });

    // OpenAPI спецификация в YAML
    this.app.get("/openapi.yaml", (req: Request, res: Response) => {
      const baseUrl = this.getBaseUrl(req);
      res.setHeader("Content-Type", "text/yaml");
      res.send(this.openApiGenerator.generateOpenAPISpecYaml(baseUrl));
    });

    // Список всех инструментов
    this.app.get("/tools", (req: Request, res: Response) => {
      res.json(this.openApiGenerator.getToolsList());
    });

    // Информация о конкретном инструменте
    this.app.get("/tools/:toolName", (req: Request, res: Response) => {
      const toolInfo = this.openApiGenerator.getToolInfo(req.params.toolName);
      if (toolInfo) {
        res.json(toolInfo);
      } else {
        res.status(404).json({ error: `Tool '${req.params.toolName}' not found` });
      }
    });

    // Выполнение инструмента
    this.app.post("/execute/:toolName", async (req: Request, res: Response) => {
      try {
        const { toolName } = req.params;
        const params = req.body || {};
        
        console.log(`Executing tool: ${toolName}`, params);
        
        const result = await this.toolExecutor.execute(toolName, params);
        res.json(result);
      } catch (error) {
        console.error(`Tool execution error:`, error);
        res.status(500).json({
          error: error instanceof Error ? error.message : "Unknown error",
          toolName: req.params.toolName
        });
      }
    });

    // 404 для неизвестных маршрутов
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: "Not found", path: req.path });
    });

    // Обработка ошибок
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error("Server error:", err);
      res.status(500).json({ error: "Internal server error" });
    });
  }

  private getBaseUrl(req: Request): string {
    const protocol = this.config.https ? "https" : "http";
    const host = req.headers.host || `${this.config.host || "localhost"}:${this.config.port}`;
    return `${protocol}://${host}`;
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.config.https) {
          // HTTPS сервер
          const httpsOptions = {
            key: fs.readFileSync(this.config.https.keyPath),
            cert: fs.readFileSync(this.config.https.certPath),
          };
          this.server = https.createServer(httpsOptions, this.app);
        } else {
          // HTTP сервер (для локальной разработки)
          this.server = http.createServer(this.app);
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
      } catch (error) {
        reject(error);
      }
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log("HTTP Server stopped");
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
