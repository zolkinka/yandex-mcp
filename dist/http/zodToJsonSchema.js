"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodToJsonSchema = zodToJsonSchema;
const zod_1 = require("zod");
/**
 * Конвертирует Zod схему в JSON Schema
 */
function zodToJsonSchema(schema) {
    // Обрабатываем обертки
    if (schema instanceof zod_1.ZodOptional) {
        return zodToJsonSchema(schema._def.innerType);
    }
    if (schema instanceof zod_1.ZodDefault) {
        const inner = zodToJsonSchema(schema._def.innerType);
        inner.default = schema._def.defaultValue();
        return inner;
    }
    if (schema instanceof zod_1.ZodNullable) {
        const inner = zodToJsonSchema(schema._def.innerType);
        inner.nullable = true;
        return inner;
    }
    // Объект
    if (schema instanceof zod_1.ZodObject) {
        const shape = schema._def.shape();
        const properties = {};
        const required = [];
        for (const [key, value] of Object.entries(shape)) {
            const zodValue = value;
            properties[key] = zodToJsonSchema(zodValue);
            // Добавляем описание из Zod
            const description = zodValue._def.description;
            if (description) {
                properties[key].description = description;
            }
            // Проверяем обязательность поля
            if (!(zodValue instanceof zod_1.ZodOptional) && !(zodValue instanceof zod_1.ZodDefault)) {
                required.push(key);
            }
        }
        const result = {
            type: "object",
            properties
        };
        if (required.length > 0) {
            result.required = required;
        }
        // Добавляем описание объекта
        if (schema._def.description) {
            result.description = schema._def.description;
        }
        return result;
    }
    // Строка
    if (schema instanceof zod_1.ZodString) {
        const result = { type: "string" };
        const checks = schema._def.checks || [];
        for (const check of checks) {
            if (check.kind === "min") {
                result.minLength = check.value;
            }
            else if (check.kind === "max") {
                result.maxLength = check.value;
            }
            else if (check.kind === "regex") {
                result.pattern = check.regex.source;
            }
            else if (check.kind === "email") {
                result.format = "email";
            }
            else if (check.kind === "url") {
                result.format = "uri";
            }
            else if (check.kind === "uuid") {
                result.format = "uuid";
            }
        }
        if (schema._def.description) {
            result.description = schema._def.description;
        }
        return result;
    }
    // Число
    if (schema instanceof zod_1.ZodNumber) {
        const result = { type: "number" };
        const checks = schema._def.checks || [];
        for (const check of checks) {
            if (check.kind === "int") {
                result.type = "integer";
            }
            else if (check.kind === "min") {
                result.minimum = check.value;
            }
            else if (check.kind === "max") {
                result.maximum = check.value;
            }
        }
        if (schema._def.description) {
            result.description = schema._def.description;
        }
        return result;
    }
    // Булево
    if (schema instanceof zod_1.ZodBoolean) {
        const result = { type: "boolean" };
        if (schema._def.description) {
            result.description = schema._def.description;
        }
        return result;
    }
    // Массив
    if (schema instanceof zod_1.ZodArray) {
        const result = {
            type: "array",
            items: zodToJsonSchema(schema._def.type)
        };
        if (schema._def.description) {
            result.description = schema._def.description;
        }
        return result;
    }
    // Enum
    if (schema instanceof zod_1.ZodEnum) {
        const result = {
            type: "string",
            enum: schema._def.values
        };
        if (schema._def.description) {
            result.description = schema._def.description;
        }
        return result;
    }
    // Literal
    if (schema instanceof zod_1.ZodLiteral) {
        const value = schema._def.value;
        const result = {
            type: typeof value,
            enum: [value]
        };
        if (schema._def.description) {
            result.description = schema._def.description;
        }
        return result;
    }
    // Union
    if (schema instanceof zod_1.ZodUnion) {
        const options = schema._def.options;
        const result = {
            anyOf: options.map(opt => zodToJsonSchema(opt))
        };
        if (schema._def.description) {
            result.description = schema._def.description;
        }
        return result;
    }
    // Record
    if (schema instanceof zod_1.ZodRecord) {
        const result = {
            type: "object",
            additionalProperties: zodToJsonSchema(schema._def.valueType)
        };
        if (schema._def.description) {
            result.description = schema._def.description;
        }
        return result;
    }
    // Fallback
    return { type: "object" };
}
//# sourceMappingURL=zodToJsonSchema.js.map