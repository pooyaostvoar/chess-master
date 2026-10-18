import { apiClient } from "./client";

export type CommentUser = {
  id: number;
  username: string;
  title: string | null;
  profilePictureThumbnailUrl: string | null;
};

export type MasterComment = {
  id: number;
  text: string;
  masterId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  master: CommentUser;
};

export async function listMasterComments(
  masterId: number
): Promise<MasterComment[]> {
  const res = await apiClient.get<{ items: MasterComment[] }>(
    `/comments?masterId=${masterId}`
  );
  return res.data.items;
}

export async function createMasterComment(payload: {
  masterId: number;
  text: string;
}): Promise<MasterComment> {
  const res = await apiClient.post<MasterComment>("/comments", payload);
  return res.data;
}

export async function updateMasterComment(
  id: number,
  text: string
): Promise<MasterComment> {
  const res = await apiClient.patch<MasterComment>(`/comments/${id}`, { text });
  return res.data;
}

export async function deleteMasterComment(id: number): Promise<void> {
  await apiClient.delete(`/comments/${id}`);
}
