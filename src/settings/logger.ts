import pino from "pino";
import { config } from "./config";
import { mkdirSync, existsSync } from "fs";
import { dirname } from "path";

// Создаем директорию для логов если указан LOG_DEST
if (config.LOG_DEST) {
  const logDir = dirname(config.LOG_DEST);
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }
}

export const logger = pino(
  {
    level: config.LOG_LEVEL,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  config.LOG_DEST ? pino.destination(config.LOG_DEST) : undefined
);
