import { Server, Socket } from "socket.io";
import { Chess, Square } from "chess.js";

import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types";
import { Game } from "../database/entity/game";
import { AppDataSource } from "../database/datasource";

// In-memory chess instances for active games
const activeGames = new Map<string, Chess>();

export function setupGameSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
) {
  io.on(
    "connection",
    (
      socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
    ) => {
      const userId = socket.data.user.id;

      // Join a game room
      socket.on("join-game", async ({ gameId }: { gameId: string }) => {
        try {
          const gameRepo = AppDataSource.getRepository(Game);
          const game = await gameRepo.findOne({ where: { id: gameId } });

          if (!game) {
            socket.emit("game-error", { message: "Game not found" });
            return;
          }

          // Verify user is part of this game
          if (game.whitePlayerId !== userId && game.blackPlayerId !== userId) {
            socket.emit("game-error", {
              message: "Not authorized for this game",
            });
            return;
          }

          const gameRoom = `game:${gameId}`;
          socket.join(gameRoom);

          // Initialize chess instance if not exists
          if (!activeGames.has(gameId)) {
            const chess = new Chess();

            // Replay all moves from database
            for (const move of game.moves) {
              chess.move({
                from: move.from as Square,
                to: move.to as Square,
              });
            }

            activeGames.set(gameId, chess);
          }

          // Send current game state to the joining player
          socket.emit("game-state", {
            gameId,
            fen: activeGames.get(gameId)!.fen(),
            moves: game.moves,
            turn: activeGames.get(gameId)!.turn(),
            isCheck: activeGames.get(gameId)!.isCheck(),
            isCheckmate: activeGames.get(gameId)!.isCheckmate(),
            isStalemate: activeGames.get(gameId)!.isStalemate(),
            isDraw: activeGames.get(gameId)!.isDraw(),
            isGameOver: activeGames.get(gameId)!.isGameOver(),
          });

          // Notify others in the room
          socket.to(gameRoom).emit("player-joined", { userId });

          console.log(`User ${userId} joined game ${gameId}`);
        } catch (err) {
          console.error("Failed to join game:", err);
          socket.emit("game-error", { message: "Failed to join game" });
        }
      });

      // Handle move
      socket.on(
        "game-move",
        async ({
          gameId,
          from,
          to,
          promotion,
        }: {
          gameId: string;
          from: string;
          to: string;
          promotion?: string;
        }) => {
          try {
            const gameRepo = AppDataSource.getRepository(Game);
            const game = await gameRepo.findOne({ where: { id: gameId } });

            if (!game) {
              socket.emit("game-error", { message: "Game not found" });
              return;
            }

            if (game.finished) {
              socket.emit("game-error", {
                message: "Game is already finished",
              });
              return;
            }

            // Get chess instance
            const chess = activeGames.get(gameId);
            if (!chess) {
              socket.emit("game-error", { message: "Game not initialized" });
              return;
            }

            // Verify it's the player's turn
            const currentTurn = chess.turn(); // 'w' or 'b'
            const isWhiteTurn = currentTurn === "w";
            const isPlayerWhite = game.whitePlayerId === userId;
            const isPlayerBlack = game.blackPlayerId === userId;

            if (
              (isWhiteTurn && !isPlayerWhite) ||
              (!isWhiteTurn && !isPlayerBlack)
            ) {
              socket.emit("game-error", { message: "Not your turn" });
              return;
            }

            // Attempt the move
            const move = chess.move({
              from: from as Square,
              to: to as Square,
              promotion: (promotion as "q" | "r" | "b" | "n") || "q",
            });

            if (!move) {
              socket.emit("game-error", { message: "Invalid move" });
              return;
            }

            // Save move to database
            game.moves.push({
              from: move.from,
              to: move.to,
              piece: move.piece,
            });

            // Check if game is over
            if (chess.isGameOver()) {
              game.finished = true;
            }

            await gameRepo.save(game);

            const gameRoom = `game:${gameId}`;

            // Broadcast move to all players in the game
            io.to(gameRoom).emit("move-made", {
              gameId,
              move: {
                from: move.from,
                to: move.to,
                piece: move.piece,
                captured: move.captured,
                promotion: move.promotion,
                flags: move.flags,
                san: move.san,
              },
              fen: chess.fen(),
              turn: chess.turn(),
              isCheck: chess.isCheck(),
              isCheckmate: chess.isCheckmate(),
              isStalemate: chess.isStalemate(),
              isDraw: chess.isDraw(),
              isGameOver: chess.isGameOver(),
            });

            console.log(`Move made in game ${gameId}: ${move.san}`);

            // If game is over, clean up
            if (chess.isGameOver()) {
              io.to(gameRoom).emit("game-over", {
                gameId,
                winner: chess.isCheckmate()
                  ? chess.turn() === "w"
                    ? "black"
                    : "white"
                  : null,
                reason: chess.isCheckmate()
                  ? "checkmate"
                  : chess.isStalemate()
                  ? "stalemate"
                  : chess.isDraw()
                  ? "draw"
                  : "unknown",
              });

              // Remove from active games after a delay
              setTimeout(() => {
                activeGames.delete(gameId);
              }, 60000); // Clean up after 1 minute
            }
          } catch (err) {
            console.error("Failed to process move:", err);
            socket.emit("game-error", { message: "Failed to process move" });
          }
        }
      );

      // Leave game
      socket.on("leave-game", async ({ gameId }: { gameId: string }) => {
        const gameRoom = `game:${gameId}`;
        socket.leave(gameRoom);
        socket.to(gameRoom).emit("player-left", { userId });
        console.log(`User ${userId} left game ${gameId}`);
      });

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: user=${userId}`);
      });
    }
  );
}
