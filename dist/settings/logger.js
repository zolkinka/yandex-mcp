"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const config_1 = require("./config");
const fs_1 = require("fs");
const path_1 = require("path");
// Создаем директорию для логов если указан LOG_DEST
if (config_1.config.LOG_DEST) {
    const logDir = (0, path_1.dirname)(config_1.config.LOG_DEST);
    if (!(0, fs_1.existsSync)(logDir)) {
        (0, fs_1.mkdirSync)(logDir, { recursive: true });
    }
}
exports.logger = (0, pino_1.default)({
    level: config_1.config.LOG_LEVEL,
    formatters: {
        level(label) {
            return { level: label };
        },
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
}, config_1.config.LOG_DEST ? pino_1.default.destination(config_1.config.LOG_DEST) : undefined);
//# sourceMappingURL=logger.js.map