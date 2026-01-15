"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = exports.userSchemaSimple = void 0;
const zod_1 = require("zod");
// Простая схема без transform
const userSchemaSimpleBase = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    uid: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    display: zod_1.z.string(),
});
exports.userSchemaSimple = userSchemaSimpleBase.transform((user) => ({
    ...user,
    id: user.id ?? user.uid,
    uid: user.id ?? user.uid,
}));
// Сложная схема на основе простой (расширяем базу, потом transform)
const userSchemaBase = userSchemaSimpleBase.extend({
    self: zod_1.z.string().optional(),
    login: zod_1.z.string().optional(),
    trackerUid: zod_1.z.number().optional(),
    passportUid: zod_1.z.number().optional(),
    cloudUid: zod_1.z.string().optional(),
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    hasLicense: zod_1.z.boolean().optional(),
    dismissed: zod_1.z.boolean().optional(),
    disableNotifications: zod_1.z.boolean().optional(),
    firstLoginDate: zod_1.z.string().optional(),
    lastLoginDate: zod_1.z.string().optional(),
    welcomeMailSent: zod_1.z.boolean().optional(),
});
exports.userSchema = userSchemaBase.transform((user) => ({
    ...user,
    id: user.id ?? user.uid,
    uid: user.id ?? user.uid,
}));
//# sourceMappingURL=user.js.map