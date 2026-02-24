import { z } from "zod";

export const userSchemaBase = z.object({
  id: z.number().int().positive(),

  email: z.string(),

  username: z.string(),

  isMaster: z.boolean().default(false),

  title: z.string().nullish(),

  rating: z.number().int().nullish(),

  bio: z.string().nullish(),

  profilePicture: z.url().nullish(),

  chesscomUrl: z.string().nullish(),

  lichessUrl: z.string().nullish(),

  schedule: z.array(z.any()).nullish(),

  hourlyRate: z.number().nullish(),

  languages: z.array(z.string()).nullish(),

  phoneNumber: z.string().nullish(),
});

export const userListSchema = z.array(userSchemaBase);

export const userQuerySchema = z.object({
  username: z.string().min(1).optional(),
  email: z.string().optional(),
  title: z.string().min(1).optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10))
    .optional(),

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
