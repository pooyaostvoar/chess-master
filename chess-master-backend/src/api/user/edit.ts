import { Router } from "express";
import { isAuthenticated } from "../../middleware/passport";
import { AppDataSource } from "../../database/datasource";
import { User } from "../../database/entity/user";

export const router = Router();

router.patch("/:id", isAuthenticated, async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { email, username, title, rating, bio, isMaster } = req.body;

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (email !== undefined) user.email = email;
    if (username !== undefined) user.username = username;
    if (title !== undefined) user.title = title;
    if (rating !== undefined) user.rating = rating;
    if (bio !== undefined) user.bio = bio;
    if (isMaster !== undefined) user.isMaster = isMaster;

    await userRepo.save(user);

    res.json({ status: "success", user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});
