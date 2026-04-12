import { apiClient } from "./client";

export interface UnreadSender {
  userId: number;
  unreadCount: number;
  username: string;
  profilePictureThumbnailUrl: string | null;
}

export const getUnreadSenders = async (
  userId: number
): Promise<UnreadSender[]> => {
  const response = await apiClient.get(`/messages/unread-senders`, {
    params: { userId },
  });
  return response.data;
};
