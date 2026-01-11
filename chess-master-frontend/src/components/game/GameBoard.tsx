import React, { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../../services/config";
import { useUser } from "../../contexts/UserContext";
import { Game } from "./types";

interface GameBoardProps {
  game: Game;
  onPieceDrop?: ({
    piece,
    sourceSquare,
    targetSquare,
  }: {
    piece: any;
    sourceSquare: string;
    targetSquare: string | null;
  }) => boolean;
  position?: string;
  setPosition?: React.Dispatch<React.SetStateAction<string>>;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  game,
  position,
  onPieceDrop,
}) => {
  // const chessRef = useRef<Chess>(new Chess());
  const { user } = useUser();
  // const socketRef = useRef<Socket | null>(null);
  // const [position, setPosition] = useState(chessRef.current.fen());
  // const [error, setError] = useState<string | null>(null);
  // const [gameStatus, setGameStatus] = useState<{
  //   isCheck: boolean;
  //   isCheckmate: boolean;
  //   isStalemate: boolean;
  //   isDraw: boolean;
  //   turn: string;
  // }>({
  //   isCheck: false,
  //   isCheckmate: false,
  //   isStalemate: false,
  //   isDraw: false,
  //   turn: "w",
  // });

  // useEffect(() => {
  // Create socket connection with credentials
  //   const socket = io(SOCKET_URL, { withCredentials: true });

  //   socketRef.current = socket;

  //   // Wait for connection before joining game
  //   socket.on("connect", () => {
  //     console.log("Socket connected:", socket.id);
  //     // Join the game room
  //     socket.emit("join-game", { gameId: game.id });
  //   });

  //   // Listen for initial game state from server
  //   socket.on("game-state", (data) => {
  //     const chess = new Chess(data.fen);
  //     chessRef.current = chess;
  //     setPosition(data.fen);
  //     setGameStatus({
  //       isCheck: data.isCheck,
  //       isCheckmate: data.isCheckmate,
  //       isStalemate: data.isStalemate,
  //       isDraw: data.isDraw,
  //       turn: data.turn,
  //     });
  //     setError(null);
  //   });

  //   // Listen for moves from other players
  //   socket.on("move-made", (data) => {
  //     const chess = new Chess(data.fen);
  //     chessRef.current = chess;
  //     setPosition(data.fen);
  //     setGameStatus({
  //       isCheck: data.isCheck,
  //       isCheckmate: data.isCheckmate,
  //       isStalemate: data.isStalemate,
  //       isDraw: data.isDraw,
  //       turn: data.turn,
  //     });
  //     setError(null);
  //   });

  //   // Listen for errors
  //   socket.on("game-error", (data) => {
  //     setError(data.message);
  //     // Reset to last valid position
  //     setPosition(chessRef.current.fen());
  //   });

  //   // Listen for player joined
  //   socket.on("player-joined", (data) => {
  //     console.log(`Player ${data.userId} joined the game`);
  //   });

  //   // Listen for player left
  //   socket.on("player-left", (data) => {
  //     console.log(`Player ${data.userId} left the game`);
  //   });

  //   // Listen for game over
  //   socket.on("game-over", (data) => {
  //     const message = data.winner
  //       ? `Game Over! ${data.winner.toUpperCase()} wins by ${data.reason}!`
  //       : `Game Over! Draw by ${data.reason}`;
  //     alert(message);
  //   });

  //   // Handle connection errors
  //   socket.on("connect_error", (err) => {
  //     console.error("Connection error:", err);
  //     setError("Failed to connect to game server");
  //   });

  //   // Cleanup on unmount
  //   return () => {
  //     socket.emit("leave-game", { gameId: game.id });
  //     socket.off("connect");
  //     socket.off("game-state");
  //     socket.off("move-made");
  //     socket.off("game-error");
  //     socket.off("player-joined");
  //     socket.off("player-left");
  //     socket.off("game-over");
  //     socket.off("connect_error");
  //     socket.disconnect();
  //   };
  // }, [game.id]);

  // // Handler for piece drops
  // const onPieceDrop = ({
  //   piece,
  //   sourceSquare,
  //   targetSquare,
  // }: {
  //   piece: any;
  //   sourceSquare: string;
  //   targetSquare: string | null;
  // }): boolean => {
  //   if (!targetSquare || !socketRef.current) return false;

  //   // Clear any previous errors
  //   setError(null);

  //   // Send move to server for validation
  //   socketRef.current.emit("game-move", {
  //     gameId: game.id,
  //     from: sourceSquare,
  //     to: targetSquare,
  //   });

  //   // Return false to prevent optimistic UI update
  //   // Wait for server confirmation via "move-made" event
  //   return false;
  // };

  return (
    <div data-game-id={game.id}>
      {user?.id !== undefined && (
        <Chessboard
          options={{
            position,
            onPieceDrop,
            boardOrientation:
              user.id === game.whitePlayerId ? "white" : "black",
          }}
        />
      )}
    </div>
  );
};
