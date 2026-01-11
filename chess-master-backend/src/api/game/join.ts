import { Router } from "express";
import { createGame, getGameById, joinGame } from "../../services/game";
import { isAuthenticated } from "../../middleware/passport";

export const router = Router();
router.post("/:id/join", isAuthenticated, async (req, res) => {
  const gameId = req.params.id;
  const userId = (req?.user as any)?.id;

  try {
    const game = await joinGame(gameId, userId);

    res.json({
      status: "success",
      game: {
        id: game.id,
        whitePlayerId: game.whitePlayerId,
        blackPlayerId: game.blackPlayerId,
        moves: game.moves,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
        finished: game.finished,
      },
    });
  } catch (err: any) {
    console.error("Error joining game:", err);

    if (err.message === "Game not found") {
      return res.status(404).json({ error: "Game not found" });
    }

    if (err.message === "Game already has two players") {
      return res.status(400).json({ error: "Game already has two players" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});
