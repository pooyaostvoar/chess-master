import { Router } from "express";
import { getGameById } from "../../services/game";

import { isAuthenticated } from "../../middleware/passport";

export const router = Router();

router.get("/:id", isAuthenticated, async (req, res) => {
  const gameId = req.params.id;

  try {
    const game = await getGameById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const userId = (req.user as any).id;
    if (
      game.whitePlayerId !== userId &&
      game.blackPlayerId !== userId &&
      game.blackPlayerId !== null &&
      game.whitePlayerId !== null
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this game" });
    }

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
  } catch (err) {
    console.error("Error fetching game:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
