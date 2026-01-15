"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueSchema = exports.issueSchemaSimple = void 0;
const zod_1 = require("zod");
const baseSchemas_1 = require("./baseSchemas");
const user_1 = require("./user");
const queue_1 = require("./queue");
exports.issueSchemaSimple = zod_1.z.object({
    id: zod_1.z.string(),
    key: zod_1.z.string()
});
exports.issueSchema = exports.issueSchemaSimple.extend({
    self: zod_1.z.string().url().optional(),
    version: zod_1.z.number().optional(),
    lastCommentUpdatedAt: zod_1.z.string().optional(),
    summary: zod_1.z.string().optional(),
    parent: baseSchemas_1.parentSchema.optional(),
    aliases: zod_1.z.array(zod_1.z.string()).optional(),
    updatedBy: user_1.userSchemaSimple.optional(),
    description: zod_1.z.string().optional(),
    sprint: zod_1.z.array(user_1.userSchemaSimple).optional(),
    type: baseSchemas_1.issueTypeSchema.optional(),
    priority: baseSchemas_1.prioritySchema.optional(),
    createdAt: zod_1.z.string().optional(),
    followers: zod_1.z.array(user_1.userSchemaSimple).optional(),
    createdBy: user_1.userSchemaSimple.optional(),
    votes: zod_1.z.number().optional(),
    assignee: user_1.userSchemaSimple.optional(),
    project: baseSchemas_1.projectSchema.optional(),
    queue: queue_1.queueSchema.optional(),
    updatedAt: zod_1.z.string().optional(),
    status: baseSchemas_1.statusSchema.optional(),
    previousStatus: baseSchemas_1.statusSchema.optional(),
    favorite: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=issue.js.map