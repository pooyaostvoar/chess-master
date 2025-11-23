import { Router } from "express";
import { isAuthenticated } from "../../middleware/passport";
import { updateUser } from "../../services/user.service";

export const router = Router();

router.patch("/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const authenticatedUserId = (req.user as any)?.id;

    // Verify user can only edit their own profile
    if (authenticatedUserId !== userId) {
      return res
        .status(403)
        .json({ error: "Forbidden: You can only edit your own profile" });
    }

    const {
      email,
      username,
      title,
      rating,
      bio,
      isMaster,
      profilePicture,
      chesscomUrl,
      lichessUrl,
    } = req.body;

    const updatedUser = await updateUser(userId, {
      email,
      username,
      title,
      rating,
      bio,
      isMaster,
      profilePicture,
      chesscomUrl,
      lichessUrl,
    });

    res.json({ status: "success", user: updatedUser });
  } catch (err: any) {
    console.error("Error updating user:", err);
    if (err.message === "User not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
