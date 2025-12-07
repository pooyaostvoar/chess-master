import { z } from "zod";

export const masterPricingSchema = z.object({
  id: z.number().int().positive(),
  masterId: z.number().int().positive(),
  price5min: z.number().int().nullable().optional(),
  price10min: z.number().int().nullable().optional(),
  price15min: z.number().int().nullable().optional(),
  price30min: z.number().int().nullable().optional(),
  price45min: z.number().int().nullable().optional(),
  price60min: z.number().int().nullable().optional(),
});

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

  pricing: masterPricingSchema.nullable(),

  schedule: z.array(z.any()).nullish(),
});

export const userListSchema = z.array(userSchemaBase);
