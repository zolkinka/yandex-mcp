import pino from "pino";
import { config } from "./config";


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
