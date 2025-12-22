import { z } from "zod";

export const userSchemaBase = z.object({
  id: z.number().int().positive(),

  email: z.string(),

  username: z.string(),

  isMaster: z.boolean().default(false),

  title: z.string().nullable(),

  rating: z.number().int().nullable(),

  bio: z.string().nullable(),

  profilePicture: z.url().nullable(),

  chesscomUrl: z.string().nullable(),

  lichessUrl: z.string().nullable(),

  schedule: z.array(z.any()).nullish(),

  hourlyRate: z.number().nullish(),
});

export const userListSchema = z.array(userSchemaBase);

export const userQuerySchema = z.object({
  username: z.string().min(1).optional(),
  email: z.string().optional(),
  title: z.string().min(1).optional(),

  isMaster: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),

  minRating: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10))
    .optional(),

  maxRating: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10))
    .optional(),
});
