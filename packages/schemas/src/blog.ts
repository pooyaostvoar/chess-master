import { z } from "zod";

export const blogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  contentHtml: z.string(),
  imageUrl: z.string().nullish(),
});

export const blogPostCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().optional(),
  contentHtml: z.string(),
  imageUrl: z.string().nullish(),
});

export const blogPostUpdateSchema = blogPostCreateSchema.partial();

export type BlogPost = z.infer<typeof blogPostSchema>;
export type BlogPostCreate = z.infer<typeof blogPostCreateSchema>;
export type BlogPostUpdate = z.infer<typeof blogPostUpdateSchema>;
