import { Router } from "express";
import { getUserById, getUserByUsername } from "../../services/user.service";
import { userSchemaBase } from "@chess-master/schemas";

export const router = Router();

router.get("/username/:username", async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const parsedUser = userSchemaBase.parse(user);
    res.json({ status: "success", user: parsedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const parsedUser = userSchemaBase.parse(user);
    res.json({ status: "success", user: parsedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
