import { Router } from "express";
import { createGame } from "../../services/game";
import { isAuthenticated } from "../../middleware/passport";

export const router = Router();

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const color = req.body.color;
    const game = await createGame(userId, color);

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
    console.error("Error creating game:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
