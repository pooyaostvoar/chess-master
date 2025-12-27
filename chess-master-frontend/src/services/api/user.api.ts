import { apiClient, handleApiError } from "./client";

export interface UpdateUserData {
  email?: string;
  username?: string;
  title?: string | null;
  rating?: number | null;
  bio?: string | null;
  isMaster?: boolean;
  profilePicture?: string | null;
  chesscomUrl?: string | null;
  lichessUrl?: string | null;
  hourlyRate?: number | null;
  languages?: string[] | null;
  phoneNumber?: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  title?: string | null;
  rating?: number | null;
  bio?: string | null;
  isMaster: boolean;
  profilePicture?: string | null;
  chesscomUrl?: string | null;
  lichessUrl?: string | null;
  hourlyRate?: number | null;
  languages?: string[] | null;
}

/**
 * Get current authenticated user
 */
export const getMe = async (): Promise<{ user: User }> => {
  try {
    const response = await apiClient.get("/users/me");
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update user profile
 */
export const updateUser = async (
  id: number,
  data: UpdateUserData
): Promise<{ status: string; user: User }> => {
  try {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Find users with filters
 */
export const findUsers = async (filters: {
  isMaster?: boolean;
  username?: string;
  minRating?: number;
  maxRating?: number;
  title?: string;
}): Promise<{ status: string; users: User[] }> => {
  try {
    const response = await apiClient.get("/users", { params: filters });
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const getPublicUser = async (userId: number) => {
  const res = await apiClient.get(`/users/${userId}`);
  if (!res.data.user) throw new Error("User not found");
  return res.data.user;
};
