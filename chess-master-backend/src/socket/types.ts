export interface ServerToClientEvents {
  message: (data: {
    id: number;
    from: number;
    text: string;
    createdAt: Date;
    isSeen: boolean;
  }) => void;
  "game-state": (data: {
    gameId: string;
    fen: string;
    moves: any[];
    turn: string;
    isCheck: boolean;
    isCheckmate: boolean;
    isStalemate: boolean;
    isDraw: boolean;
    isGameOver: boolean;
  }) => void;
  "move-made": (data: {
    gameId: string;
    move: any;
    fen: string;
    turn: string;
    isCheck: boolean;
    isCheckmate: boolean;
    isStalemate: boolean;
    isDraw: boolean;
    isGameOver: boolean;
  }) => void;
  "game-error": (data: { message: string }) => void;
  "player-joined": (data: { userId: number }) => void;
  "player-left": (data: { userId: number }) => void;
  "game-over": (data: {
    gameId: string;
    winner: "white" | "black" | null;
    reason: string;
  }) => void;
}

export interface ClientToServerEvents {
  "join-chat": (data: { otherUserId: number }) => void;
  message: (data: { otherUserId: number; text: string }) => void;
  "message:seen": (data: { messageId: number }) => void;
  "join-game": (data: { gameId: string }) => void;
  "leave-game": (data: { gameId: string }) => void;
  "game-move": (data: {
    gameId: string;
    from: string;
    to: string;
    promotion?: string;
  }) => void;
}

interface AuthUser {
  id: number;
}

export interface SocketData {
  user: AuthUser;
}
