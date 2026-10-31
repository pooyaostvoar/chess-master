import { Router } from "express";
import { canViewUser, getUserById, getUserByUsername } from "../../services/user.service";
import { userSchemaBase } from "@chess-master/schemas";
import { User } from "../../database/entity/user";
import { UserStatus } from "../../database/entity/types";
import { logRequestError } from "../../utils/log-request-error";

export const router = Router();

function viewerId(req: { user?: unknown }): number | undefined {
  return req.user instanceof User ? req.user.id : undefined;
}

router.get("/username/:username", async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);
    if (!user || user.status === UserStatus.Disabled || !canViewUser(user, viewerId(req))) {
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
    if (!user || user.status === UserStatus.Disabled || !canViewUser(user, viewerId(req))) {
      return res.status(404).json({ error: "User not found" });
    }
    const parsedUser = userSchemaBase.parse(user);
    res.json({ status: "success", user: parsedUser });
  } catch (err) {
    logRequestError(req, err, "Error fetching user by id", { userId });
    res.status(500).json({ error: "Internal server error" });
  }
});
