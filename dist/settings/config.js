"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Загружаем .env из директории проекта (для stdio режима)
const projectRoot = path_1.default.resolve(__dirname, "../..");
dotenv_1.default.config({ path: path_1.default.join(projectRoot, ".env") });
const envSchema = zod_1.z.object({
    YANDEX_TRACKER_TOKEN: zod_1.z.string(),
    YANDEX_TRACKER_ORG_ID: zod_1.z.string().optional(),
    YANDEX_TRACKER_CLOUD_ORG_ID: zod_1.z.string().optional(),
    YANDEX_TRACKER_BASE_URL: zod_1.z.string().url(),
    MCP_SERVER_BASE_URL: zod_1.z.string().url(),
    LOG_LEVEL: zod_1.z
        .enum(["trace", "debug", "info", "warn", "error", "fatal"])
        .default("info"),
    LOG_DEST: zod_1.z.string(),
    REQUEST_TIMEOUT: zod_1.z.coerce.number().default(30000),
    RATE_LIMIT_REQUESTS: zod_1.z.coerce.number().default(100),
    RATE_LIMIT_WINDOW: zod_1.z.coerce.number().default(60000),
    MODEL_DESCRIPTION_BASE_PATH: zod_1.z.string(),
});
exports.config = envSchema.parse(process.env);
// export type EnvConfig = z.infer<typeof envSchema>;
//# sourceMappingURL=config.js.map