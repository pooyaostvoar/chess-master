import { Router } from "express";
import { isAuthenticated } from "../../middleware/passport";
import { AppDataSource } from "../../database/datasource";
import { User } from "../../database/entity/user";

export const router = Router();

router.patch("/:id", isAuthenticated, async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { email, username, title, rating, bio, isMaster, profilePicture, chesscomUrl, lichessUrl } = req.body;

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify user can only edit their own profile
    const authenticatedUserId = (req.user as any)?.id;
    if (authenticatedUserId !== userId) {
      return res.status(403).json({ error: "Forbidden: You can only edit your own profile" });
    }

    if (email !== undefined) user.email = email;
    if (username !== undefined) user.username = username;
    if (title !== undefined) user.title = title;
    if (rating !== undefined) user.rating = rating;
    if (bio !== undefined) user.bio = bio;
    if (isMaster !== undefined) user.isMaster = isMaster;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (chesscomUrl !== undefined) user.chesscomUrl = chesscomUrl;
    if (lichessUrl !== undefined) user.lichessUrl = lichessUrl;

    await userRepo.save(user);

    // Return user without sensitive data
    const formattedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      title: user.title,
      rating: user.rating,
      bio: user.bio,
      isMaster: user.isMaster,
      profilePicture: user.profilePicture,
      chesscomUrl: user.chesscomUrl,
      lichessUrl: user.lichessUrl,
    };

    res.json({ status: "success", user: formattedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
