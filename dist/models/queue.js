"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpandQueueEnum = exports.queueSchema = exports.queueSchemaSimple = void 0;
const zod_1 = require("zod");
const baseSchemas_1 = require("./baseSchemas");
const user_1 = require("./user");
exports.queueSchemaSimple = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    key: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    lead: user_1.userSchemaSimple.optional(),
});
exports.queueSchema = exports.queueSchemaSimple.extend({
    self: zod_1.z.string().optional(),
    version: zod_1.z.number().optional(),
    description: zod_1.z.string().optional(),
    assignAuto: zod_1.z.boolean().optional(),
    defaultType: baseSchemas_1.defaultTypeSchema.optional(),
    defaultPriority: baseSchemas_1.defaultTypeSchema.optional(),
    teamUsers: zod_1.z.array(user_1.userSchemaSimple).optional(),
    issueTypes: zod_1.z.array(baseSchemas_1.defaultTypeSchema).optional(),
    versions: zod_1.z.array(baseSchemas_1.versionSchema).optional(),
    workflows: baseSchemas_1.workflowItemSchema.optional(),
    denyVoting: zod_1.z.boolean().optional(),
    issueTypesConfig: zod_1.z.array(baseSchemas_1.issueTypeConfigSchema).optional(),
});
exports.ExpandQueueEnum = zod_1.z.enum([
    "projects",
    "components",
    "versions",
    "types",
    "team",
    "workflows",
]);
//# sourceMappingURL=queue.js.map