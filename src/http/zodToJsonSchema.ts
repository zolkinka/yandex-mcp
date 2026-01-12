import { z, ZodTypeAny, ZodObject, ZodOptional, ZodDefault, ZodArray, ZodEnum, ZodUnion, ZodNullable, ZodNumber, ZodString, ZodBoolean, ZodRecord, ZodLiteral } from "zod";

interface JsonSchema {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  description?: string;
  default?: any;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  additionalProperties?: JsonSchema | boolean;
  nullable?: boolean;
}

/**
 * Конвертирует Zod схему в JSON Schema
 */
export function zodToJsonSchema(schema: ZodTypeAny): JsonSchema {
  // Обрабатываем обертки
  if (schema instanceof ZodOptional) {
    return zodToJsonSchema(schema._def.innerType);
  }

  if (schema instanceof ZodDefault) {
    const inner = zodToJsonSchema(schema._def.innerType);
    inner.default = schema._def.defaultValue();
    return inner;
  }

  if (schema instanceof ZodNullable) {
    const inner = zodToJsonSchema(schema._def.innerType);
    inner.nullable = true;
    return inner;
  }

  // Объект
  if (schema instanceof ZodObject) {
    const shape = schema._def.shape();
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as ZodTypeAny;
      properties[key] = zodToJsonSchema(zodValue);
      
      // Добавляем описание из Zod
      const description = zodValue._def.description;
      if (description) {
        properties[key].description = description;
      }

      // Проверяем обязательность поля
      if (!(zodValue instanceof ZodOptional) && !(zodValue instanceof ZodDefault)) {
        required.push(key);
      }
    }

    const result: JsonSchema = {
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
  if (schema instanceof ZodString) {
    const result: JsonSchema = { type: "string" };
    
    const checks = schema._def.checks || [];
    for (const check of checks) {
      if (check.kind === "min") {
        result.minLength = check.value;
      } else if (check.kind === "max") {
        result.maxLength = check.value;
      } else if (check.kind === "regex") {
        result.pattern = check.regex.source;
      } else if (check.kind === "email") {
        result.format = "email";
      } else if (check.kind === "url") {
        result.format = "uri";
      } else if (check.kind === "uuid") {
        result.format = "uuid";
      }
    }

    if (schema._def.description) {
      result.description = schema._def.description;
    }

    return result;
  }

  // Число
  if (schema instanceof ZodNumber) {
    const result: JsonSchema = { type: "number" };
    
    const checks = schema._def.checks || [];
    for (const check of checks) {
      if (check.kind === "int") {
        result.type = "integer";
      } else if (check.kind === "min") {
        result.minimum = check.value;
      } else if (check.kind === "max") {
        result.maximum = check.value;
      }
    }

    if (schema._def.description) {
      result.description = schema._def.description;
    }

    return result;
  }

  // Булево
  if (schema instanceof ZodBoolean) {
    const result: JsonSchema = { type: "boolean" };
    
    if (schema._def.description) {
      result.description = schema._def.description;
    }

    return result;
  }

  // Массив
  if (schema instanceof ZodArray) {
    const result: JsonSchema = {
      type: "array",
      items: zodToJsonSchema(schema._def.type)
    };

    if (schema._def.description) {
      result.description = schema._def.description;
    }

    return result;
  }

  // Enum
  if (schema instanceof ZodEnum) {
    const result: JsonSchema = {
      type: "string",
      enum: schema._def.values
    };

    if (schema._def.description) {
      result.description = schema._def.description;
    }

    return result;
  }

  // Literal
  if (schema instanceof ZodLiteral) {
    const value = schema._def.value;
    const result: JsonSchema = {
      type: typeof value as string,
      enum: [value]
    };

    if (schema._def.description) {
      result.description = schema._def.description;
    }

    return result;
  }

  // Union
  if (schema instanceof ZodUnion) {
    const options = schema._def.options as ZodTypeAny[];
    const result: JsonSchema = {
      anyOf: options.map(opt => zodToJsonSchema(opt))
    };

    if (schema._def.description) {
      result.description = schema._def.description;
    }

    return result;
  }

  // Record
  if (schema instanceof ZodRecord) {
    const result: JsonSchema = {
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
