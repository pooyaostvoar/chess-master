export type SlotPeriod = "daily" | "weekly" | "monthly";

export interface CreateSlotConfirmPayload {
  recurring: boolean;
  period: SlotPeriod;
  repeatCount: number;
  /** Minutes per slot when splitting the selected range (recurring only). Default 60. */
  chunkSizeMinutes?: number;
  title: string | null;
  description: string | null;
  price: number | null;
  youtubeId: string | null;
}
