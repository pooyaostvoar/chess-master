import { z } from "zod";
import { userSchemaBase } from "./user";

export enum SlotStatus {
  Free = "free",
  Booked = "booked",
  Reserved = "reserved",
  Paid = "paid",
}

export enum Period {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
}

export const slotStatusSchema = z.nativeEnum(SlotStatus);

export const scheduleSlotSchema = z.object({
  id: z.number().int().positive(),

  master: userSchemaBase,

  startTime: z.coerce.date(),

  endTime: z.coerce.date(),

  status: slotStatusSchema.default(SlotStatus.Free),

  title: z.string().nullable(),

  youtubeId: z.string().nullable(),

  reservedBy: userSchemaBase.nullish(),

  price: z.number().nullish(),
});

/** Single slot returned by GET /schedule/slot/user/:userId/active */
export const activeSlotItemSchema = z.object({
  id: z.number().int().positive(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  status: slotStatusSchema,
  title: z.string().nullable(),
  price: z.number().nullable(),
});

/** Response body for GET /schedule/slot/user/:userId/active */
export const activeSlotsOutputSchema = z.object({
  success: z.boolean().default(true),
  slots: z.array(activeSlotItemSchema),
});

export type ActiveSlotItem = z.infer<typeof activeSlotItemSchema>;
export type ActiveSlotsOutput = z.infer<typeof activeSlotsOutputSchema>;

export const createBatchSlotsInputSchema = z
  .object({
    interval: z.object({
      start: z.coerce.date(),
      end: z.coerce.date(),
    }),
    chunkSizeMinutes: z.number().positive().default(60),
    period: z.nativeEnum(Period),
    repeatCount: z.number().int().positive().default(50),
  })
  .superRefine((value, ctx) => {
    if (value.interval.start >= value.interval.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["interval", "start"],
        message: "interval.start must be before interval.end",
      });
    }
  });

export type CreateBatchSlotsInput = z.infer<typeof createBatchSlotsInputSchema>;
