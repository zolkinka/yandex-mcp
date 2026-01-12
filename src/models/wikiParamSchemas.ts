import { z } from "zod";

// Типы страниц Wiki
export const WikiPageTypeEnum = z.enum(["page", "grid", "redirect", "cloud", "wysiwyg"]);

// Схема для получения страницы по slug
export const getWikiPageParamsSchema = z.object({
  slug: z.string().describe("Путь к странице (например: users/mypage или homepage)"),
  fields: z.string().optional().describe("Дополнительные поля через запятую: content, attributes, breadcrumbs"),
});

// Схема для получения страницы по ID
export const getWikiPageByIdParamsSchema = z.object({
  pageId: z.number().int().positive().describe("ID страницы"),
  fields: z.string().optional().describe("Дополнительные поля через запятую: content, attributes, breadcrumbs"),
});

// Схема для создания страницы
export const createWikiPageParamsSchema = z.object({
  slug: z.string().describe("Путь к странице (например: projects/myproject/docs)"),
  title: z.string().min(1).max(255).describe("Заголовок страницы"),
  page_type: WikiPageTypeEnum.optional().describe("Тип страницы: page (обычная), wysiwyg (визуальный редактор), grid (таблица)"),
  content: z.string().optional().describe("Контент страницы в формате Markdown или Wikitext"),
});

// Схема для обновления страницы
export const updateWikiPageParamsSchema = z.object({
  pageId: z.number().int().positive().describe("ID страницы для обновления"),
  title: z.string().min(1).max(255).optional().describe("Новый заголовок страницы"),
  content: z.string().optional().describe("Новый контент страницы"),
});

// Схема для удаления страницы
export const deleteWikiPageParamsSchema = z.object({
  pageId: z.number().int().positive().describe("ID страницы для удаления"),
});

// Схема для добавления контента к странице
export const appendWikiContentParamsSchema = z.object({
  pageId: z.number().int().positive().describe("ID страницы"),
  content: z.string().describe("Контент для добавления в конец страницы"),
});

// Схема для загрузки файла на Wiki страницу
export const uploadWikiFileParamsSchema = z.object({
  pageId: z.number().int().positive().describe("ID страницы"),
  fileContent: z.string().describe("Содержимое файла в формате base64 или Buffer"),
  fileName: z.string().describe("Имя файла (например: document.pdf, image.png)"),
});

// Схема для получения списка файлов Wiki страницы
export const getWikiFilesParamsSchema = z.object({
  pageId: z.number().int().positive().describe("ID страницы"),
});

// Схема для удаления файла с Wiki страницы
export const deleteWikiFileParamsSchema = z.object({
  pageId: z.number().int().positive().describe("ID страницы"),
  fileId: z.string().describe("ID файла (получить через getFiles)"),
});
