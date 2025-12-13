import { apiClient, handleApiError } from "./client";

export interface CreateSlotData {
  startTime: string;
  endTime: string;
}

export interface ScheduleSlot {
  id: number;
  startTime: string;
  endTime: string;
  status: "free" | "reserved" | "booked";
  master?: any;
  reservedBy?: any;
}

/**
 * Create a new schedule slot
 */
export const createSlot = async (
  data: CreateSlotData
): Promise<{ success: boolean; slot: ScheduleSlot }> => {
  try {
    const response = await apiClient.post("/schedule/slot", data);
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get slots for a specific master
 */
export const getSlotsByMaster = async (
  userId: number
): Promise<{ success: boolean; slots: ScheduleSlot[] }> => {
  try {
    const response = await apiClient.get(`/schedule/slot/user/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete slots
 */
export const deleteSlots = async (ids: number[]): Promise<void> => {
  try {
    await apiClient.delete("/schedule/slot", { data: { ids } });
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Reserve/book a slot
 */
export const bookSlot = async (
  slotId: number
): Promise<{ message: string; slot: ScheduleSlot }> => {
  try {
    const response = await apiClient.post(`/schedule/slot/${slotId}/reserve`);
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update slot times (start and end)
 */
export const updateSlot = async (
  slotId: number,
  data: {
    startTime?: string;
    endTime?: string;
    title?: string;
    youtubeId?: string;
  }
): Promise<{ message: string; slot: ScheduleSlot }> => {
  try {
    const response = await apiClient.patch(`/schedule/slot/${slotId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update slot status
 */
export const updateSlotStatus = async (
  slotId: number,
  status: "free" | "reserved" | "booked"
): Promise<{ message: string; slot: ScheduleSlot }> => {
  try {
    const response = await apiClient.patch(`/schedule/slot/${slotId}/status`, {
      status,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const getFinishedEvents = async () => {
  console.log("Fetching finished events...");
  try {
    const response = await apiClient.get(`/schedule/finished-events`);
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const getSlotById = async (slotId: number) => {
  try {
    const response = await apiClient.get(`/schedule/slot/${slotId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};
