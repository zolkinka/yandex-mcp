"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeSchema = exports.projectSchema = exports.prioritySchema = exports.statusSchema = exports.issueTypeConfigSchema = exports.workflowItemSchema = exports.versionSchema = exports.issueTypeSchema = exports.defaultTypeSchema = exports.parentSchema = void 0;
const zod_1 = require("zod");
exports.parentSchema = zod_1.z.object({
    self: zod_1.z.string().optional(),
    id: zod_1.z.string(),
    key: zod_1.z.string(),
    display: zod_1.z.string().optional(),
});
exports.defaultTypeSchema = zod_1.z.object({
    self: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    key: zod_1.z.string(),
    display: zod_1.z.string().optional(),
});
exports.issueTypeSchema = exports.defaultTypeSchema.extend({
    version: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
exports.versionSchema = zod_1.z.object({
    self: zod_1.z.string().optional(),
    id: zod_1.z.string(),
    display: zod_1.z.string().optional(),
});
exports.workflowItemSchema = zod_1.z.object({
    dev: zod_1.z.array(exports.defaultTypeSchema).optional(),
});
exports.issueTypeConfigSchema = zod_1.z.object({
    issueType: exports.issueTypeSchema.optional(),
    workflow: exports.versionSchema.optional(),
    resolutions: zod_1.z.array(exports.defaultTypeSchema).optional(),
});
exports.statusSchema = zod_1.z.object({
    self: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    key: zod_1.z.string().optional(),
    display: zod_1.z.string().optional(),
    version: zod_1.z.number().optional(),
    name: zod_1.z.string().optional(),
    order: zod_1.z.number().optional(),
    type: zod_1.z.string().optional(),
});
exports.prioritySchema = zod_1.z.object({
    self: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    key: zod_1.z.string().optional(),
    display: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    order: zod_1.z.number().optional(),
});
exports.projectSchema = zod_1.z.object({
    primary: zod_1.z
        .object({
        self: zod_1.z.string().optional(),
        id: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })
        .nullable().optional(),
    secondary: zod_1.z.array(zod_1.z.object({})).optional(),
});
exports.typeSchema = zod_1.z.object({
    self: zod_1.z.string().optional(),
    id: zod_1.z.string(),
    key: zod_1.z.string(),
    display: zod_1.z.string().optional(),
});
//# sourceMappingURL=baseSchemas.js.map