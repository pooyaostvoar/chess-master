import { Router } from "express";
import { isAuthenticated } from "../../middleware/passport";
import { getAuthenticatedUser } from "../../services/user.service";

export const router = Router();

router.get("/me", isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const user = await getAuthenticatedUser(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
