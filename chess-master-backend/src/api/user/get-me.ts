import { Router } from "express";
import { isAuthenticated } from "../../middleware/passport";
import { AppDataSource } from "../../database/datasource";
import { User } from "../../database/entity/user";

export const router = Router();
router.get("/me", isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { id: userId },
      select: ["id", "username", "email", "title", "rating", "bio", "isMaster"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
