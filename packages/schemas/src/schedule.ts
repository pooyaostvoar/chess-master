import { z } from "zod";
import { userSchemaBase } from "./user";

export enum SlotStatus {
  Free = "free",
  Booked = "booked",
  Reserved = "reserved",
  Paid = "paid",
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
