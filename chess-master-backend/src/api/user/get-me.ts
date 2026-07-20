import { Router } from "express";
import { isAuthenticated } from "../../middleware/passport";
import { getUserById } from "../../services/user.service";
import { getMeUserSchema } from "@chess-master/schemas";
import { logRequestError } from "../../utils/log-request-error";

export const router = Router();

router.get("/me", isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const parsedUser = getMeUserSchema.parse(user);
    res.json({ user: parsedUser });
  } catch (err) {
    logRequestError(req, err, "Error fetching current user");
    res.status(500).json({ error: "Internal server error" });
  }
});
