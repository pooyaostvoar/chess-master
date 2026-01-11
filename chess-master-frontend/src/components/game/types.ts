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

export interface GameStatus {
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  turn: string;
}

export interface GameStateUpdate {
  fen: string;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  turn: string;
}

export interface MoveMadeData {
  gameId: string;
  move: {
    from: string;
    to: string;
    piece: string;
    captured?: string;
    promotion?: string;
    flags: string;
    san: string;
  };
  fen: string;
  turn: string;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
}

export interface GameOverData {
  gameId: string;
  winner: "white" | "black" | null;
  reason: string;
}

export interface GameErrorData {
  message: string;
}

export interface PlayerJoinedData {
  userId: number;
}
