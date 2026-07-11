import { Router } from "express";
import { getUserById, getUserByUsername } from "../../services/user.service";
import { userSchemaBase } from "@chess-master/schemas";
import { UserStatus } from "../../database/entity/types";
import { logRequestError } from "../../utils/log-request-error";

export const router = Router();

router.get("/username/:username", async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.status === UserStatus.Disabled) {
      return res.status(404).json({ error: "User not found" });
    }
    const parsedUser = userSchemaBase.parse(user);
    res.json({ status: "success", user: parsedUser });
  } catch (err) {
    logRequestError(req, err, "Error fetching user by username", {
      username: req.params.username,
    });
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
    if (user.status === UserStatus.Disabled) {
      return res.status(404).json({ error: "User not found" });
    }
    const parsedUser = userSchemaBase.parse(user);
    res.json({ status: "success", user: parsedUser });
  } catch (err) {
    logRequestError(req, err, "Error fetching user by id", { userId });
    res.status(500).json({ error: "Internal server error" });
  }
});
