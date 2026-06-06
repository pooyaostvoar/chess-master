import type { CreatePeriodicBatchSlotsInput } from "@chess-master/schemas";
import { apiClient, handleApiError } from "./client";

export function getBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export const parseScheduleFromText = async (
  text: string,
  timeZone: string = getBrowserTimeZone()
): Promise<CreatePeriodicBatchSlotsInput[]> => {
  try {
    const response = await apiClient.post<CreatePeriodicBatchSlotsInput[]>(
      "/chat-bot/schedule",
      { text, timeZone }
    );
    return response.data;
  } catch (error: unknown) {
    throw new Error(handleApiError(error));
  }
};
