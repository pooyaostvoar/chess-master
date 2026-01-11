import { apiClient, handleApiError } from "./client";

export interface Game {
  id: string;
  whitePlayerId: number;
  blackPlayerId: number | null;
  moves: {
    from: string;
    to: string;
    piece: string;
  }[];
  createdAt: string;
  updatedAt: string;
  finished: boolean;
}

export const createGame = async (
  color: "white" | "black" | "random"
): Promise<{
  status: string;
  game: Game;
}> => {
  try {
    const response = await apiClient.post("/games", { color });
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const getGameById = async (
  gameId: string
): Promise<{
  status: string;
  game: Game;
}> => {
  try {
    const response = await apiClient.get(`/games/${gameId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export const joinGame = async (
  gameId: string
): Promise<{
  status: string;
  game: Game;
}> => {
  try {
    const response = await apiClient.post(`/games/${gameId}/join`);
    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};
