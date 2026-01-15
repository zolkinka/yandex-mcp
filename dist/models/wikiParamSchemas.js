"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWikiFileParamsSchema = exports.getWikiFilesParamsSchema = exports.uploadWikiFileParamsSchema = exports.appendWikiContentParamsSchema = exports.deleteWikiPageParamsSchema = exports.updateWikiPageParamsSchema = exports.createWikiPageParamsSchema = exports.getWikiPageByIdParamsSchema = exports.getWikiPageParamsSchema = exports.WikiPageTypeEnum = void 0;
const zod_1 = require("zod");
// Типы страниц Wiki
exports.WikiPageTypeEnum = zod_1.z.enum(["page", "grid", "redirect", "cloud", "wysiwyg"]);
// Схема для получения страницы по slug
exports.getWikiPageParamsSchema = zod_1.z.object({
    slug: zod_1.z.string().describe("Путь к странице (например: users/mypage или homepage)"),
    fields: zod_1.z.string().optional().describe("Дополнительные поля через запятую: content, attributes, breadcrumbs"),
});
// Схема для получения страницы по ID
exports.getWikiPageByIdParamsSchema = zod_1.z.object({
    pageId: zod_1.z.number().int().positive().describe("ID страницы"),
    fields: zod_1.z.string().optional().describe("Дополнительные поля через запятую: content, attributes, breadcrumbs"),
});
// Схема для создания страницы
exports.createWikiPageParamsSchema = zod_1.z.object({
    slug: zod_1.z.string().describe("Путь к странице (например: projects/myproject/docs)"),
    title: zod_1.z.string().min(1).max(255).describe("Заголовок страницы"),
    page_type: exports.WikiPageTypeEnum.optional().describe("Тип страницы: page (обычная), wysiwyg (визуальный редактор), grid (таблица)"),
    content: zod_1.z.string().optional().describe("Контент страницы в формате Markdown или Wikitext"),
});
// Схема для обновления страницы
exports.updateWikiPageParamsSchema = zod_1.z.object({
    pageId: zod_1.z.number().int().positive().describe("ID страницы для обновления"),
    title: zod_1.z.string().min(1).max(255).optional().describe("Новый заголовок страницы"),
    content: zod_1.z.string().optional().describe("Новый контент страницы"),
});
// Схема для удаления страницы
exports.deleteWikiPageParamsSchema = zod_1.z.object({
    pageId: zod_1.z.number().int().positive().describe("ID страницы для удаления"),
});
// Схема для добавления контента к странице
exports.appendWikiContentParamsSchema = zod_1.z.object({
    pageId: zod_1.z.number().int().positive().describe("ID страницы"),
    content: zod_1.z.string().describe("Контент для добавления в конец страницы"),
});
// Схема для загрузки файла на Wiki страницу
exports.uploadWikiFileParamsSchema = zod_1.z.object({
    pageId: zod_1.z.number().int().positive().describe("ID страницы"),
    fileContent: zod_1.z.string().describe("Содержимое файла в формате base64 или Buffer"),
    fileName: zod_1.z.string().describe("Имя файла (например: document.pdf, image.png)"),
});
// Схема для получения списка файлов Wiki страницы
exports.getWikiFilesParamsSchema = zod_1.z.object({
    pageId: zod_1.z.number().int().positive().describe("ID страницы"),
});
// Схема для удаления файла с Wiki страницы
exports.deleteWikiFileParamsSchema = zod_1.z.object({
    pageId: zod_1.z.number().int().positive().describe("ID страницы"),
    fileId: zod_1.z.string().describe("ID файла (получить через getFiles)"),
});
//# sourceMappingURL=wikiParamSchemas.js.map