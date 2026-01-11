import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { getGameById } from "../../services/api/game.api";
import { GameBoard } from "./GameBoard";

import { Chess } from "chess.js";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../../services/config";
import { GameStatus, Game as GameType } from "./types";

const Game: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const chessRef = useRef<Chess>(new Chess());
  const { id: gameId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: isUserLoading } = useUser();
  const [game, setGame] = useState<GameType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchinGameError, setFetchinGameError] = useState<string | null>(null);
  const [position, setPosition] = useState(chessRef.current.fen());
  const [gameStatus, setGameStatus] = useState<GameStatus>({
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    turn: "w",
  });

  useEffect(() => {
    const fetchGame = async () => {
      if (!gameId) {
        setFetchinGameError("Game ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setFetchinGameError(null);
        const { game } = await getGameById(gameId);
        setGame(game);
      } catch (err: any) {
        setFetchinGameError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!isUserLoading) {
      fetchGame();
    }
  }, [gameId, isUserLoading]);

  useEffect(() => {
    if (!game) return;
    // Create socket connection with credentials
    const socket = io(SOCKET_URL, { withCredentials: true });

    socketRef.current = socket;

    // Wait for connection before joining game
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      // Join the game room
      socket.emit("join-game", { gameId: game.id });
    });

    // Listen for initial game state from server
    socket.on("game-state", (data) => {
      const chess = new Chess(data.fen);
      chessRef.current = chess;
      setPosition(data.fen);
      setGameStatus({
        isCheck: data.isCheck,
        isCheckmate: data.isCheckmate,
        isStalemate: data.isStalemate,
        isDraw: data.isDraw,
        turn: data.turn,
      });
      setError(null);
    });

    // Listen for moves from other players
    socket.on("move-made", (data) => {
      const chess = new Chess(data.fen);
      chessRef.current = chess;
      setPosition(data.fen);
      setGameStatus({
        isCheck: data.isCheck,
        isCheckmate: data.isCheckmate,
        isStalemate: data.isStalemate,
        isDraw: data.isDraw,
        turn: data.turn,
      });
      setError(null);
    });

    // Listen for errors
    socket.on("game-error", (data) => {
      setError(data.message);
      // Reset to last valid position
      setPosition(chessRef.current.fen());
    });

    // Listen for player joined
    socket.on("player-joined", (data) => {
      console.log(`Player ${data.userId} joined the game`);
      const newGame = { ...game };
      if (game.blackPlayerId === null) {
        newGame.blackPlayerId = data.userId;
      }
      if (game.whitePlayerId === null) {
        newGame.whitePlayerId = data.userId;
      }
      setGame(newGame);
    });

    // Listen for player left
    socket.on("player-left", (data) => {
      console.log(`Player ${data.userId} left the game`);
    });

    // Listen for game over
    socket.on("game-over", (data) => {
      const message = data.winner
        ? `Game Over! ${data.winner.toUpperCase()} wins by ${data.reason}!`
        : `Game Over! Draw by ${data.reason}`;
      alert(message);
    });

    // Handle connection errors
    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("Failed to connect to game server");
    });

    // Cleanup on unmount
    return () => {
      socket.emit("leave-game", { gameId: game.id });
      socket.off("connect");
      socket.off("game-state");
      socket.off("move-made");
      socket.off("game-error");
      socket.off("player-joined");
      socket.off("player-left");
      socket.off("game-over");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [game?.id]);

  const onPieceDrop = ({
    piece,
    sourceSquare,
    targetSquare,
  }: {
    piece: any;
    sourceSquare: string;
    targetSquare: string | null;
  }): boolean => {
    if (!targetSquare || !socketRef.current) return false;

    // Clear any previous errors
    setError(null);

    // Send move to server for validation
    socketRef.current.emit("game-move", {
      gameId: game?.id,
      from: sourceSquare,
      to: targetSquare,
    });

    // Return false to prevent optimistic UI update
    // Wait for server confirmation via "move-made" event
    return false;
  };

  if (isUserLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-5 text-center flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading game...</div>
      </div>
    );
  }

  if (fetchinGameError) {
    return (
      <div className="max-w-4xl mx-auto px-5 text-center flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/create-game")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Game
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="max-w-4xl mx-auto px-5 text-center flex justify-center items-center min-h-screen">
        <div>Game not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Game Board - 70% */}
        <div className="flex-[7] flex justify-center items-start">
          <div
            style={{
              width: "min(70vmin, 100%)",
              maxWidth: "100%",
            }}
          >
            <GameBoard
              game={game}
              onPieceDrop={onPieceDrop}
              position={position}
            />
          </div>
        </div>

        {/* Side Panel - 30% */}
        <div className="flex-[3] space-y-4">
          {/* Share Link Section */}
          {[game.blackPlayerId, game.whitePlayerId].includes(null) && user && (
            <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Invite Opponent
              </h3>
              <p className="text-blue-700 text-sm mb-3">
                Share this link with your opponent:
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/join-game/${game.id}`}
                  readOnly
                  className="w-full px-3 py-2 border border-blue-300 rounded bg-white text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/join-game/${game.id}`
                    );
                    alert("Link copied to clipboard!");
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}

          {/* Game Info */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Game Info</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                Game ID: <span className="font-mono text-xs">{game.id}</span>
              </p>
              {game.finished && (
                <p className="text-green-600 font-semibold">Game Finished</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
