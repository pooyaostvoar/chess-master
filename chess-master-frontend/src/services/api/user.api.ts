import { apiClient, handleApiError } from "./client";

export interface LichessPerf {
  rating: number;
  games?: number;
  rd?: number;
  prog?: number;
  prov?: boolean;
  rank?: number;
}

export type LichessRatings = Record<string, LichessPerf>;

export interface UpdateUserData {
  email?: string;
  username?: string;
  title?: string | null;
  rating?: number | null;
  bio?: string | null;
  isMaster?: boolean;
  chesscomUrl?: string | null;
  lichessUrl?: string | null;
  lichessRatings?: LichessRatings | null;
  hourlyRate?: number | null;
  languages?: string[] | null;
  teachingFocuses?: string[] | null;
  phoneNumber?: string | null;
  twitchUrl?: string | null;
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  xUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  title?: string | null;
  rating?: number | null;
  bio?: string | null;
  isMaster: boolean;
  profilePictureUrl?: string | null;
  profilePictureThumbnailUrl?: string | null;
  chesscomUrl?: string | null;
  lichessUrl?: string | null;
  lichessRatings?: LichessRatings | null;
  hourlyRate?: number | null;
  languages?: string[] | null;
  teachingFocuses?: string[] | null;
  twitchUrl?: string | null;
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  xUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
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
  limit?: number;
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

export const uploadProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await apiClient.post(`/users/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!res.data.success) throw new Error("Upload failed");
  return res.data;
};
