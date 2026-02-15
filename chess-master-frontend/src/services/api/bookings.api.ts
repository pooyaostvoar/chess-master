import { apiClient, handleApiError } from "./client";

export interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  status: "free" | "reserved" | "booked" | "paid";
  master?: {
    id: number;
    username: string;
    email: string;
    title?: string | null;
    rating?: number | null;
    profilePicture?: string | null;
    chesscomUrl?: string | null;
    lichessUrl?: string | null;
  };
  reservedBy?: {
    id: number;
    username: string;
    email: string;
    profilePicture?: string | null;
  } | null;
}

/**
 * Get bookings for regular users (slots they reserved)
 */
export const getMyBookings = async (): Promise<{
  success: boolean;
  bookings: Booking[];
}> => {
  try {
    const response = await apiClient.get("/schedule/slot/my-bookings");
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get bookings for masters (slots reserved by others)
 */
export const getMasterBookings = async (): Promise<{
  success: boolean;
  bookings: Booking[];
}> => {
  try {
    const response = await apiClient.get("/schedule/slot/master-bookings");
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};
