import { apiClient, handleApiError } from "./client";
import type {
  DeleteBatchSlotResponse,
  GetMasterSlotsResponse,
  UpdatePeriodicBatchSlotInput,
  UpdatePeriodicBatchSlotResponse,
} from "@chess-master/schemas";

export interface CreateSlotData {
  startTime: string;
  endTime: string;
}

export interface ScheduleSlot {
  id: number;
  /** ISO string from JSON or `Date` when aligned with `scheduleSlotSchema` / `GetMasterSlotsResponse` */
  startTime: string | Date;
  endTime: string | Date;
  status: "free" | "reserved" | "booked" | "paid";
  title?: string | null;
  description?: string | null;
  youtubeId?: string | null;
  price?: number | null;
  master?: any;
  reservedBy?: any;
  chunkIndex?: number | null;
  periodicSlotConfig?: PeriodicSlotConfigSummary | null;
}

export interface CreatePeriodicBatchSlotsInput {
  interval: {
    start: string;
    end: string;
  };
  chunkSizeMinutes?: number;
  period: "daily" | "weekly" | "monthly";
  repeatCount?: number;
  title?: string | null;
  description?: string | null;
  price?: number | null;
  youtubeId?: string | null;
}

export interface PeriodicSlotConfigSummary {
  id: number;
  chunkSizeMinutes: number;
  period: "daily" | "weekly" | "monthly";
  repeatCount: number;
}

export interface CreatePeriodicBatchSlotsResponse {
  success: boolean;
  createdSlots: number;
  slots: ScheduleSlot[];
  periodicSlotConfig?: PeriodicSlotConfigSummary;
}

function normalizePeriodicBatchSlotRow(row: Record<string, unknown>): ScheduleSlot {
  const id = Number(row.id ?? row.Id);
  const startRaw = row.startTime ?? row.starttime;
  const endRaw = row.endTime ?? row.endtime;
  const statusRaw = (row.status ?? row.Status ?? "free") as string;
  return {
    id,
    startTime:
      startRaw instanceof Date
        ? startRaw.toISOString()
        : String(startRaw ?? ""),
    endTime:
      endRaw instanceof Date ? endRaw.toISOString() : String(endRaw ?? ""),
    status: statusRaw as ScheduleSlot["status"],
    title: (row.title as string | null | undefined) ?? null,
    description: (row.description as string | null | undefined) ?? null,
    youtubeId: (row.youtubeId as string | null | undefined) ?? null,
    price:
      row.price != null && row.price !== ""
        ? Number(row.price)
        : null,
  };
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
 * Create many slots from a time range (periodic bulk insert)
 */
export const createPeriodicBatchSlots = async (
  data: CreatePeriodicBatchSlotsInput
): Promise<CreatePeriodicBatchSlotsResponse> => {
  try {
    const response = await apiClient.post(
      "/schedule/slot/create-periodic-batch-slots",
      data
    );
    const raw = response.data?.slots ?? [];
    const slots = Array.isArray(raw)
      ? raw.map((row: Record<string, unknown>) =>
          normalizePeriodicBatchSlotRow(row)
        )
      : [];
    return {
      success: Boolean(response.data?.success),
      createdSlots: Number(response.data?.createdSlots ?? slots.length),
      slots,
      periodicSlotConfig: response.data?.periodicSlotConfig,
    };
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get slots for a specific master (API body matches `getMasterSlotsResponseSchema` / `scheduleSlotSchema`)
 */
export const getSlotsByMaster = async (
  userId: number
): Promise<GetMasterSlotsResponse> => {
  try {
    const response = await apiClient.get(`/schedule/slot/user/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Future free slots for a master (public booking surface)
 */
export const getMasterActiveSlots = async (
  userId: number
): Promise<{ success: boolean; slots: ScheduleSlot[] }> => {
  try {
    const response = await apiClient.get(
      `/schedule/slot/user/${userId}/active`
    );
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
 * Delete one slot and all slots sharing the same periodic config + chunk index
 */
export const deleteBatchSlots = async (
  slotId: number
): Promise<DeleteBatchSlotResponse> => {
  try {
    const response = await apiClient.post("/schedule/slot/delete-batch", {
      slotId,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update one slot or all slots in the same periodic chunk (same as delete-batch grouping)
 */
export const updatePeriodicBatchSlots = async (
  data: UpdatePeriodicBatchSlotInput
): Promise<UpdatePeriodicBatchSlotResponse> => {
  try {
    const response = await apiClient.post(
      "/schedule/slot/update-periodic-batch-slots",
      data
    );
    return response.data;
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
    price?: number | null;
    description?: string | null;
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
  try {
    const response = await apiClient.get(`/schedule/finished-events`);

    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const getUpcomingEvents = async (limit?: number | null) => {
  try {
    const response = await apiClient.get(
      `/schedule/upcoming-events${limit ? `?limit=${limit}` : ""}`
    );

    return response.data.events;
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
