import { z } from "zod";
import { userSchemaBase } from "./user";

const optionalQueryValue = (value: unknown) =>
  value === "" || value === undefined || value === null ? undefined : value;

export const commentCreateSchema = z.object({
  masterId: z.number().int().positive(),
  text: z.string().trim().min(1, "Comment is required").max(2000),
});

export const adminCommentCreateSchema = commentCreateSchema
  .extend({
    userId: z.number().int().positive().optional(),
    username: z.string().trim().min(1).max(80).optional(),
  })
  .refine((comment) => comment.userId !== undefined || !!comment.username, {
    message: "userId or username is required",
  });

export const adminCommentCreateListSchema = z.object({
  comments: z.array(adminCommentCreateSchema).min(1).max(100),
});

export const commentUpdateSchema = z.object({
  text: z.string().trim().min(1, "Comment is required").max(2000),
});

export const adminCommentUpdateSchema = z.object({
  id: z.number().int().positive(),
  text: z.string().trim().min(1, "Comment is required").max(2000),
  userId: z.number().int().positive().optional(),
  masterId: z.number().int().positive().optional(),
});

export const adminCommentUpdateListSchema = z.object({
  comments: z
    .array(adminCommentUpdateSchema)
    .min(1)
    .max(100)
    .refine((items) => new Set(items.map((item) => item.id)).size === items.length, {
      message: "Duplicate comment id",
    }),
});

export const commentIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const commentListQuerySchema = z.object({
  masterId: z.coerce.number().int().positive(),
});

export const adminCommentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  q: z.preprocess(optionalQueryValue, z.string().trim().min(1).optional()),
  masterId: z.preprocess(
    optionalQueryValue,
    z.coerce.number().int().positive().optional()
  ),
});

export const commentUserSchema = userSchemaBase.pick({
  id: true,
  username: true,
  title: true,
  profilePictureThumbnailUrl: true,
});

export const commentSchema = z.object({
  id: z.number().int().positive(),
  text: z.string(),
  masterId: z.number().int().positive(),
  userId: z.number().int().positive(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  user: commentUserSchema,
  master: commentUserSchema,
});

export const commentListSchema = z.object({
  items: z.array(commentSchema),
});

export const adminCommentListSchema = z.object({
  items: z.array(commentSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export const commentDeletedSchema = z.object({
  message: z.literal("Comment deleted"),
});

export const commentErrorSchema = z.object({
  message: z.string(),
  errors: z
    .object({
      formErrors: z.array(z.string()),
      fieldErrors: z.record(z.string(), z.array(z.string())),
    })
    .optional(),
});

export type CommentCreate = z.infer<typeof commentCreateSchema>;
export type AdminCommentCreate = z.infer<typeof adminCommentCreateSchema>;
export type AdminCommentCreateList = z.infer<typeof adminCommentCreateListSchema>;
export type AdminCommentUpdateList = z.infer<typeof adminCommentUpdateListSchema>;
export type CommentUpdate = z.infer<typeof commentUpdateSchema>;
export type CommentRecord = z.infer<typeof commentSchema>;
