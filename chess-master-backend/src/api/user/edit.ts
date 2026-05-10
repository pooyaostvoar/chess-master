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
        .json({ error: "Forbidden: You can only edit your own profile!" });
    }

    const {
      email,
      username,
      name,
      lastname,
      title,
      rating,
      bio,
      profileSections,
      isMaster,
      chesscomUrl,
      lichessUrl,
      hourlyRate,
      languages,
      teachingFocuses,
      phoneNumber,
      location,
      twitchUrl,
      youtubeUrl,
      instagramUrl,
      xUrl,
      facebookUrl,
      tiktokUrl,
    } = req.body;

    const updatedUser = await updateUser(userId, {
      email,
      username,
      name,
      lastname,
      title,
      rating,
      bio,
      profileSections: Array.isArray(profileSections)
        ? profileSections
            .map((section) => ({
              title: String(section?.title ?? "").trim(),
              content: String(section?.content ?? "").trim(),
            }))
            .filter((section) => section.title && section.content)
        : profileSections,
      isMaster,
      chesscomUrl,
      lichessUrl,
      hourlyRate,
      languages,
      teachingFocuses,
      phoneNumber,
      location,
      twitchUrl,
      youtubeUrl,
      instagramUrl,
      xUrl,
      facebookUrl,
      tiktokUrl,
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
