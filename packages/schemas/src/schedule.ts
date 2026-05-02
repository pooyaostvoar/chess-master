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

/** Bulk-create metadata saved on `schedule_slots.periodicSlotConfig` */
export const periodicSlotConfigSchema = z.object({
  id: z.number().int().positive(),
  chunkSizeMinutes: z.number().int().positive(),
  period: z.nativeEnum(Period),
  repeatCount: z.number().int().positive(),
});

export type PeriodicSlotConfigShape = z.infer<typeof periodicSlotConfigSchema>;

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

  /** Chunk position within one occurrence of the interval (0-based; resets each repeat). */
  chunkIndex: z.number().int().min(0).nullish(),

  periodicSlotConfig: periodicSlotConfigSchema.nullish(),
});

export type ScheduleSlot = z.infer<typeof scheduleSlotSchema>;

/** GET /schedule/slot/user/:userId — full slots for master calendar */
export const getMasterSlotsResponseSchema = z.object({
  success: z.boolean(),
  slots: z.array(scheduleSlotSchema),
});

export type GetMasterSlotsResponse = z.infer<
  typeof getMasterSlotsResponseSchema
>;

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

/** POST /schedule/slot/create-periodic-batch-slots */
export const createPeriodicBatchSlotsInputSchema = z
  .object({
    interval: z.object({
      start: z.coerce.date(),
      end: z.coerce.date(),
    }),
    chunkSizeMinutes: z.number().positive().default(60),
    period: z.nativeEnum(Period).default(Period.Weekly),
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

export type CreatePeriodicBatchSlotsInput = z.infer<
  typeof createPeriodicBatchSlotsInputSchema
>;

/** POST /schedule/slot/delete-batch */
export const deleteBatchSlotInputSchema = z.object({
  slotId: z.number().int().positive(),
});

export type DeleteBatchSlotInput = z.infer<typeof deleteBatchSlotInputSchema>;

export const deleteBatchSlotResponseSchema = z.object({
  success: z.boolean().default(true),
  deletedIds: z.array(z.number().int().positive()),
  deletedCount: z.number().int().nonnegative(),
});

export type DeleteBatchSlotResponse = z.infer<
  typeof deleteBatchSlotResponseSchema
>;

/** POST /schedule/slot/update-periodic-batch-slots */
export const updatePeriodicBatchSlotInputSchema = z
  .object({
    slotId: z.number().int().positive(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    title: z.string().nullable().optional(),
    youtubeId: z.string().nullable().optional(),
    price: z.number().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const hasUpdate =
      data.startTime !== undefined ||
      data.endTime !== undefined ||
      data.title !== undefined ||
      data.youtubeId !== undefined ||
      data.price !== undefined;
    if (!hasUpdate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one field to update is required",
      });
    }
    const hasStart = data.startTime !== undefined;
    const hasEnd = data.endTime !== undefined;
    if (hasStart !== hasEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: hasStart ? ["endTime"] : ["startTime"],
        message:
          "startTime and endTime must both be provided when updating times",
      });
    }
  });

export type UpdatePeriodicBatchSlotInput = z.infer<
  typeof updatePeriodicBatchSlotInputSchema
>;

/** Response slot shape — omits user relations. */
export const updatePeriodicBatchSlotItemSchema = scheduleSlotSchema.omit({
  master: true,
  reservedBy: true,
});

export type UpdatePeriodicBatchSlotItem = z.infer<
  typeof updatePeriodicBatchSlotItemSchema
>;

export const updatePeriodicBatchSlotResponseSchema = z.object({
  success: z.boolean().default(true),
  updatedCount: z.number().int().nonnegative(),
  slots: z.array(updatePeriodicBatchSlotItemSchema),
});

export type UpdatePeriodicBatchSlotResponse = z.infer<
  typeof updatePeriodicBatchSlotResponseSchema
>;
