import { Router } from "express";
import { findUsers } from "../../services/user.service";
import { userListSchema } from "@chess-master/schemas";

export const router = Router();

router.get("", async (req, res) => {
  try {
    const { username, email, title, isMaster, minRating, maxRating } =
      req.query;

    const filters = {
      username: username as string | undefined,
      email: email as string | undefined,
      title: title as string | undefined,
      isMaster: isMaster !== undefined ? isMaster === "true" : undefined,
      minRating: minRating ? parseInt(minRating as string, 10) : undefined,
      maxRating: maxRating ? parseInt(maxRating as string, 10) : undefined,
    };

    const users = await findUsers(filters);
    const parsedUsers = userListSchema.parse(users);
    res.json({ status: "success", users: parsedUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
